module.exports = (fn) => {
  return async (req, res, next) => {
    try {
      return await fn(req, res, next)
    } catch (e) {
      res.json({
        error: e.toString() || 'unknow error'
      })
    }
  }
}