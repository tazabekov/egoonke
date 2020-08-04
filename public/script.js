const socket = io('/');
const videoGrid = document.getElementById('video-grid');
const myPeer = new Peer(undefined, {
  host: location.hostname,
	port: location.port || (location.protocol === 'https:' ? 443 : 80),
	path: '/peerjs'
});

const myVideo = document.createElement('video');
myVideo.muted = true;
const peers = {};

navigator.mediaDevices.getUserMedia({
  video: true,
  audio: true
}).then(stream => {
  addVideoStream(myVideo, stream);

  myPeer.on('call', call => {
    call.answer(stream);
    const videoElFromUser = document.createElement('video');
    call.on('stream', userVideoStream => {
      addVideoStream(videoElFromUser, userVideoStream);
    })
  })

  socket.on('user-connected', userId => {
    connectToNewUser(userId, stream);
  });
});

socket.on('user-disconnected', userId => {
  console.log(userId);
  if (peers[userId]) {
    peers[userId].close();
  }
})

myPeer.on('open', userId => {
  socket.emit('join-room', roomId, userId);
});

function addVideoStream(video, stream) {
  video.srcObject = stream;
  video.addEventListener('loadedmetadata', () => {
    video.play();
  })
  videoGrid.append(video);
}

function connectToNewUser(userId, stream) {
  const call = myPeer.call(userId, stream);
  const videoElementFromUser = document.createElement('video');
  call.on('stream', userVideoStream => {
    addVideoStream(videoElementFromUser, userVideoStream)
  });
  call.on('close', () => {
    videoElementFromUser.remove();
  })

  peers[userId] = call;
}