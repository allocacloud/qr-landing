const httpError = require('http-errors')

module.exports = (app) => {
    var self = this

    this.missing = (req, res) => {
        if (!res.locals) {
            res.locals = {}
        }

        res.locals.pageTitle = "404"
        return res.code(404).view('404.html')
    }

    this.error = (err, req, res) => {
        if (err.name == 'NotFoundError') {
            return self.missing(req, res)
        } else {
            if (!res.locals) {
                res.locals = {}
            }

            res.locals.pageTitle = "500"
            console.error(err)
            return res.code(500).view('500.html')
        }
    }

    return this
}