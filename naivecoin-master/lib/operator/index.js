const R = require('ramda');
const Wallets = require('./wallets');
const Wallet = require('./wallet');
const Transaction = require('../blockchain/transaction');
const TransactionBuilder = require('./transactionBuilder');
const Db = require('../util/db');
const ArgumentError = require('../util/argumentError');
const Config = require('../config');
const Blocks = require('./../blockchain/blocks');
const Block = require('./../blockchain/block');
const EventEmitter = require('events');

const OPERATOR_FILE = 'wallets.json';
const BLOCKCHAIN_FILE = 'blocks.json';


class Operator {
    constructor(dbName, blockchain) {
        this.blocksDb = new Db('data/' + dbName + '/' + BLOCKCHAIN_FILE, new Blocks());
        this.db = new Db('data/' + dbName + '/' + OPERATOR_FILE, new Wallets());

        // INFO: In this implementation the database is a file and every time data is saved it rewrites the file, probably it should be a more robust database for performance reasons
        this.wallets = this.db.read(Wallets);
        this.blocks = this.blocksDb.read(Blocks);
        this.blockchain = blockchain;
        // Some places uses the emitter to act after some data is changed
        this.emitter = new EventEmitter();
        this.init();

    }
    init() {
        // Create the genesis block if the blockchain is empty
        if (this.blocks.length == 0) {
            console.info('Blockchain empty, adding genesis block');
            this.blocks.push(Block.genesis);
            this.blocksDb.write(this.blocks);
        }
    }


    addWallet(wallet) {
        this.wallets.push(wallet);
        this.db.write(this.wallets);
        return wallet;
    }

    createWalletFromPassword(id, password) {
        let newWallet = Wallet.fromPassword(id, password);
        return this.addWallet(newWallet);
    }    

    checkWalletPassword(walletId, passwordHash) {
        let wallet = this.getWalletById(walletId);
        if (wallet == null) throw new ArgumentError(`Wallet not found with id '${walletId}'`);

        return wallet.passwordHash == passwordHash;
    }

    getWallets() {
        return this.wallets;
    }

    getWalletById(walletId) {
        return R.find((wallet) => { return wallet.id == walletId; }, this.wallets);
    }

    generateAddressForWallet(walletId) {
        let wallet = this.getWalletById(walletId);
        if (wallet == null) throw new ArgumentError(`Wallet not found with id '${walletId}'`);

        let address = wallet.generateAddress();
        this.db.write(this.wallets);
        return address;
    }

    getAddressesForWallet(walletId) {
        let wallet = this.getWalletById(walletId);
        if (wallet == null) throw new ArgumentError(`Wallet not found with id '${walletId}'`);

        let addresses = wallet.getAddresses();
        return addresses;
    }    

    getBalanceForAddress(addressId) {
        // let utxo = this.blockchain.getUnspentTransactionsForAddress(addressId);
        //
        // if (utxo == null || utxo.length == 0) throw new ArgumentError(`No transactions found for address '${addressId}'`);
        // return R.sum(R.map(R.prop('amount'), utxo));

        const wallet = this.wallets.find(wallet => wallet.id === addressId);
        if (!wallet) {
            throw new Error(`Wallet not found with address ID '${addressId}'`);
        }
        return wallet.getBalance();
    }

    AddBalanceForAddress(addressId,amount) {
        // let utxo = this.blockchain.getUnspentTransactionsForAddress(addressId);
        //
        // if (utxo == null || utxo.length == 0) throw new ArgumentError(`No transactions found for address '${addressId}'`);
        // return R.sum(R.map(R.prop('amount'), utxo));

        const wallet = this.wallets.find(wallet => wallet.id === addressId);
        if (!wallet) {
            throw new Error(`Wallet not found with address ID '${addressId}'`);
        }
        wallet.addBalance(amount,this);
    }

    createTransaction(walletId,eventid,type,secretkey) {
        //let utxo = this.blockchain.getUnspentTransactionsForAddress(fromAddressId);
        let wallet = this.getWalletById(walletId);

        if (wallet == null) throw new ArgumentError(`Wallet not found with id '${walletId}'`);

        //let secretKey = wallet.getSecretKeyByAddress(fromAddressId);

        let secretKey = secretkey;

        if (secretKey == null) throw new ArgumentError(`Secret key not found with Wallet id '${walletId}''`);

        let tx = new TransactionBuilder(walletId,eventid,type,secretkey);
        //tx.from(utxo);
        //tx.to(toAddressId, amount);
        //tx.change(changeAddressId || fromAddressId);
        //tx.fee(Config.FEE_PER_TRANSACTION);
        tx.sign(secretKey);
        let txFinal = Transaction.fromJson(tx.build());
        txFinal.signTransaction();

        return txFinal;
    }
}

module.exports = Operator;