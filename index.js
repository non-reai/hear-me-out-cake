import express from 'express'
import { createServer } from "http";
import { Server } from "socket.io";

const app = express()
const server = createServer(app)
const io = new Server(server)

app.use(express.static('public'))
app.use('/assets/', express.static('assets'))

io.on('connect', (socket)=>{
    socket.on('image', (data)=>{
        io.emit('image', data)
    })
})

server.listen(7474)