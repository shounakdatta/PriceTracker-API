const express = require('express')
const cheerio = require('cheerio')
const bodyParser = require('body-parser')
const path = require('path')
const fs = require('fs')
const app = express()
const Nightmare = require('nightmare')
const PORT = process.env.PORT | 3000
const constants = require('./constants')

const getWebElement = url => {
    const { commonWebElements } = constants
    let element = null
    Object.keys(commonWebElements).forEach((domain) => {
        if (url.includes(domain)) element = commonWebElements[domain]
    });
    return element
}

app.use(bodyParser.json());       // to support JSON-encoded bodies

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname + '/pages/form.html'))
})

app.get('/output', (req, res) => res.sendFile(path.join(__dirname + '/pages/output.html')))

app.post('/api/getPrice', async (req, res) => {
    const { url } = req.body

    if (url) {
        const priceObj = await new Promise(
            (resolve, reject) => {
                const nightmare = Nightmare({ show: true })
                nightmare
                    .goto(url)
                    .evaluate(() => document.body.innerHTML)
                    .end()
                    .then(body => {
                        const $ = cheerio.load(body)
                        const element = getWebElement(url)
                        if (!element) { reject({ err: 'Could not find price' }); return }
                        const div = $(element)
                        if (
                            div.text()
                            && (
                                div.text().charAt(0) === '$'
                                || !isNaN(parseFloat(div.text().match(/\d|\.|\-/g).join('')))
                            )
                        ) { resolve({ price: parseFloat(div.text().match(/\d|\.|\-/g).join('')) }); return }
                        reject({ err: 'Could not find price' })
                    })
            }
        ).catch(errObj => errObj)
        res.send(priceObj)
        return
    }
    res.send({ error: 'Could not identify URL in post data' })
})

app.listen(PORT, () => console.log(`Listening on Port ${PORT}`))