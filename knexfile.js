const knex = require('knex')(require('./knexfile'));




module.exports = {
    client: 'mysql',
    connection: {
      user: 'root',
      password: 'password',
      database: 'node_database'
    }
  }

  module.exports = {
    createUser ({ username, password }) {
      console.log(`Add user ${username} with password ${password}`)
      return knex('user').insert({
        username,
        password
      })
    }
  }