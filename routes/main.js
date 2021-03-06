module.exports = (app, opts, done) => {
    const main = app.controller('main')

    app.get('/company/:bpid/:id', main.index)
    app.post('/company/:bpid/:id', main.send)
    app.get('/:bpid/:id/thankyou', main.thankyou)

    done()
}