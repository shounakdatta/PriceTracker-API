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
    console.log(url);

    if (url) {
        nightmare
            .goto(url)
            .evaluate(() => document.body.innerHTML)
            .then(body => {
                const $ = cheerio.load(body)
                const div = $('span[data-automation="buybox-price"]')
                fs.writeFile('pages/output.html', div.text(), (err) => console.log(err))
            })
    }
    res.send({ test: 'price' })
})

app.listen(PORT, () => console.log(`Listening on Port ${PORT}`))