module.exports = (app) => {
    const error = app.controller('error')

    app.setNotFoundHandler(error.missing)
    app.setErrorHandler(error.error)
}