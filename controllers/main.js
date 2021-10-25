const httpErrors = require('http-errors')

module.exports = (app) => {
    const nodemailer = require('nodemailer')
    const bsg = require('bsg-nodejs')(app.config.bsgKey)
    const cache = app.lib('cache', 'code-')

    this.index = async (req, res) => {
        const response = await app.api.getServices({
            company_id: req.params.id,
            lng: res.locals.lang
        })

        if (!response.response || !response.response.services) {
            return res.send(new httpErrors.NotFound())
        }

        res.locals.services = JSON.stringify(response.response.services)

        return res.view('index.html')
    }

    this.send = async (req, res) => {
        var files = []

        if (req.body.transfer) {
            req.body.transfer = JSON.parse(req.body.transfer)

            for (let i in req.body.transfer) {
                let file = req.body.transfer[i]

                files.push({
                    filename: file.filename,
                    title: file.filename.substr(0,-4),
                    content_type: file.type,
                    file_content: file.content.replace(/data:image(.+?)base64,/, '')
                })
            }
        }

        if (req.body.phone) {
            req.body.phone = req.body.phone.match(/\d/g).join('')
        }

        switch (req.body.type) {
            case "anon":
                app.api.createTask({
                    company_id: parseInt(req.params.id),
                    service_id: parseInt(req.body.id),
                    user_name: "",
                    user_login: '',
                    description: req.body.description,
                    anonymous: true,
                    lng: res.locals.lang,
                    files: files
                })
    
                return res.redirect('/' + res.locals.lang + '/thankyou')
                break;
            case "reg":
                if ((req.body.phone && req.body.phone != '380') || req.body.email) {
                    cache.get(req.body.email ? req.body.email : req.body.phone, function (err, data) {
                        if (data && data.allow) {
                            app.api.createTask({
                                company_id: parseInt(req.params.id),
                                service_id: parseInt(req.body.id),
                                user_name: req.body.name,
                                user_login: req.body.phone || req.body.email ? (req.body.phone && req.body.phone != '380' ? parseInt(req.body.phone) : req.body.email) : '',
                                description: req.body.description,
                                anonymous: false,
                                lng: res.locals.lang,
                                files: files
                            })
        
                            return res.redirect('/' + res.locals.lang + '/thankyou')
                        } else {
                            return res.send({success: false, reason: 'no session'})
                        }
                    })
                } else {
                    return res.send({success: false, reason: 'wrong email or phone'})
                }
                break;
            default:
                return res.send();
                break;
        }
    }

    this.thankyou = (req, res) => {
        return res.view('thankyou.html')
    }

    const genCode = () => Math.floor(100000 + Math.random() * 900000)

    this.sendConfirm = async (req, res) => {
        if (!/@/.test(req.body.value)) {
            req.body.value = req.body.value.match(/\d/g).join('')
        }

        return cache.get(req.body.value, async (err, data) => {
            if (req.body.code) {
                if (data && data.code == req.body.code) {
                    cache.set(req.body.value, {allow:true}, null, 10*60)

                    return res.send({success: true})
                }
                return res.send({success: false})
            } else {
                if (!data) {
                    const code = genCode()
                    console.log(code)

                    cache.set(req.body.value, {code}, null, 60)

                    switch (req.body.type) {
                        case "email":
                            let transporter = nodemailer.createTransport(app.config.smtp)

                            await transporter.sendMail({
                                from: '"Alloca" <foo@example.com>',
                                to: req.body.value,
                                subject: "Your code",
                                text: code.toString()
                            })

                            return res.send({success: true})
                        case "phone":
                            bsg.createSMS(
                                {
                                    destination: "phone",
                                    originator: "Alloca",
                                    body: code.toString(),
                                    msisdn: req.body.value,
                                    reference: new Date().getTime(),
                                    validity: "1",
                                    tariff: "9"
                                }
                            ).then(
                                SMS => console.log( "SMS created:", SMS ),
                                error => console.log( "SMS creation failed:", error )
                            )
                            return res.send({success: true})
                    }
                } else {
                    console.log(data)
                }
            }

            return res.send({success: false, ...data})
        })
    }

    return this
}