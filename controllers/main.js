const httpErrors = require('http-errors')

module.exports = (app) => {
    const nodemailer = require('nodemailer')
    const bsg = require('bsg-nodejs')(app.config.bsgKey)
    const cache = app.lib('cache', 'code-')

    this.index = async (req, res) => {
        req.params.id = 1

        const response = await app.api.getServices({
            company_id: req.params.id,
            lng: res.locals.lang
        })

        if (!response.response || !response.response.services) {
            return res.send(new httpErrors().NotFound)
        }

        res.locals.services = JSON.stringify(response.response.services)

        return res.view('index.html')
    }

    this.send = async (req, res) => {
        var files = []

        if (req.body.transfer) {
            req.body.transfer = JSON.parse(req.body.transfer)

            req.body.transfer.forEach(file => {
                files.push({
                    filename: file.filename,
                    title: file.filename.substr(0,-4),
                    content_type: file.type,
                    file_content: file.content
                })
            })
        }

        if (req.body.phone || req.body.email) {
            cache.get(req.body.email ? req.body.email : req.body.phone, function (err, data) {
                if (data && data.allow) {
                    app.api.createTask({
                        company_id: parseInt(req.params.id),
                        service_id: parseInt(req.body.id),
                        user_name: req.body.name,
                        user_login: req.body.phone || req.body.email ? (req.body.phone ? parseInt(req.body.phone) : req.body.email) : '',
                        description: req.body.description,
                        anonymous: false,
                        lng: res.locals.lang,
                        files: files
                    })

                    return res.view('thankyou.html')
                } else {
                    return res.send({success: false})
                }
            })
        } else {
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

            return res.view('thankyou.html')
        }
    }

    const genCode = () => Math.floor(100000 + Math.random() * 900000)

    this.sendConfirm = async (req, res) => {
        if (req.body.code) {
            return cache.get(req.body.value, function (err, data) {
                if (data && data.code == req.body.code) {
                    cache.set(req.body.value, {allow:true}, null, 60*60)

                    return res.send({success: true})
                }
                return res.send({success: false})
            })
        } else {
            const code = genCode()

            cache.set(req.body.value, {code}, null, 60)

            switch (req.body.type) {
                case "email":
                    let testAccount = await nodemailer.createTestAccount();

                    let transporter = nodemailer.createTransport({
                        host: "smtp.ethereal.email",
                        port: 587,
                        secure: false,
                        auth: {
                            user: testAccount.user,
                            pass: testAccount.pass,
                        },
                    });

                    let info = await transporter.sendMail({
                        from: '"Fred Foo 👻" <foo@example.com>',
                        to: req.body.value,
                        subject: "Your code",
                        text: code.toString()
                    });

                    console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));

                    return res.send({success: true})
                case "phone":
                    bsg.createSMS(
                        {
                            destination: "phone",
                            originator: "testsms",
                            body: code.toString(),
                            msisdn: parseInt(req.body.value).toString(),
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
        }

        return res.send({success: false})
    }

    return this
}