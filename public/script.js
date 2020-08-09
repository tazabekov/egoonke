const socket = io('/');
const videoGrid = document.getElementById('video-grid');
const myPeer = new Peer(undefined, {
  host: location.hostname,
	port: location.port || (location.protocol === 'https:' ? 443 : 80),
	path: '/peerjs'
});

const myVideo = document.createElement('video');
myVideo.muted = true;
myVideo.setAttribute('autoplay', '');
myVideo.setAttribute('muted', '');
myVideo.setAttribute('playsinline', '');
const peers = {};

if (navigator.mediaDevices) {
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
      });
    });

    socket.on('user-connected', userId => {
      console.log('user-connected:', `${userId}`.substr(0,5));
      connectToNewUser(userId, stream);
    });
  });
}

socket.on('user-disconnected', userId => {
  console.log('user-disconnected:', `${userId}`.substr(0,5));
  if (peers[userId]) {
    peers[userId].close();
  }
});

myPeer.on('open', userId => {
  console.log('peer-open:', `${userId}`.substr(0,5));
  socket.emit('join-room', window.roomId || window.location.pathname.substr(1), userId);
});

function addVideoStream(video, stream) {
  video.srcObject = stream;
  video.addEventListener('loadedmetadata', () => {
    video.play();
  });
  videoGrid.append(video);
}

function connectToNewUser(userId, stream) {
  const call = myPeer.call(userId, stream);
  const videoElementFromUser = document.createElement('video');
  videoElementFromUser.setAttribute('autoplay', '');
  videoElementFromUser.setAttribute('muted', '');
  videoElementFromUser.setAttribute('playsinline', '');
  call.on('stream', userVideoStream => {
    addVideoStream(videoElementFromUser, userVideoStream);
  });
  call.on('close', () => {
    videoElementFromUser.remove();
  });

  peers[userId] = call;
}