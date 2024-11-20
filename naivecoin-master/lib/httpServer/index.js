const express = require('express');
const bodyParser = require('body-parser');
const swaggerUi = require('swagger-ui-express');
const R = require('ramda');
const path = require('path');
const swaggerDocument = require('./swagger.json');
const Block = require('../blockchain/block');
const Transaction = require('../blockchain/transaction');
const TransactionAssertionError = require('../blockchain/transactionAssertionError');
const BlockAssertionError = require('../blockchain/blockAssertionError');
const HTTPError = require('./httpError');
const ArgumentError = require('../util/argumentError');
const CryptoUtil = require('../util/cryptoUtil');
const timeago = require('timeago.js');
const Certificate = require('../blockchain/certificate');
const cors = require('cors');
const {generateKeyPairFromSecret, toHex} = require("../util/cryptoEdDSAUtil");

class HttpServer {
    constructor(node, blockchain, operator, miner) {
        this.app = express();
        this.app.use(cors());  // 允许所有来源

        const projectWallet = (wallet) => {
            return {
                id: wallet.id,
                addresses: R.map((keyPair) => {
                    return keyPair.publicKey;
                }, wallet.keyPairs)
            };
        };


        const getKeyPairs = (wallet) => {
            return {
                addresses: wallet.keyPairs.map((keyPair) => ({
                    publicKey: keyPair.publicKey,
                    secretKey: keyPair.secretKey,
                }))
            };
        };


        this.app.use(bodyParser.json());

        this.app.set('view engine', 'pug');
        this.app.set('views', path.join(__dirname, 'views'));
        this.app.locals.formatters = {
            time: (rawTime) => {
                const timeInMS = new Date(rawTime * 1000);
                return `${timeInMS.toLocaleString()} - ${timeago().format(timeInMS)}`;
            },
            hash: (hashString) => {
                return hashString != '0' ? `${hashString.substr(0, 5)}...${hashString.substr(hashString.length - 5, 5)}` : '<empty>';
            },
            amount: (amount) => amount.toLocaleString()
        };
        this.app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

        this.app.get('/blockchain', (req, res) => {
            if (req.headers['accept'] && req.headers['accept'].includes('text/html'))
                res.render('blockchain/index.pug', {
                    pageTitle: 'Blockchain',
                    blocks: blockchain.getAllBlocks()
                });
            else
                throw new HTTPError(400, 'Accept content not supported');
        });

        this.app.get('/blockchain/blocks', (req, res) => {
            res.status(200).send(blockchain.getAllBlocks());
        });

        this.app.get('/blockchain/blocks/latest', (req, res) => {
            let lastBlock = blockchain.getLastBlock();
            if (lastBlock == null) throw new HTTPError(404, 'Last block not found');

            res.status(200).send(lastBlock);
        });

        this.app.put('/blockchain/blocks/latest', (req, res) => {
            let requestBlock = Block.fromJson(req.body);
            let result = node.checkReceivedBlock(requestBlock);

            if (result == null) res.status(200).send('Requesting the blockchain to check.');
            else if (result) res.status(200).send(requestBlock);
            else throw new HTTPError(409, 'Blockchain is update.');
        });

        this.app.get('/blockchain/blocks/:hash([a-zA-Z0-9]{64})', (req, res) => {
            let blockFound = blockchain.getBlockByHash(req.params.hash);
            if (blockFound == null) throw new HTTPError(404, `Block not found with hash '${req.params.hash}'`);

            res.status(200).send(blockFound);
        });

        this.app.get('/blockchain/blocks/:index', (req, res) => {
            let blockFound = blockchain.getBlockByIndex(parseInt(req.params.index));
            if (blockFound == null) throw new HTTPError(404, `Block not found with index '${req.params.index}'`);

            res.status(200).send(blockFound);
        });

        this.app.get('/blockchain/blocks/transactions/:transactionId([a-zA-Z0-9]{64})', (req, res) => {
            let transactionFromBlock = blockchain.getTransactionFromBlocks(req.params.transactionId);
            if (transactionFromBlock == null) throw new HTTPError(404, `Transaction '${req.params.transactionId}' not found in any block`);

            res.status(200).send(transactionFromBlock);
        });

        this.app.get('/blockchain/transactions', (req, res) => {
            if (req.headers['accept'] && req.headers['accept'].includes('text/html'))
                res.render('blockchain/transactions/index.pug', {
                    pageTitle: 'Unconfirmed Transactions',
                    transactions: blockchain.getAllTransactions()
                });
            else
                res.status(200).send(blockchain.getAllTransactions());
        });

        this.app.get('/blockchain/certificates', (req, res) => {
            try {
                if (req.headers['accept'] && req.headers['accept'].includes('text/html')) {
                    // 如果请求头接受 HTML，则渲染证书列表页面
                    res.render('blockchain/certificates/index.pug', {
                        pageTitle: 'Certificates',
                        certificates: blockchain.getAllTransactions() // 获取所有证书
                    });
                } else {
                    // 否则返回 JSON 数据
                    res.status(200).send(blockchain.getAllTransactions());
                }
            } catch (err) {
                console.error('Error fetching certificates:', err);
                res.status(500).send({ error: 'Internal server error', details: err.message });
            }
        });

        // this.app.post('/blockchain/certificates', (req, res) => {
        //     let requestCertificate = Certificate.fromJson(req.body);
        //     console.log('Request Certificate ID:', requestCertificate.id);
        //     let certificateFound = blockchain.getCertificateById(requestCertificate.id);
        //
        //     if (certificateFound != null) throw new HTTPError(409, `Certificate '${requestCertificate.id}' already exists`);
        //
        //     try {
        //         let newCertificate = blockchain.addCertificate(requestCertificate);
        //         res.status(201).send(newCertificate);
        //     } catch (ex) {
        //         if (ex instanceof TransactionAssertionError) throw new HTTPError(400, ex.message, requestTransaction, ex);
        //         else throw ex;
        //     }
        // });

        this.app.get('/blockchain/transactions/unspent', (req, res) => {
            res.status(200).send(blockchain.getUnspentTransactionsForAddress(req.query.address));
        });

        this.app.get('/student/wallets', (req, res) => {
            let wallets = operator.getWallets();

            let projectedWallets = R.map(projectWallet, wallets);

            res.status(200).send(projectedWallets);
        });

        this.app.post('/student/wallets', (req, res) => {
            let id = req.body.id;
            let password = req.body.password;
            if (R.match(/\w+/g, password).length <= 4) throw new HTTPError(400, 'Password must contain more than 4 words');

            let newWallet = operator.createWalletFromPassword(id, password);

            let projectedWallet = projectWallet(newWallet);

            res.status(201).send(projectedWallet);
        });

        this.app.post('/student/wallets', (req, res) => {
            let id = req.body.id;
            let password = req.body.password;
            if (R.match(/\w+/g, password).length <= 4) throw new HTTPError(400, 'Password must contain more than 4 words');

            let newWallet = operator.createWalletFromPassword(id, password);

            let projectedWallet = projectWallet(newWallet);

            res.status(201).send(projectedWallet);
        });

        this.app.get('/student/wallets/:walletId', (req, res) => {
            let walletFound = operator.getWalletById(req.params.walletId);
            if (walletFound == null) throw new HTTPError(404, `Wallet not found with id '${req.params.walletId}'`);

            let projectedWallet = projectWallet(walletFound);

            res.status(200).send(projectedWallet);
        });


        this.app.get('/student/wallets/keypairs/:walletId', (req, res) => {
            let walletFound = operator.getWalletById(req.params.walletId);
            if (walletFound == null) throw new HTTPError(404, `Wallet not found with id '${req.params.walletId}'`);

            let keyPairs = getKeyPairs(walletFound);

            res.status(200).send(keyPairs);
        });

        
        this.app.post('/student/wallets/:walletId/addresses', (req, res) => {
            let walletId = req.params.walletId;
            let password = req.headers.password;

            if (password == null) throw new HTTPError(401, 'Wallet\'s password is missing.');
            let passwordHash = CryptoUtil.hash(password);

            try {
                if (!operator.checkWalletPassword(walletId, passwordHash)) throw new HTTPError(403, `Invalid password for wallet '${walletId}'`);

                let newAddress = operator.generateAddressForWallet(walletId);
                res.status(201).send({ address: newAddress });
            } catch (ex) {
                if (ex instanceof ArgumentError) throw new HTTPError(400, ex.message, walletId, ex);
                else throw ex;
            }
        });

        this.app.get('/student/wallets/:walletId/addresses', (req, res) => {
            let walletId = req.params.walletId;
            try {
                let addresses = operator.getAddressesForWallet(walletId);
                res.status(200).send(addresses);
            } catch (ex) {
                if (ex instanceof ArgumentError) throw new HTTPError(400, ex.message, walletId, ex);
                else throw ex;
            }
        });


        this.app.post('/student/wallets/:walletId/certificates', (req, res) => {
            let walletId = req.params.walletId;
            const { eventid, type, secretKey } = req.body;
            //let secretKey = req.body.secrekey;
            let password = req.headers.password;
            if (password == null) throw new HTTPError(401, 'Wallet\'s password is missing.');
        
            let address = operator.getAddressesForWallet(walletId)[0];
        
            //私钥校验
            const keyPair = generateKeyPairFromSecret(secretKey); // 通过 secretKey 生成密钥对
            const derivedAddress = toHex(keyPair.getPublic());   // 获取公钥并转为 hex 格式
        
            if (derivedAddress !== address) {
                throw new HTTPError(400, 'Provided secretKey does not match the address private key.');
            }
        
            let passwordHash = CryptoUtil.hash(password);
            try {
                if (!operator.checkWalletPassword(walletId, passwordHash)) throw new HTTPError(403, `Invalid password for wallet '${walletId}'`);
                let newTransaction = operator.createTransaction(walletId,eventid,type,secretKey);
                newTransaction.check();
        
                let transactionCreated = blockchain.addTransaction(Transaction.fromJson(newTransaction));
                res.status(201).send(transactionCreated);
            } catch (ex) {
                if (ex instanceof ArgumentError || ex instanceof TransactionAssertionError) throw new HTTPError(400, ex.message, walletId, ex);
                else throw ex;
            }
        });

        this.app.post('/student/wallets/:walletId/addresses', (req, res) => {
            let walletId = req.params.walletId;
            let password = req.headers.password;

            if (password == null) throw new HTTPError(401, 'Wallet\'s password is missing.');
            let passwordHash = CryptoUtil.hash(password);

            try {
                if (!operator.checkWalletPassword(walletId, passwordHash)) throw new HTTPError(403, `Invalid password for wallet '${walletId}'`);

                let newAddress = operator.generateAddressForWallet(walletId);
                res.status(201).send({ address: newAddress });
            } catch (ex) {
                if (ex instanceof ArgumentError) throw new HTTPError(400, ex.message, walletId, ex);
                else throw ex;
            }
        });

        this.app.get('/student/:addressId/balance', (req, res) => {
            let addressId = req.params.addressId;

            try {
                let balance = operator.getBalanceForAddress(addressId);
                //let balance = addressId.getBalance();
                res.status(200).send({ balance: balance });
            } catch (ex) {
                if (ex instanceof ArgumentError) throw new HTTPError(404, ex.message, { addressId }, ex);
                else throw ex;
            }
        });

        this.app.get('/node/peers', (req, res) => {
            res.status(200).send(node.peers);
        });

        this.app.post('/node/peers', (req, res) => {
            let newPeer = node.connectToPeer(req.body);
            res.status(201).send(newPeer);
        });

        this.app.get('/node/transactions/:transactionId([a-zA-Z0-9]{64})/confirmations', (req, res) => {
            node.getConfirmations(req.params.transactionId)
                .then((confirmations) => {
                    res.status(200).send({ confirmations: confirmations });
                });
        });

        this.app.post('/miner/mine', (req, res, next) => {
            const {rewardId} = req.body;

            let addresses = operator.getAddressesForWallet(rewardId);

            let address = addresses[0];
            miner.mine(rewardId,address,operator)
                .then((newBlock) => {
                    newBlock = Block.fromJson(newBlock);
                    blockchain.addBlock(newBlock);
                    res.status(201).send(newBlock);
                })
                .catch((ex) => {
                    if (ex instanceof BlockAssertionError && ex.message.includes('Invalid index')) next(new HTTPError(409, 'A new block were added before we were able to mine one'), null, ex);
                    else next(ex);
                });
        });


        this.app.get('/teacher/queryWeeks', (req, res) => {
            let studentId = req.query.studentid;
            let weeks = req.query.weekNum;

            console.log(studentId + " : "+weeks)
            if (!weeks || weeks <= 0) {
                return res.status(400).send({ error: 'Invalid weekNum. It must be a positive integer.' });
            }

            const now = Math.floor(Date.now() / 1000);
            const startTime = now - weeks * 7 * 24 * 60 * 60; // 最近几周的起始时间戳

            console.info(`Querying certifications for studentId: ${studentId}, from timestamp: ${startTime} to now: ${now}`);

            try {
                const certifications = blockchain.certificates;

                // 根据时间戳和 studentId 筛选
                const filteredCertifications = certifications.filter(cert => {
                    return (!studentId || cert.studentid === studentId) && cert.timestamp >= startTime;
                });

                console.info(`Found ${filteredCertifications.length} certifications matching criteria.`);

                res.status(200).send({
                    studentId,
                    weeks,
                    certifications: filteredCertifications
                });
            } catch (err) {
                console.error('Error querying certifications:', err.message);
                res.status(500).send({ error: 'Internal server error', details: err.message });
            }
        });

        this.app.get('/teacher/queryClass', (req, res) => {
            const classId = req.query.classid;

            if (!classId) {
                return res.status(400).send({ error: 'Missing classId. Please provide a valid classId to query.' });
            }
            console.info(`Querying certificates for classId: ${classId}`);

            try {
                const certificates = blockchain.certificates;

                const filteredCertificates = certificates.filter(cert => cert.eventid === classId);
                console.info(`Found ${filteredCertificates.length} certificates for classId: ${classId}`);

                // 返回筛选结果
                res.status(200).send({
                    classId,
                    count: filteredCertificates.length,
                    certificates: filteredCertificates
                });
            } catch (err) {
                console.error('Error querying certificates:', err.message);
                res.status(500).send({ error: 'Internal server error', details: err.message });
            }
        });

        this.app.use(function (err, req, res, next) {  // eslint-disable-line no-unused-vars
            if (err instanceof HTTPError) res.status(err.status);
            else res.status(500);
            res.send(err.message + (err.cause ? ' - ' + err.cause.message : ''));
        });
    }

    listen(host, port) {
        return new Promise((resolve, reject) => {
            this.server = this.app.listen(port, host, (err) => {
                if (err) reject(err);
                console.info(`Listening http on port: ${this.server.address().port}, to access the API documentation go to http://${host}:${this.server.address().port}/api-docs/`);
                resolve(this);
            });
        });
    }

    stop() {
        return new Promise((resolve, reject) => {
            this.server.close((err) => {
                if (err) reject(err);
                console.info('Closing http');
                resolve(this);
            });
        });
    }
}

module.exports = HttpServer;