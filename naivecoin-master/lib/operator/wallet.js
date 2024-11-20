const R = require('ramda');
const CryptoUtil = require('../util/cryptoUtil');
const CryptoEdDSAUtil = require('../util/cryptoEdDSAUtil');

class Wallet {
    constructor() {
        this.id = null;
        this.passwordHash = null;
        this.secret = null;
        this.balance = 0;
        this.keyPairs = [];
    }

    generateAddress() {
        // If secret is null means it is a brand new wallet
        if (this.secret == null) {
            this.generateSecret();
        }
        this.balance = 0;
        let lastKeyPair = R.last(this.keyPairs);
        
        // Generate next seed based on the first secret or a new secret from the last key pair.
        let seed = (lastKeyPair == null ?  this.secret : CryptoEdDSAUtil.generateSecret(R.propOr(null, 'secretKey', lastKeyPair)));
        let keyPairRaw = CryptoEdDSAUtil.generateKeyPairFromSecret(seed);
        let newKeyPair = {
            index: this.keyPairs.length + 1,
            secretKey: CryptoEdDSAUtil.toHex(keyPairRaw.getSecret()),
            publicKey: CryptoEdDSAUtil.toHex(keyPairRaw.getPublic())
        };
        this.keyPairs.push(newKeyPair);
        return newKeyPair.publicKey;
    }

    // 增加余额
    addBalance(amount,operator) {
        if (amount < 0) {
            throw new Error('Amount to add must be greater than 0.');
        }
        this.balance += amount;

        console.info(`Wallet ${this.id}: Balance increased by ${amount}. New balance: ${this.balance}`);

        // 更新存储文件
        if (operator && operator.db) {
            console.info('Updating wallet storage file...');
            operator.db.write(operator.wallets);
        }
    }

    // 获取余额
    getBalance() {
        return this.balance;
    }

    generateSecret() {
        this.secret = CryptoEdDSAUtil.generateSecret(this.passwordHash);
        return this.secret;
    }


    getAddressByIndex(index) {
        return R.propOr(null, 'publicKey', R.find(R.propEq('index', index), this.keyPairs));
    }

    getAddressByPublicKey(publicKey) {
        return R.propOr(null, 'publicKey', R.find(R.propEq('publicKey', publicKey), this.keyPairs));
    }

    getSecretKeyByAddress(address) {
        return R.propOr(null, 'secretKey', R.find(R.propEq('publicKey', address), this.keyPairs));
    }

    getAddresses() {
        return R.map(R.prop('publicKey'), this.keyPairs);
    }

    static fromPassword(id, password) {
        let wallet = new Wallet();
        wallet.id = id; //CryptoUtil.randomId();
        wallet.passwordHash = CryptoUtil.hash(password);
        return wallet;
    }

    static fromHash(passwordHash) {
        let wallet = new Wallet();
        wallet.id = id; //CryptoUtil.randomId();
        wallet.passwordHash = passwordHash;
        return wallet;
    }

    static fromJson(data) {
        let wallet = new Wallet();
        R.forEachObjIndexed((value, key) => { wallet[key] = value; }, data);
        return wallet;
    }
}

module.exports = Wallet;