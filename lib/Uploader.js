const axios = require('./axios')
const getCrc32 = require('./crc32-browser')

class UploadItem {
  constructor(file, config) {
    this.config = config
    this.file = file
    this.percentage = 0
  }

  async start() {
    // debugger
    const {
      url,
      chunkSize = 1024 * 1024,
      crcPercentage = 0.02,
      concatPercentage = 0.02,
      onProgress = () => { },
      onFinish = () => { },
      onError = () => { } } = this.config
    const { file } = this, progress = percentage => {
      this.percentage = percentage
      onProgress(percentage)
    }
    try {
      let crc32 = await getCrc32(file), iMax = Math.ceil(file.size / chunkSize)
      progress(crcPercentage)
      const stepPercentage = (1 - concatPercentage - crcPercentage) / iMax

      for (let i = 0; i < iMax; i++) {
        let chunk = file.slice(i * chunkSize, Math.min((i + 1) * chunkSize, file.size))
        let base64 = await blob2base64(chunk)
        let { data: { error } } = await axios.post(`${url}/part`, {
          index: i,
          base64,
          crc32,
          name: file.name
        })
        if (error) throw `error with ${i}th chunk: ${error}`
        progress(this.percentage + stepPercentage)
      }

      const { data: { fileName, error } } = await axios.post(`${url}/concat`, {
        crc32,
        name: file.name,
        total: iMax
      })
      if (error) throw `error when concat: ${error}`
      progress(1)
      onFinish({ fileName })
      return fileName
    } catch (e) {
      onError(e)
      throw e
    }
  }
}

class Uploader {
  /**
   * 
   * @param {object} opts 
   * @param {string} opts.url 
   */
  constructor(opts = {}) {
    let { url } = opts
    if (!url) throw 'url is required!'
    this.config = opts
  }

  upload(file, opts = {}) {
    return new UploadItem(file, Object.assign({}, this.config, opts))
  }
}



module.exports = Uploader

async function blob2base64(blob) {
  return new Promise((resolve, reject) => {
    var reader = new FileReader()
    reader.onload = function () {
      var dataUrl = reader.result
      var base64 = dataUrl.split(',')[1]
      resolve(base64)
    }
    reader.readAsDataURL(blob)
  })
}