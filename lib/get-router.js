const { join } = require('path')
const { Router } = require('express')
const { json } = require('body-parser')
const { ensureDir, writeFile, remove, readdir, stat, readFile } = require('fs-extra')
const handleError = require('./error-handle')
const concatFiles = require('concat-files')
const getCrc32 = require('./crc32-node')

const DEFAULT_CONFIG = {
  jsonParser: {
    limit: '2gb'
  },
  uploadPath: '',
  cleanTempFileMs: 86400000, // 1 day
  rename: (name, crc32) => name,
}


/**
 * get upload router
 * @param {object} opts 
 * @param {object} opts.jsonParser 
 * @param {string} opts.uploadPath 
 * @param {number} opts.cleanTempFileMs 
 * @param {CallableFunction} opts.rename 
 */
function getRouter(opts = {}) {
  let {
    jsonParser,
    uploadPath,
    cleanTempFileMs,
    rename
  } = Object.assign({}, DEFAULT_CONFIG, opts)

  if (!uploadPath) throw 'uploadPath is required'

  const tmpPath = join(uploadPath, 'tmp')
  ensureDir(tmpPath)

  let router = Router()

  router.use(json(jsonParser))
  router.post('/part', handleError(async (req, res) => {
    let { index, base64, crc32 } = req.body
    let tmpFile = join(tmpPath, `${crc32}_${index}`)
    let buff = Buffer.from(base64, 'base64');
    await writeFile(tmpFile, buff, { flag: 'w' })
    res.json({ success: true })
  }))
  router.post('/concat', handleError(async (req, res) => {
    let { total, name, crc32 } = req.body
    let fileName = rename(name, crc32),
      partNames = new Array(total).fill('').map((x, i) => join(tmpPath, `${crc32}_${i}`))
    let targetFile = join(uploadPath, fileName)
    await concatFilesPromise(partNames, targetFile)
    await batchRemove(partNames)
    await cleanOld(tmpPath, cleanTempFileMs)
    let crc32Node = await getCrc32(await readFile(targetFile))
    if (crc32Node !== crc32) throw 'crc32 not match!'
    res.json({ success: true, fileName })
  }))
  return router
}


module.exports = getRouter

function concatFilesPromise(parts, target) {
  return new Promise((resolve, reject) => {
    concatFiles(parts, target, err => {
      if (err) return reject(err)
      resolve()
    })
  })
}

function batchRemove(files = []) {
  return Promise.all(files.map(x => remove(x)))
}

async function cleanOld(dir, cleanTempFileMs) {
  let files = (await readdir(dir)).map(x => join(dir, x))
  let stats = await Promise.all(files.map(x => stat(x)))
  let cleanBefore = BigInt(new Date() - cleanTempFileMs)
  let toClean = files.filter((x, i) => stats[i].birthtimeMs < cleanBefore)
  await batchRemove(toClean)
}