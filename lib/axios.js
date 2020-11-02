const axios = require('axios')
module.exports = axios.default.create({
  headers:{
    'Content-Type':'application/json'
  }
})