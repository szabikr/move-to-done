const bcrypt = require('bcryptjs')
const { createUser, readUser } = require('../db/users-collection')
const { isPasswordComplex } = require('./validation')

async function postUserRegister(req, res) {
  if (!req.body || !req.body.email || !req.body.password) {
    return res.status(400).end('Invalid Request Body')
  }

  const emailExists = await readUser(req.body.email)

  if (emailExists) {
    return res.status(409).json({
      message: 'Email already exists',
    })
  }

  if (!isPasswordComplex(req.body.password)) {
    return res.status(422).json({
      passwordError:
        'Password must be 8-32 characters with one lowecase, uppercase, number and symbol character',
    })
  }

  const salt = bcrypt.genSaltSync(10)
  const hashedPassword = bcrypt.hashSync(req.body.password, salt)

  const user = {
    username: req.body.email,
    email: req.body.email,
    password: hashedPassword,
  }

  const success = await createUser(user)

  if (!success) {
    return res.status(500).end('Internal server error')
  }

  return res.status(201)
}

async function postUserLogin(req, res) {
  if (!req.body || !req.body.username || !req.body.password) {
    return res.status(400).end('Invalid Request Body')
  }

  const user = await readUser(req.body.username)

  if (!user) {
    return res.status(400).send('username or password is incorrect')
  }

  const isMatch = bcrypt.compareSync(req.body.password, user.password)

  if (!isMatch) {
    return res.status(400).send('username or password is incorrect')
  }

  return res
    .status(200)
    .send(
      `user: ${req.body.username} logged in successfuly and a auth token will be provided`,
    )
}

module.exports = {
  postUserRegister,
  postUserLogin,
}
