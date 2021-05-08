// installed
const express = require('express')

// user defined
const userRoute = require('./routes/user')

// config
const {
  PORT
} =  require('./appConfig/config')

// initializing app
const app = express()

// setting routes
app.use('/user', userRoute)

app.all('*', (req, res) => {
  res.status(400).send('Unknown URL')
})


app.listen(PORT, () => {
  console.log(`server is listening on port ${PORT}...`)
})
