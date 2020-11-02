const { createCRC32 } = require('hash-wasm')

module.exports = async function (file) {
  let hasher = await createCRC32()
  hasher.update(file)
  return hasher.digest()
}
