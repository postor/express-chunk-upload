# express-chunk-upload

基于 express 的文件上传前后端工具套件（自动分片） | chunk upload with express, uploading made easy

## 使用 | usage

服务端 | server side

```
const express = require('express')
const getRouter = require('express-chunk-upload/get-router')

const app = express()
app.use('/upload',getRouter({
  uploadPath: __dirname+ '/uploads'
}))
```

浏览器端(webpack环境) | client side(webpack)

```
const Uploader = require('express-chunk-upload/Uploader')

let loader = new Uploader({url:'/upload'})

let item = loader.upload(input.files[0],{
  onProgress: progress=>console.log(progress),
  onError:  error=>console.log(error),
  onFinish: ({ fileName }) => console.log(fileName)
})

item.start().then(fileName=>console.log(fileName))

```