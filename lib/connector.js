const request = require('request')

module.exports = (app) => {
    return (req, res, next) => {
        if (!app.api) {
            app.api = {
                getServices: data =>
                    new Promise(async (resolve, reject) => {
                        try {
                            const cache = app.lib('cache', 'services-')

                            const { bp_id, company_id, lng } = data

                            // return cache.get(company_id, (err, data) => {
                                // if (err)
                                //     return reject(err)

                                // if (data) {
                                //     return resolve(JSON.parse(data))
                                // } else {
                                    return request.get(app.config.api.host + "/CompanyBpServicesQRList", {
                                        qs: {
                                            bp_id,
                                            company_id,
                                            lng
                                        }
                                    }, (err, res, body) => {
                                        console.log(body)
                                        if (err)
                                            return reject(err)

                                        if (!body)
                                            return resolve("")

                                        try {
                                            cache.set(company_id, body, () => {}, 24*60*60*1000)

                                            return resolve(JSON.parse(body))
                                        } catch (e) {
                                            console.error('api.getServices', body, e)
                                            return reject(e)
                                        }
                                    })
                                // }
                            // })
                        } catch (e) {
                            return reject(e)
                        }
                    }),
                createTask: data =>
                    new Promise(async (resolve, reject) => {
                        try {
                            const { bp_id, company_id, service_id, user_name, user_login, description, anonymous, lng, files } = data

                            return request.post(app.config.api.host + "/TaskCreateQR", {
                                json: {
                                    bp_id,
                                    company_id,
                                    service_id,
                                    user_name,
                                    user_login,
                                    description,
                                    anonymous,
                                    lng,
                                    files
                                }
                            }, (err, res, body) => {
                                if (err)
                                    return reject(err)

                                return resolve(body)
                            })
                        } catch (e) {
                            return reject(e)
                        }
                    })
            }
        }

        return next()
    }
}