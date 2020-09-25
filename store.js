const crypto = require('crypto')
const knex = require('knex')(require('./knexfile'));
const { saltHashPassword } = require('../store');

module.exports = {
    createUser ({ username, password }) {
      console.log(`Add user ${username} with password ${password}`)
      return Promise.resolve()
    }
  }

  module.exports = {
    saltHashPassword,
    createUser ({ username, password }) {
      console.log(`Add user ${username}`)
      const { salt, hash } = saltHashPassword(password)
      return knex('user').insert({
        salt,
        encrypted_password: hash,
        username
      })
    }
  }

  function saltHashPassword (password) {
    const salt = randomString()
    const hash = crypto
      .createHmac('sha512', salt)
      .update(password)
    return {
      salt,
      hash: hash.digest('hex')
    }
  }

  function randomString () {
    return crypto.randomBytes(4).toString('hex')
  }

  exports.up = function up (knex) {
    return knex.schema
      .table('user', t => {
        t.string('salt').notNullable()
        t.string('encrypted_password').notNullable()
      })
      .then(() => knex('user'))
      .then(users => Promise.all(users.map(convertPassword)))
      .then(() => {
        return knex.schema.table('user', t => {
          t.dropColumn('password')
        })
      })


      function convertPassword (user) {
        const { salt, hash } = saltHashPassword(user.password)
        return knex('user')
          .where({ id: user.id })
          .update({
            salt,
            encrypted_password: hash
          })
      }
    }
    exports.down = function down (knex) {
      return knex.schema.table('user', t => {
        t.dropColumn('salt')
        t.dropColumn('encrypted_password')
        t.string('password').notNullable()
      })
    }

    module.exports = {
      createUser ({ username, password }) {
        console.log(`Add user ${username}`)
        const { salt, hash } = saltHashPassword({ password })
        return knex('user').insert({
          salt,
          encrypted_password: hash,
          username
        })
      },
      authenticate ({ username, password }) {
        console.log(`Authenticating user ${username}`)
        return knex('user').where({ username })
          .then(([user]) => {
            if (!user) return { success: false }
            const { hash } = saltHashPassword({
              password,
              salt: user.salt
            })
            return { success: hash === user.encrypted_password }
          })
      }
    }
    function saltHashPassword ({
      password,
      salt = randomString()
    }) {
      const hash = crypto
        .createHmac('sha512', salt)
        .update(password)
      return {
        salt,
        hash: hash.digest('hex')
      }
    }
    function randomString () {
      return crypto.randomBytes(4).toString('hex')
    }

    knex('user').insert({
      salt,
      encrypted_password: hash,
      username
    }).debug()
    