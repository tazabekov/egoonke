const express = require('express');
const app = express();
const server = require('http').Server(app);
const io = require('socket.io')(server);
const { v4: uuidV4 } = require('uuid');
const { ExpressPeerServer } = require('peer');

const peerServer = ExpressPeerServer(server, {
  path: '/peerjs'
});

app.set('view engine', 'ejs');
app.use(express.static('public'));
app.get('/', (req, resp) => {
  resp.redirect(`/${uuidV4()}`);
});

app.use('/peerjs', peerServer);

app.get('/:room', (req, resp) => {
  resp.render('room', { roomId: req.params.room });
});

io.on('connection', socket => {
  socket.on('join-room',  (roomId, userId) => {
    socket.join(roomId);
    socket.to(roomId).broadcast.emit('user-connected', userId);
    socket.on('disconnect', () => {
      socket.to(roomId).broadcast.emit('user-disconnected', userId);
    });
  });
})

server.listen(process.env.PORT || 3000);