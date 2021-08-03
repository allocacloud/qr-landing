const build = (opts={}) => {
    const app = require('fastify')(opts)
    const path = require('path')

    // Library
    app.decorate('lib', (name, opts) => {
        return require(__dirname + '/lib/' + name + '.js')(app, opts)
    })

    // Controller
    app.decorate('controller', (name, opts) => {
        return require(__dirname + '/controllers/' + name + '.js')(app, opts)
    })

    app.register(require('fastify-redis'), {
        host: (process.env.NODE_ENV == 'production' ? process.env.APPREDISHOST : 'localhost'),
        port: (process.env.NODE_ENV == 'production' ? process.env.APPREDISPORT : '6379')
    })

    // Model
    app.decorate('model', (name, opts) => {
        return require(__dirname + '/models/' + name + '.js')(app, opts)
    })

    // Configs
    app.decorate('config', require('./config.js')(app))

    // Static
    app.register(require('fastify-static'), {
        root: path.join(__dirname, 'static')
    })

    // View
    const { render } = require('ect')(app.config.ect)
    app.render = render;
    app.decorateReply('view', function view(path, data) {
        data = Object.assign({}, this.locals, data)
        let html = render(path, data)

        this.header('Content-Type', 'text/html; charset=utf-8')
        return this.send(html)
    })
    app.partial = function (path, data) {
        data = Object.assign({}, this.locals, data)
        let html = render(path, data)

        return html
    }

    // Forms
    app.register(require('fastify-formbody'))
    app.register(require('fastify-multipart'))

    // Middlewares
    app.addHook('preHandler', app.lib('core'))
    app.addHook('preHandler', app.lib('connector'))

    // Router
    require('./routes')(app)

    return app
}


module.exports = build