const R = require('ramda');
const CryptoUtil = require('../util/cryptoUtil');
const CryptoEdDSAUtil = require('../util/cryptoEdDSAUtil');
const ArgumentError = require('../util/argumentError');
const Transaction = require('../blockchain/transaction');

class TransactionBuilder {
    constructor(walletid,eventid,type,secretKey) {
        //this.listOfUTXO = null;
        this.outputAddresses = null;
        //this.totalAmount = null;
        //this.changeAddress = null;
        this.walletid = walletid;
        this.type = type;
        this.secretKey = secretKey;
        this.eventid = eventid;
        this.feeAmount = 0;
    }

    from(listOfUTXO) {
        this.listOfUTXO = listOfUTXO;
        return this;
    }

    to(address, amount) {
        this.outputAddress = address;
        this.totalAmount = amount;
        return this;
    }

    change(changeAddress) {
        this.changeAddress = changeAddress;
        return this;
    }

    fee(amount) {
        this.feeAmount = amount;
        return this;
    }

    sign(secretKey) {
        this.secretKey = secretKey;
        return this;
    }

    type(type) {
        this.type = type;
    }

    build() {

        // The remaining value is the fee to be collected by the block's creator.        

        return Transaction.fromJson({
            id: CryptoUtil.randomId(64),
            hash: null,
            secretkey: this.secretKey,
            studentid: this.walletid,
            eventid: this.eventid,
            type: this.type,
            timestamp : Math.floor(Date.now() / 1000)
        });
    }
}

module.exports = TransactionBuilder;