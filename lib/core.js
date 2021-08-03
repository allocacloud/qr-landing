const fs = require('fs')

module.exports = (app) => {
    return (req, res, next) => {
        res.locals = {}

        res.locals.params = req.params
        res.locals.query = req.query
        res.locals.url = req.url
        res.locals.config = app.config

        res.locals.lang = 'uk'
        if (req.params && req.params.lang) {
            res.locals.lang = req.params.lang.substr(0,2)
        }
        if (['uk','ru'].indexOf(res.locals.lang) < 0) {
            res.locals.lang = 'uk'
        }

        app.ts = require('./lang/' + res.locals.lang + '.json')

        if (process.env.NODE_ENV == 'production') {
            res.locals.revJS = require('../static/js/rev-manifest.json')
            res.locals.revCSS = require('../static/styles/rev-manifest.json')

            if (!app.critical) {
                app.critical = res.locals.critical = fs.readFileSync(__dirname + '/../static/styles/' + res.locals.revCSS['main/critical.css'])
            } else {
                res.locals.critical = app.critical
            }
        } else {
            res.locals.revJS = {}
            ;['main.js'].forEach((i) => {
                res.locals.revJS[i] = i
            })
            res.locals.revCSS = {}
            ;['main/critical.css','main/style.css'].forEach((i) => {
                res.locals.revCSS[i] = i
            })

            res.locals.critical = fs.readFileSync(__dirname + '/../static/styles/' + res.locals.revCSS['main/critical.css'])
        }

        res.locals.load = (name) => {
            if (res.locals.revJS[name]) return '/js/' + res.locals.revJS[name]
            if (res.locals.revCSS[name]) return '/styles/' + res.locals.revCSS[name]
            return
        }

        app.t = res.locals.t = str => app.ts && app.ts.hasOwnProperty(str) ? app.ts[str] : str

        res.locals.app = {
            env: process.env.NODE_ENV,
            lang: res.locals.lang
        }

        ;[
            'enter_phone_or_email',
            'wrong_email',
            'email1',
            'email2',
            'phone1',
            'phone2'
        ].forEach(s => res.locals.app[s] = app.t(s))

        return next()
    }
}