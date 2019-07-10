const express = require('express')
const cheerio = require('cheerio')
const bodyParser = require('body-parser')
const path = require('path')
const fs = require('fs')
const app = express()
const Nightmare = require('nightmare')
const PORT = process.env.PORT | 3000

const nightmare = Nightmare({ show: true })

app.use(bodyParser.json());       // to support JSON-encoded bodies

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname + '/pages/form.html'))
})

app.get('/output', (req, res) => res.sendFile(path.join(__dirname + '/pages/output.html')))

app.post('/api/getPrice', async (req, res) => {
    const { url } = req.body

    if (url) {
        const price = await new Promise(
            (resolve, reject) => {
                nightmare
                    .goto(url)
                    .evaluate(() => document.body.innerHTML)
                    .end()
                    .then(body => {
                        const $ = cheerio.load(body)
                        const div = $('span[data-automation="buybox-price"]')
                        if (
                            div.text()
                            && (
                                div.text().charAt(0) === '$'
                                || !isNaN(parseFloat(div.text()))
                            )
                        ) resolve(div.text())
                        reject('Could not find price.')
                    })
            }
        )
        res.send({ price })
        return
    }
    res.send({ error: 'Could not identify URL in post data' })
})

app.listen(PORT, () => console.log(`Listening on Port ${PORT}`))