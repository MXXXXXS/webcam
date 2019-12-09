import express, {static as eStatic} from 'express'
import socketIO from 'socket.io'
import https from 'https'
import path from 'path'
import fs from 'fs'

const app = express()
const server = https.createServer({
  key: fs.readFileSync('src/server/key.pem'),
  cert: fs.readFileSync('src/server/certificate.pem'),
}, app)
const io = socketIO(server, {
  serveClient: false
})

io.on('connection', (socket) => {
  socket.emit('hi', 'this is a message form server')
  socket.on('hi', (data) => {
    console.log(data)
  })
})

app.use('/', eStatic(path.resolve('dist/app')))

server.listen(4000, '0.0.0.0', () => {
  console.log('listening...')
})
