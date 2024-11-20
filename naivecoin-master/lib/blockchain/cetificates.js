const Certificate = require('./certificate');
const R = require('ramda');

class Certificates extends Array {
    static fromJson(data) {
        let certificates = new Certificates();
        R.forEach((certificate) => { certificates.push(Certificate.fromJson(certificate)); }, data);
        return certificates;
    }
}

module.exports = Certificates;