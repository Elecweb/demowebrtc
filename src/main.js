import '../css/main.css';
import { setupVideo } from './helper.js';
import io from 'socket.io-client';
import { JOIN_ROOM,JOIN_ROOM_SUCCESS,JOIN_ROOM_FAIL,SEND_ICE,GET_ICE,GET_ACCEPT,ACCEPT,OFFER,GET_OFFER,GET_ANSWER,GET_ICE_BACK,SEND_ICE_BACK,ANSWER } from './events';

// const room = window.prompt("What's the room name?").toLocaleLowerCase();
const room = 'testroom';
const socket = io();

socket.emit(JOIN_ROOM,room);

socket.on(JOIN_ROOM_SUCCESS,(msg)=>{
    console.log('join room success'); 
});

socket.on(JOIN_ROOM_FAIL,(msg)=>{
    console.log('join room fail');
});

let videostream = {
    local:undefined,
    remote:undefined
}
let mypeer = {
    rtc:new RTCPeerConnection({'iceServers': [{'url': 'stun:stun.services.mozilla.com'}, {'url': 'stun:stun.l.google.com:19302'}]}),
    ice_candidate:undefined
};

let videoelement = {
    local:document.getElementById('localvideo'),
    remote:document.getElementById('remotevideo')
}

const call_btn = document.querySelector('.btn.call');
const accept_btn = document.querySelector('.btn.accept');
const cancel_btn = document.querySelector('.btn.cancel');

accept_btn.disabled = true;
cancel_btn.disabled = true;


const sendSdp = (sdp,type)=> {
    
    socket.emit(type,JSON.stringify(sdp));
};

const setUpViedeoCam = ()=>{
    return new Promise((resolve,reject)=>{
         const localvideo = navigator.getUserMedia({
            video:true,
            audio:false
        },(stream)=>{
            videostream.local = stream;
            setupVideo(videoelement.local,stream);
            setupStream();
            resolve();
        },()=>{

        });
    })
   
}

const setupStream = () => {
    console.log('videostream.local',videostream.local);
    mypeer.rtc.addStream(videostream.local);
    mypeer.rtc.onaddstream = (event)=>{
        console.log(event,'>>magic');
        videoelement.remote.src = URL.createObjectURL(event.stream);
        videoelement.remote.play();
    };
}
const setUpIceCandidate = () => {
    return new Promise((resolve, reject)=>{
        mypeer.rtc.onicecandidate = (event)=> {
            console.log('ice from caller');
            resolve(event.candidate);
            if(event.candidate){
                mypeer.ice_candidate = event.candidate;
                socket.emit(SEND_ICE,JSON.stringify(mypeer.ice_candidate));
                console.log('>>SEND_ICE');
            }
            
            // sendIceCandidate(ice);
        };
    });
    
};

const calling = () => {
    setUpViedeoCam().then(()=>{
        setUpIceCandidate().then((ice)=>{
            
            console.log('ice set to ice_candidate');
        });
        mypeer.rtc.createOffer().then((desc)=>{
            mypeer.rtc.setLocalDescription(desc);
            sendSdp(desc,OFFER);
            console.log('>>SEND OFFER');
        });
    });
    
};

const accept = ()=> {
    setUpViedeoCam().then(()=>{
        setUpIceCandidate().then((ice)=>{
            
            console.log('ice set to ice_candidate');
        });
        mypeer.rtc.createAnswer().then((desc)=>{
            mypeer.rtc.setLocalDescription(desc);
            sendSdp(desc,ANSWER);
            console.log('>>SEND ANSWER');
        });
    });
    
   
};



const showAcceptOrCancel = ()=> {
    accept_btn.disabled = false;
    cancel_btn.disabled = false;
    return new Promise((resolve,reject)=>{
        accept_btn.onclick = (ice)=>{    
            // accept();
            resolve(true);
        };
    });
    
}

const listenToServer = () => {
    // Socket.on(GET_ICE,(ice)=>{
    //     mypeer.rtc.addIceCandidate(new RTCIceCandidate(ice));
    // });




    socket.on(GET_ACCEPT,(ice)=>{
        mypeer.rtc.addIceCandidate(new RTCIceCandidate(ice));
        console.log(GET_ACCEPT);
    });

    socket.on(GET_OFFER,(sdp)=>{
        console.log('>>GET OFFER');
        showAcceptOrCancel().then((isAccept)=>{
            mypeer.rtc.setRemoteDescription(new RTCSessionDescription(JSON.parse(sdp)));
            accept();
        });
        

        console.log(GET_OFFER,sdp);
    });
    
    socket.on(GET_ANSWER,(sdp)=>{
        console.log('>>GET ANSWER');
        mypeer.rtc.setRemoteDescription(new RTCSessionDescription(JSON.parse(sdp)));
        // socket.emit(SEND_ICE,JSON.stringify(mypeer.ice_candidate));
        // console.log('>>SEND_ICE',JSON.stringify(mypeer.ice_candidate));
    });

    socket.on(GET_ICE,(ice)=>{
        console.log(">>GET_ICE");
        mypeer.rtc.addIceCandidate(new RTCIceCandidate(JSON.parse(ice)));        
    });

    // socket.on(GET_ICE_BACK,(ice)=>{
    //     console.log(">>GET_ICE_BACK",ice);
    //     mypeer.rtc.addIceCandidate(new RTCIceCandidate(JSON.parse(ice)));
        
    // });
};

listenToServer();

call_btn.onclick = ()=>{
    call_btn.disabled = true;
    calling();
};
