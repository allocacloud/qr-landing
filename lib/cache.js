module.exports = function (app, prefix = '') {
    this.set = (key, value, callback, ttl = 30*24*60*60*1000) => {
        if (!value && !Type.isString(value)) {
            return false
        }
        app.redis.set(prefix+key, JSON.stringify(value))
        app.redis.expire(prefix+key, ttl)
        if (callback)
            return callback()
        return
    }

    this.get = (key, callback) => {
        app.redis.get(prefix+key, (err, data) => {
            if (err) return callback(err)
            if (!data) return callback()

            try {
                result = JSON.parse(data)
            } catch(e) {
                return callback(e)
            }
            return callback(null, result)
        })
    }

    this.destroy = (key, callback) => {
        return app.redis.del(prefix+key, callback)
    }

    return this;
}