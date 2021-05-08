const userGet = (req, res) => {
  console.log('in user route')
  res.send('Hit the user get')
}

module.exports = {
  userGet
}
