import { useState } from 'react'
import Uploader from '../lib/Uploader'
let uploader = new Uploader({
  url: '/apis/upload'
})

const Index = () => {
  let [progress, setProgress] = useState(0)
  let [error, setError] = useState('')
  let [fileName, setFileName] = useState('')
  return (<div>hello
    progress: {progress} <br />
    error: {JSON.stringify(error)} <br />
    uploaded: <a href={`/uploads/${fileName}`}>{fileName}</a> <br />
    <input type="file" onChange={e => {
      let item = uploader.upload(e.target.files[0], {
        onProgress: setProgress,
        onError: err => {
          setError(err)
          console.log(err)
        },
        onFinish: ({ fileName }) => setFileName(fileName)
      })
      item.start()
    }} />
  </div>)
}

export default Index