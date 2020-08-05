const express = require('express');
const app = express();
const server = require('http').Server(app);
const io = require('socket.io')(server);
const { v4: uuidV4 } = require('uuid');
const { ExpressPeerServer } = require('peer');
const handlebars = require('express-handlebars');

const peerServer = ExpressPeerServer(server, {
  path: '/'
});

app.engine('hbs', handlebars({
  layoutsDir: __dirname + '/views/layouts',
  extname: 'hbs'
}));

app.set('view engine', 'hbs');

app.use(express.static('public'));
app.get('/', (req, resp) => {
  const randomRoomId = `/${uuidV4()}`;
  let redirectUrl;
  if (process.env.NODE_ENV === 'production'){
    redirectUrl = 'https://' + req.headers.host + randomRoomId;
  } else {
    redirectUrl = randomRoomId;
  }
  resp.redirect(redirectUrl);
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