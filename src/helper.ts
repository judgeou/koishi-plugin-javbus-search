import { h } from 'koishi'
import http from 'node:http'
import https from 'node:https'

function hText (content: string) {
  return h('text', { content })
}

function getJSONHttp (url, isHttps = false): any {
  return new Promise((resolve, reject) => {
    const httpGet = isHttps ? https.get : http.get
    httpGet(url, res => {
      if (res.statusCode != 200) {
        reject(404)
        return
      }

      let data = ''

      res.on('data', chunk => { data += chunk })
      res.on('end', () => {
        let json = JSON.parse(data)
        resolve(json)
      })
    })
  })
}

function downloadHttp (url, useHttps = false, agent = null): any {
  return new Promise((resolve, reject) => {
    const httpGet = useHttps ? https.get : http.get
    const req = httpGet(url, { agent: agent }, res => {
      const mime = res.headers['content-type']
      const dataBuffer = [];

      res.on('data', (chunk) => {
        dataBuffer.push(chunk);
      })

      res.on('end', () => {
        const fileData = Buffer.concat(dataBuffer);
        resolve({
          buffer: fileData,
          mime
        });
      });
    })
  })
}

export {
  hText,
  getJSONHttp,
  downloadHttp
}
