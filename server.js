const server = require('./app')({
    ignoreTrailingSlash: true,
    bodyLimit: 14000000
})

server.listen(server.config.port, server.config.host, (err) => {
    if (err) {
        console.error(err)
        process.exit(1)
    }
})