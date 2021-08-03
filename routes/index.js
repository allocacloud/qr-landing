module.exports = (app) => {
    const main = app.controller('main')
    
    require('./errors')(app)

    app.register(require('./main'), { prefix: '/:lang' })

    app.post('/confirmation', main.sendConfirm)
}