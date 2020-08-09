const videoGrid = document.getElementById('video-grid');
const myVideo = document.createElement('video');
myVideo.setAttribute('autoplay', '');
myVideo.setAttribute('muted', '');
myVideo.setAttribute('playsinline', '');

if (navigator.mediaDevices) {
  navigator.mediaDevices.getUserMedia({
    video: true,
    audio: true
  }).then(stream => {

    myVideo.srcObject = stream;
    myVideo.addEventListener('loadedmetadata', () => {
      myVideo.play();
    });
    videoGrid.append(myVideo);
  }).catch((e) => {
    console.log(e);
  });
}