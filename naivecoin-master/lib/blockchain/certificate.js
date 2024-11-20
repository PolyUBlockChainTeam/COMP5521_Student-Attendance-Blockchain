const R = require('ramda');
const CryptoUtil = require('../util/cryptoUtil');
const CryptoEdDSAUtil = require('../util/cryptoEdDSAUtil');
const Config = require('../config');

/*
Certificate structure:
{ // Certificate
    "id": "84286bba8d...7477efdae1", // random id (64 bytes)
    "studentid": "24063032g", 
    "eventid": "comp 5512",
    "type": "attendance", //
    "timestamp": 1465154705, // number of seconds since January 1, 1970
}
*/

class Certificate {
    constructor(secretKey, studentid, eventid, type) {
        // 初始化 Certificate 对象的属性
        this.id = CryptoUtil.randomId(64); // 生成随机 ID（64 字节）
        this.studentid = studentid;       // 学生 ID
        this.eventid = eventid;           // 活动 ID
        this.type = type;                 // 证书类型
        this.timestamp = Math.floor(Date.now() / 1000); // 时间戳（秒）
        this.secretKey = secretKey;       // 密钥

        // 生成签名
        this.signature = this.toHash;

        // 计算哈希值
        this.hash = this.toHash();
    }

    /**
     * 生成当前 Certificate 对象的哈希值
     * 使用 `id`, `studentid`, `eventid`, `type`, `timestamp`, 和 `signature` 拼接后生成哈希值
     * @returns {string} 哈希值
     */
    toHash() {
        return CryptoUtil.hash(
            this.id + this.studentid + this.eventid + this.type + this.timestamp
        );
    }




    /**
     * 将 JSON 数据转换为 Certificate 对象
     * @param {object} data 输入的 JSON 数据
     * @returns {Certificate} 返回创建的 Certificate 实例
     */
    // static fromJson(data) {
    //     const certificate = new Certificate();
    //     R.forEachObjIndexed((value, key) => {
    //         certificate[key] = value;
    //     }, data);
    //     certificate.hash = certificate.toHash();
    //     return certificate;
    // }
    static fromJson(data) {
        // 验证必需字段是否存在
        const requiredFields = ['studentid', 'eventid', 'type', 'secretKey'];
        requiredFields.forEach((field) => {
            if (!data[field]) {
                throw new Error(`Invalid Certificate JSON: Missing required field '${field}'`);
            }
        });

        // 创建 Certificate 实例并复制属性
        const certificate = new Certificate();
        R.forEachObjIndexed((value, key) => {
            certificate[key] = value;
        }, data);

        // 重新计算并设置哈希值
        certificate.hash = certificate.toHash();
        return certificate;
    }
}

module.exports = Certificate;
