/**
 * navigator.mediaDevices.getUserMedia:
 * https://developer.mozilla.org/ru/docs/Web/API/MediaDevices/getUserMedia
 * 
 * https://peerjs.com/docs.html#mediaconnection
**/

const btnConnect = document.querySelector('.btnConnect');
btnConnect.onclick = startConnection;

// Create peer connection
const peer = new Peer();

// Get peer id
peer.on('open', function(id) {
	console.log('My peer ID: ', id);
});

// Connect from side A to B
function startConnection() {

	// Create stream of side A 
	navigator.mediaDevices.getUserMedia({ video: true, audio: true })
		.then(mediaStream => {
			const partnerPeerId = document.querySelector('.partnerPeerId').value;

			// Send stream from side A to side B
			// peer.call provide a MediaConnection object
			const mediaConnection = peer.call(partnerPeerId, mediaStream);

			// Get stream from side B 
			// MediaConnection emits a stream event whose callback includes the video/audio stream of the other peer
			mediaConnection.on('stream', partnersStream => {
				addVideoToPage(partnersStream);
			});
		})
		.catch(err => { 
			console.log(err.name + ": " + err.message); 
		}); 
}

// Answering a call from side A
peer.on('call', call => {

	// Create stream of side B
	navigator.mediaDevices.getUserMedia({ video: true, audio: true })
		.then(mediaStream => {
			// Send stream from side B to side A
			call.answer(mediaStream);

			// Get stream from side A
			call.on('stream', partnersStream => {
				addVideoToPage(partnersStream);
			});
		})
		.catch(err => { 
			console.log(err.name + ": " + err.message); 
		}); 
});

// ================================
// Below are the functions that add/remove video tags to the page
// ================================

function addVideoToPage(mediaStream) {
	const video = createVideoElement();
  video.srcObject = mediaStream;
  video.onloadedmetadata = function(e) {
    video.play();
  };
}

function createVideoElement() {
	const body = document.querySelector('body');
	const video = document.createElement('video');
	video.muted = true;
	body.appendChild(video);
	createDeleteVideoButton();
	return video;
}

function createDeleteVideoButton() {
	const body = document.querySelector('body');
	const button = document.createElement('button');
	const text = document.createTextNode('stop video');
	button.classList.add('removeVideoBtn')
	button.appendChild(text);
	body.appendChild(button);
	button.onclick = stopVideo;
}

function stopVideo() {
	let videoArr = document.querySelectorAll('video');
	videoArr.forEach(video => {
		video.srcObject = null;
		video.remove();
	});
	let buttonArr = document.querySelectorAll('.removeVideoBtn');
	buttonArr.forEach(button => button.remove());
}