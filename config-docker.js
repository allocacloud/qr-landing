'use strict';

const { config } = require('process');

module.exports = (app) => {
    config.port = process.env.APPPORT
    config.host = process.env.APPHOST
    config.pageTitle = 'Alloca'

    config.ect = {
        root: __dirname + '/views',
        ext: '.html',
        open: '{{', close: '}}',
        cache: false,
        watch: true,
        gzip: true
    }

    config.api = {
        host: "http://dev1.alloca.cloud/ords/alloca/alloca_api/"
    }

    config.bsgKey = 'test_HdcVrJUtXLwDMeo1NfYt'

    return config
}