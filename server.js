const fs = require('fs');

// var options = {
//   key: fs.readFileSync('key.pem'),
//   cert: fs.readFileSync('cert.pem')
// };

const app = require('http').createServer(handler);
const io = require('socket.io')(app);

const static = require('node-static');
const file = new static.Server();
const adapter = require('socket.io-adapter');
const {JOIN_ROOM,JOIN_ROOM_SUCCESS,JOIN_ROOM_FAIL,SEND_ICE,GET_ICE,OFFER,ANSWER,ACCEPT,GET_ACCEPT,GET_ANSWER,GET_OFFER,SEND_ICE_BACK,GET_ICE_BACK} = require('./src/events_cjs');
const roomtrack = {};
app.listen((process.env.PORT || 5000));

function handler (req, res) {
  req.addListener('end', function () {
        file.serve(req, res);
    }).resume();
}

io.on('connection', (socket) => {
    socket.on(JOIN_ROOM, (room)=>{
        const num_clients = io.sockets.adapter.rooms[room] ? io.sockets.adapter.rooms[room].length : 0;
        if(num_clients < 2){
            socket.join(room);
            roomtrack[socket.id] = room;
            socket.emit(JOIN_ROOM_SUCCESS,`the room named ${room} is full.`);
        }else{
            socket.emit(JOIN_ROOM_FAIL,`the room named ${room} is full.`);
        }
    });
    socket.on(SEND_ICE, (ice)=>{
        socket.to(roomtrack[socket.id]).emit(GET_ICE,ice);
    });
    socket.on(SEND_ICE_BACK, (ice)=>{
        socket.to(roomtrack[socket.id]).emit(GET_ICE_BACK,ice);
    });
    
    socket.on(ACCEPT, (ice)=>{
        socket.to(roomtrack[socket.id]).emit(GET_ACCEPT,ice);
    });
    socket.on(OFFER, (sdp)=>{
        socket.to(roomtrack[socket.id]).emit(GET_OFFER,sdp);
        console.log(`${OFFER} --> ${GET_OFFER}`);
    });
    socket.on(ANSWER, (sdp)=>{
        socket.to(roomtrack[socket.id]).emit(GET_ANSWER,sdp);
    });
});

console.log('start serving');