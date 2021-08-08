module.exports = (app, opts, done) => {
    const main = app.controller('main')

    app.get('/company/:id', main.index)
    app.post('/company/:id', main.send)
    app.get('/thankyou', main.thankyou)

    done()
}