const request = require('request')
const express = require('express')
const path = require('path')
const app = express()
const PORT = process.env.PORT | 3000

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname + '/pages/form.html'))
})

app.post('/api/getPrice', async (req, res) => {
    const { url } = req.body
    if (url) {
        const price = await request(
            url,
            (err, response, html) => {
                if (!error && response.statusCode == 200) {
                    const $ = cheerio.load(html)
                    const div = $('#price')
                    const price = div.find('span[id=priceblock_ourprice]').text()
                    resolve(price)
                }
                reject(error);
            }
        )
    }
})

app.listen(PORT, () => console.log(`Listening on Port ${PORT}`))