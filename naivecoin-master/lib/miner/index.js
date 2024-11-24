const R = require('ramda');
const spawn = require('threads').spawn;
const Block = require('../blockchain/block');
const CryptoUtil = require('../util/cryptoUtil');
const Transaction = require('../blockchain/transaction');
const Config = require('../config');
const Operator = require("../operator");
const fs = require('fs');

class Miner {
        //store the target difficulty by index
    static blockIndexToDifficultyMapping = new Map();
    constructor(blockchain, logLevel) {
        const data = Miner.loadDataFromFile('data.json');
        if (data) {
            Miner.blockIndexToDifficultyMapping = data;
        }
        this.blockchain = blockchain;
        this.logLevel = logLevel;
    }
    // Write map data to a JSON file (append mode)
    static writeDataToFile(filename) {
        const existingData = Miner.loadDataFromFile(filename) || [];
        const newData = Array.from(Miner.blockIndexToDifficultyMapping);
        const combinedData = new Map([...existingData, ...newData]);
        fs.writeFileSync(filename, JSON.stringify(Array.from(combinedData)));
        console.log('Data appended to file.');
}
// Load map data from a JSON file
    static loadDataFromFile(filename) {
        try {
            const data = fs.readFileSync(filename, 'utf8');
            return new Map(JSON.parse(data));
        } catch (err) {
            console.error('Error loading data from file:', err);
            return null;
        }
    }
    mine(rewardId,rewardAddress,operator) {
        let baseBlock = Miner.generateNextBlock(rewardId,rewardAddress, this.blockchain,operator);
        process.execArgv = R.reject((item) => item.includes('debug'), process.execArgv);
        let Difficulty = Miner.dynamicDifficulty(this.blockchain);
        /* istanbul ignore next */
        /*const thread = spawn(function (input, done) {
            //eslint-disable
            require(input.__dirname + '/../util/consoleWrapper.js')('mine-worker', input.logLevel);
            const Block = require(input.__dirname + '/../blockchain/block');
            const Miner = require(input.__dirname);
            //eslint-enable

            done(Miner.proveWorkFor(Block.fromJson(input.jsonBlock), input.difficulty));
        });*/
        const Block = require(__dirname + '/../blockchain/block');
        const transactionList = R.pipe(
            R.countBy(R.prop('type')),
            R.toString,
            R.replace('{', ''),
            R.replace('}', ''),
            R.replace(/"/g, '')
        )(baseBlock.transactions);
        console.info(`Mining a new block with ${baseBlock.transactions.length} (${transactionList}) transactions`);

        /*const promise = thread.promise().then((result) => {
            thread.kill();
            return result;
        });

        thread.send({
            __dirname: __dirname,
            logLevel: this.logLevel,
            jsonBlock: baseBlock,
            difficulty: this.blockchain.getDifficulty()
        });

        return promise;*/
         return new Promise((resolve, reject) => {
        try {
            const result = Miner.proveWorkFor(Block.fromJson(baseBlock), Difficulty);
            resolve(result);
        } catch (error) {
            reject(error);
        }
    });
    }

    static generateNextBlock(rewardId,rewardAddress, blockchain ,operator) {
        const previousBlock = blockchain.getLastBlock();
        const index = previousBlock.index + 1;
        const previousHash = previousBlock.hash;
        const timestamp = new Date().getTime() / 1000;
        const blocks = blockchain.getAllBlocks();
        const candidateTransactions = blockchain.transactions;
        const transactionsInBlocks = R.flatten(R.map(R.prop('transactions'), blocks));
        //const inputTransactionsInTransaction = R.compose(R.flatten, R.map(R.compose(R.prop('inputs'), R.prop('data'))));
        // Select transactions that can be mined         
        let rejectedTransactions = [];
        let selectedTransactions = [];

        R.forEach(transaction => {
            try {
                transaction.verifySignature(rewardAddress); // 验证签名
                selectedTransactions.push(transaction);
            } catch (err) {
                console.error(`Invalid transaction rejected: ${transaction.id}`, err.message);
                rejectedTransactions.push(transaction);
            }
        },candidateTransactions);

        // if (selectedTransactions.length === 0){
        //     alert("Mine Error");
        //     return ;
        // }


        console.info(`Selected ${selectedTransactions.length} candidate transactions with ${rejectedTransactions.length} being rejected.`);
        let transactions = selectedTransactions;

        operator.AddBalanceForAddress(rewardId,Config.MINING_REWARD);
        return Block.fromJson({
            index,
            nonce: 0,
            previousHash,
            timestamp,
            transactions
        });
    }
  /* istanbul ignore next */
    static proveWorkFor(jsonBlock, difficulty) {
        let blockDifficulty = null;
        let start = process.hrtime();
        let block = Block.fromJson(jsonBlock);

        // INFO: Every cryptocurrency has a different way to prove work, this is a simple hash sequence

        // Loop incrementing the nonce to find the hash at desired difficulty
        do {
            block.timestamp = new Date().getTime() / 1000;
            block.nonce++;
            block.hash = block.toHash();
            blockDifficulty = block.getDifficulty();
} while (blockDifficulty >= difficulty);
        //map the difficulty
        //Miner.blockIndexToDifficultyMapping[block.index]=difficulty;
        Miner.blockIndexToDifficultyMapping.set(block.index, difficulty);
        Miner.writeDataToFile('data.json');
        //console.info(`mapping index: ${block.index} mapping diff: ${} `);
        console.info(`Block found: time '${process.hrtime(start)[0]} sec' bdiff '${blockDifficulty}'dif '${Miner.get_DifByindex(block.index)}' hash '${block.hash}' nonce '${block.nonce}'`);
        return block;
    }
    static get_DifByindex(passindex){
        Miner.loadDataFromFile('data.json');
        const dif = Miner.blockIndexToDifficultyMapping.get(passindex);
          if (dif === undefined) {
              const dif = Miner.blockIndexToDifficultyMapping.get(passindex-1);
            console.warn(`Difficulty for index ${passindex} not found.`);
        }
        return dif;
    }


// Function to dynamically adjust the difficulty based on certain criteria
    static dynamicDifficulty(blockchain) {
        //const blocks = blockchain.getAllBlocks();
        const difficultyAdjustmentInterval = Config.DIFFICULTY_ADJUSTMENT_INTERVAL; // Assuming this is defined in the Config

        const latestBlock = blockchain.getLastBlock();
       if(latestBlock.index ===0){
        Miner.blockIndexToDifficultyMapping.set(latestBlock.index, latestBlock.getDifficulty());
        Miner.writeDataToFile('data.json');
        return Miner.get_DifByindex(latestBlock.index);
            //return latestBlock.getDifficulty();
        }
         if (latestBlock.index % difficultyAdjustmentInterval ===0 && latestBlock.index !==0) {
        //if (latestBlock.index >= difficultyAdjustmentInterval) {
            return this.adjustedDifficulty(latestBlock, blockchain);
     } else {
             Miner.loadDataFromFile('data.json');
            const dif = Miner.get_DifByindex(latestBlock.index);
             //const dif = Miner.generateRandomNumericHash(16);
            if (dif === undefined) {
                console.error(`Failed to retrieve difficulty for block index ${latestBlock.index}.`)};
            return dif;
        }
    }
// 生成一个包含数字的随机哈希值的函数
    static generateRandomNumericHash(length) {
    var result = '';

    for (var i = 0; i < length; i++) {
        result += Math.floor(Math.random() * 10); // 生成 0 到 9 之间的随机数字
    }
    result =  parseInt(result, 16);
    //console.log(result);
    return result;
}
// Helper function to compute adjusted difficulty
    static adjustedDifficulty(latestBlock, blockchain) {
        //let block = Block.fromJson(jsonBlock);
        const prevAdjustmentBlock = blockchain.getBlockByIndex(latestBlock.index - Config.DIFFICULTY_ADJUSTMENT_INTERVAL);
        const BLOCK_GENERATION_INTERVAL = Config.BLOCK_GENERATION_INTERVAL;
        const timeExpected = BLOCK_GENERATION_INTERVAL * Config.DIFFICULTY_ADJUSTMENT_INTERVAL;
        const timeTaken = latestBlock.timestamp - prevAdjustmentBlock.timestamp;
       console.log(`actually timetaken: ${timeTaken}.`);

        if (timeTaken < timeExpected) {
            let lifted_dif = Miner.generateRandomNumericHash(14);
            while(lifted_dif>Miner.get_DifByindex(prevAdjustmentBlock.index)){
                lifted_dif = Miner.generateRandomNumericHash(14);
            }
            console.log('lif');
            return lifted_dif;
            //return Miner.get_DifByindex(prevAdjustmentBlock.index) + 1;
        } else if (timeTaken > timeExpected ) {
            let down_dif = Miner.generateRandomNumericHash(14);
            while(down_dif<Miner.get_DifByindex(prevAdjustmentBlock.index)){
                down_dif = Miner.generateRandomNumericHash(14);
            }
            console.log('down');
            return down_dif;
        } else {
            console.log('remain');
            return Miner.get_DifByindex(prevAdjustmentBlock.index);
        }
    }
}

module.exports = Miner;
