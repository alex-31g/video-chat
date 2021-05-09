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

let call_A = null;

// Connect from side A to B
function makeCall() {
	// Create stream of side A 
	navigator.mediaDevices.getUserMedia({ video: true, audio: true })
		.then(stream => {
			window.localStream = stream;

			// Needed to create video element before peer.call() or call.on(),
			// otherwise you will get two stream event 
			// https://github.com/peers/peerjs/issues/609
			const myVideo = document.createElement('video');
			myVideo.muted = true;
			addVideoToPage(stream, myVideo);
			createStopCallButton();

			const partnerPeerId = document.querySelector('.partnerPeerId').value;

			// Send stream from side A to side B
			// peer.call provide a MediaConnection object
			call_A = peer.call(partnerPeerId, stream);

			const partnerVideo = document.createElement('video');

			// Get stream from side B 
			// MediaConnection emits a stream event whose callback includes the video/audio stream of the other peer
			call_A.on('stream', partnerStream => {
				console.log('side A got B');
				addVideoToPage(partnerStream, partnerVideo);
			});

			call_A.on('close', () => {
				console.log("call close event AAA");
				myVideo.remove();
				partnerVideo.remove();
			});

			call_A.on('error', () => {
				console.log('side B error');
			});
		})
		.catch(err => { 
			console.log(err.name + ": " + err.message); 
		}); 
}

let call_B = null;

// Answering a call from side A
peer.on('call', call => {
	console.log('Side A calling you');

	call_B = call;
	// Create stream of side B
	navigator.mediaDevices.getUserMedia({ video: true, audio: true })
		.then(stream => {
			window.localStream = stream;

			myVideo = document.createElement('video');
			myVideo.muted = true;
			addVideoToPage(stream, myVideo);
			createStopCallButton();

			// Send stream from side B to side A
			call.answer(stream);

			console.log('Stop ringing B');

			const partnerVideo = document.createElement('video');

			// Get stream from side A
			call.on('stream', partnerStream => {
				console.log('side B got A')
				addVideoToPage(partnerStream, partnerVideo);
			});

			call.on('close', () => {
				console.log("call close event BBB");
				myVideo.remove();
				partnerVideo.remove();
			});

			call.on('error', () => {
				console.log('side A error');
			});

		})
		.catch(err => { 
			console.log(err.name + ": " + err.message); 
		}); 
});


// ================================
// Below are the functions that add/remove video tags to the page
// ================================

function addVideoToPage(stream, v) {
	const video = createVideoElement(v);
  video.srcObject = stream;
  video.onloadedmetadata = function(e) {
    video.play();
  };
}

function createVideoElement(video) {
	const body = document.querySelector('body');
	body.appendChild(video);
	return video;
}

function createStopCallButton() {
	const body = document.querySelector('body');
	const button = document.createElement('button');
	const text = document.createTextNode('stop call');
	button.classList.add('removeVideoBtn')
	button.appendChild(text);
	body.appendChild(button);
	button.onclick = stopVideo;
}

function stopVideo() {
	console.log('stop video');

	// stop both video and audio
	localStream.getTracks().forEach( (track) => {
		track.stop();
	});

	// peer.destroy() - close the connection to the server and terminate all existing connections. 
	// peer.destroyed will be set to true.
	// peer.destroy();

	if (call_A) {
		console.log('stop video A');

		// Closes the media connection
		call_A.close();
		
	} else if (call_B) {
		console.log('stop video B');
		call_B.close();
	}
}

// ===================
// https://stackoverflow.com/questions/11642926/stop-close-webcam-stream-which-is-opened-by-navigator-mediadevices-getusermedia

// Close webcam stream which is opened by navigator.mediaDevices.getUserMedia 

// navigator.mediaDevices.getUserMedia({audio:true,video:true})
//     .then(stream => {
//         window.localStream = stream;
//     })
//     .catch( (err) => {
//         console.log(err);
//     });

// // stop both video and audio
// localStream.getTracks().forEach( (track) => {
// 	track.stop();
// });

// // stop only audio
// localStream.getAudioTracks()[0].stop();

// // stop only video
// localStream.getVideoTracks()[0].stop();
// ===================


// https://github.com/peers/peerjs/issues/780
// https://stackoverflow.com/questions/64651890/peerjs-close-video-call-not-firing-close-event
// https://github.com/peers/peerjs/issues/636