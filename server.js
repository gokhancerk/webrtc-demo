const express = require('express');
const { createServer } = require('node:http');
const { join } = require('node:path');

const { Server } = require('socket.io');

const app = express();
const server = createServer(app);
const io = new Server(server,{
    cors: {
        origin: '*',
    }
});

app.use(express.static(join(__dirname, 'public')));

io.on('connection', (socket) => {
    console.log('a user connected', socket.id);

    socket.on('offer', (offer) => {
       // console.log('offer', offer);
        socket.broadcast.emit('offer', offer);
    });

    socket.on('answer', (answer) => {
        console.log('answer', answer);
        socket.broadcast.emit('answer', answer);
    });

    socket.on('candidate', (candidate) => {
        console.log('candidate', candidate);
        socket.broadcast.emit('candidate', candidate);
    });

    socket.on('disconnect', () => {
        console.log('user disconnected', socket.id);
    });

});




server.listen(3000, () => {
  console.log('server running at http://localhost:3000');
});