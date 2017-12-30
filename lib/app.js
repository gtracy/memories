const express = require('express')
const app = express()

app.get('/', (req, res) => res.send('Hello, Greg!'))

app.listen(3000, () => console.log('Server running... listening on port 3000'))
