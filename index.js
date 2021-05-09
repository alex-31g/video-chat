/**
 * navigator.mediaDevices.getUserMedia:
 * https://developer.mozilla.org/ru/docs/Web/API/MediaDevices/getUserMedia
 * 
 * https://peerjs.com/docs.html#mediaconnection
**/

const btnConnect = document.querySelector('.btnConnect');
btnConnect.onclick = makeCall;

// Create peer connection
const peer = new Peer();

// Get peer id
peer.on('open', function(id) {
	console.log('My peer ID: ', id);
});

// Connect from side A to B
function makeCall() {
	// Create stream of side A 
	navigator.mediaDevices.getUserMedia({ video: true, audio: true })
		.then(stream => {
			const video = document.createElement('video');
			addVideoToPage(stream, 'a', video);

			const partnerPeerId = document.querySelector('.partnerPeerId').value;

			// Send stream from side A to side B
			// peer.call provide a MediaConnection object
			const call = peer.call(partnerPeerId, stream);

			const video2 = document.createElement('video');

			// Get stream from side B 
			// MediaConnection emits a stream event whose callback includes the video/audio stream of the other peer
			call.on('stream', partnerStream => {
				console.log('side A got B');
				addVideoToPage(partnerStream, 'a', video2);
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
		.then(stream => {
			const video = document.createElement('video');
			addVideoToPage(stream, 'b', video);

			// Send stream from side B to side A
			call.answer(stream);

			const video2 = document.createElement('video');

			// Get stream from side A
			call.on('stream', partnerStream => {
				console.log('side B got A')
				addVideoToPage(partnerStream, 'b', video2);
			});
		})
		.catch(err => { 
			console.log(err.name + ": " + err.message); 
		}); 
});

// ================================
// Below are the functions that add/remove video tags to the page
// ================================

function addVideoToPage(stream, side, v) {
	console.log(side)
	const video = createVideoElement(v);
  video.srcObject = stream;
  video.onloadedmetadata = function(e) {
    video.play();
  };
	if (side === 'a') {
		video.classList.add('sideA');
	} else {
		video.classList.add('sideB');
	}
}

function createVideoElement(video) {
	const body = document.querySelector('body');
	// const video = document.createElement('video');
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