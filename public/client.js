const params = new URLSearchParams(window.location.search);
const role = params.get('role') || "subscriber";

const socket = io();
let peerConnection, localStream;

const constraints = {
    video: true,
    audio: true
};

const servers = {
    iceServers: [
        {
            urls: "stun:stun.stunprotocol.org"
        }
    ]
};

const videElement = document.querySelector('video');

if (role === "publisher") {
    navigator.mediaDevices.getUserMedia(constraints)
        .then(stream => {
            videElement.srcObject = stream;
            localStream = stream;
            createOffer();
        })
        .catch(error => {
            console.error('Error accessing media devices.', error);
        });
}else{
    videElement.muted = true;
    console.log('subscriber');
    socket.on('offer', handleOffer);
}





function createOffer() {
    peerConnection = new RTCPeerConnection(servers);

    peerConnection.onicecandidate = (event) => {
        if (event.candidate) {
            //console.log('New Ice Candidate', JSON.stringify(peerConnection.localDescription));
            console.log('New Ice Candidate', event.candidate);

            socket.emit('candidate', { candidate: event.candidate });
        }
    };

    localStream.getTracks().forEach(track => peerConnection.addTrack(track, localStream));

    peerConnection.createOffer()
        .then(offer => {
            peerConnection.setLocalDescription(offer);
            socket.emit('offer', { offer });
        })
        .catch(error => {
            console.error('Error creating offer', error);
        });
}


function handleOffer(data) {
    console.log('handleOffer', data);
    peerConnection = new RTCPeerConnection(servers);

    peerConnection.onicecandidate = (event) => {
        if (event.candidate) {
            // JSON.stringify(peerConnection.localDescription)
            console.log('New Ice Candidate-user', event.candidate);
            socket.emit('candidate', { candidate: event.candidate });
        }
    };

    peerConnection.ontrack = (event) => {
        videElement.srcObject = event.streams[0];
    };

    peerConnection.setRemoteDescription(new RTCSessionDescription(data.offer))
        .then(() => {return peerConnection.createAnswer()})
        .then(answer => {
            peerConnection.setLocalDescription(answer)
            socket.emit('answer', { answer });
        })
     
}


socket.on('candidate', (data) => {
    peerConnection.addIceCandidate(new RTCIceCandidate(data.candidate));
});

socket.on('answer', (data) => {
    peerConnection.setRemoteDescription(new RTCSessionDescription(data.answer));
});