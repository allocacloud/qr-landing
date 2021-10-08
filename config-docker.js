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
        host: process.env.APPAPIHOST
    }

    config.smtp = {
        pool: true,
        host: "smtp.gmail.com",
        port: 465,
        secure: true,
        auth: {
            user: "hello@alloca.cloud",
            pass: "XpNmHvCPH#Sr7s8kacpn!wLhpuxu2JbM",
        },
    }

    config.bsgKey = 'live_WO3EpTYxPgxgBMS6hfP8'

    return config
}