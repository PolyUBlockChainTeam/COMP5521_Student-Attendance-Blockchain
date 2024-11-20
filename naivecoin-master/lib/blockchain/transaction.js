const R = require('ramda');
const CryptoUtil = require('../util/cryptoUtil');
const CryptoEdDSAUtil = require('../util/cryptoEdDSAUtil');
const TransactionAssertionError = require('./transactionAssertionError');
const Config = require('../config');

/*
Transaction structure:
{ // Transaction
    "id": "84286bba8d...7477efdae1", // random id (64 bytes)
    "hash": "f697d4ae63...c1e85f0ac3", // hash taken from the contents of the transaction: sha256 (id + data) (64 bytes)
    "type": "regular", // transaction type (regular, fee, reward)
    "data": {
        "inputs": [ // Transaction inputs
            {
                "transaction": "9e765ad30c...e908b32f0c", // transaction hash taken from a previous unspent transaction output (64 bytes)
                "index": "0", // index of the transaction taken from a previous unspent transaction output
                "amount": 5000000000, // amount of satoshis
                "address": "dda3ce5aa5...b409bf3fdc", // from address (64 bytes)
                "signature": "27d911cac0...6486adbf05" // transaction input hash: sha256 (transaction + index + amount + address) signed with owner address's secret key (128 bytes)
            }
        ],
        "outputs": [ // Transaction outputs
            {
                "amount": 10000, // amount of satoshis
                "address": "4f8293356d...b53e8c5b25" // to address (64 bytes)
            },
            {
                "amount": 4999989999, // amount of satoshis
                "address": "dda3ce5aa5...b409bf3fdc" // change address (64 bytes)
            }
        ]
    }
}
*/

class Transaction {
    construct() {
        this.id = null;
        this.hash = null;
        this.type = type;
        // this.data = {
        //     inputs: [],
        //     outputs: []
        // };
        this.studentid = walletid;       // 学生 ID
        this.eventid = eventid;           // 活动 ID
        this.timestamp = Math.floor(Date.now() / 1000); // 时间戳（秒）
        // 生成签名
        this.signature = null;
        this.secretkey = secretkey;
    }

    toHash() {
        // INFO: There are different implementations of the hash algorithm, for example: https://en.bitcoin.it/wiki/Hashcash
        //return CryptoUtil.hash(this.id + this.studentid + this.eventid + this.type + JSON.stringify(this.data));
        return CryptoUtil.hash(this.studentid + this.eventid + this.type + this.timestamp);
    }

    signTransaction() {
        // 计算交易哈希
        this.hash = this.toHash();

        // 生成密钥对
        const keyPair = CryptoEdDSAUtil.generateKeyPairFromSecret(this.secretkey);

        if (!keyPair._secret) {
            console.error('KeyPair cannot sign: Missing _secret attribute.');
            throw new Error('KeyPair can only verify, not sign.');
        }

        // 对哈希签名
        this.signature = CryptoEdDSAUtil.signHash(keyPair, this.hash);
        console.info(`Transaction signed. ID: ${this.id}, Signature: ${this.signature}`);
    }

    verifySignature(rewardAddress) {
        if (!this.signature || !this.hash) {
            throw new Error('Transaction is missing hash or signature');
        }
        // 使用公钥（studentid）验证签名
        const isValid = CryptoEdDSAUtil.verifySignature(rewardAddress, this.signature, this.hash);
        if (!isValid) {
            throw new TransactionAssertionError(`Invalid signature for transaction '${this.id}'`, this);
        }

        return true;
    }

    check() {
        // Check if the transaction hash is correct
        let isTransactionHashValid = this.hash == this.toHash();

        if (!isTransactionHashValid) {
            console.error(`Invalid transaction hash '${this.hash}'`);
            throw new TransactionAssertionError(`Invalid transaction hash '${this.hash}'`, this);
        }

        return true;
    }

    static fromJson(data) {
        let transaction = new Transaction();
        R.forEachObjIndexed((value, key) => { transaction[key] = value; }, data);
        transaction.hash = transaction.toHash();
        return transaction;
    }
}

module.exports = Transaction;
