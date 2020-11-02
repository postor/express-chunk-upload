const { createCRC32 } = require('hash-wasm')

module.exports = async function (file) {
  let hasher = await createCRC32()
  let view = await readFile(file)
  hasher.update(view)
  return hasher.digest()
}

function readFile(file) {
  return new Promise((resolve, reject) => {
    const fileReader = new FileReader()
    fileReader.onload = async (e) => {
      const view = new Uint8Array(e.target.result)
      resolve(view)
    }
    fileReader.readAsArrayBuffer(file);
  })
}