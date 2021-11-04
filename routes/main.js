module.exports = (app, opts, done) => {
    const main = app.controller('main')

    app.get('/company/:bpId/:id', main.index)
    app.post('/company/:bpId/:id', main.send)
    app.get('/thankyou', main.thankyou)

    done()
}