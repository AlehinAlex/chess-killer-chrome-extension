const app = require('express')();
const https = require('https');
const fs = require('fs');
const PORT = 5000;
const DELAY = 5000;
// const STOCKFISH_PATH = '/usr/games/stockfish';
const STOCKFISH_PATH = __dirname + '/stockfish';
const spawn = require('child_process').spawn;


class EngineConnect {
    constructor(id, cmd, args, callback) {
        this.id = id;
        this.cmd = cmd;
        this.args = args;
        this.child = spawn(this.cmd, this.args);
        this.fen = '';

        let result = '';

        this.child.stdout.on('data', function (buffer) {
            this.stdout += buffer.toString();
            result = this.stdout;
        });

        this.child.stdout.on('end', function () {
            callback(this.stdout);
            console.log('on->end ID:', id);
        });

        let previousResult = '';
        this.loop = setInterval(() => {
            if(previousResult !== result){
                console.log('loop ID:', id, result);
                callback(result);
                previousResult = result;
            }
        }, 1000);
    }

    findBestMove(fen, delay) {
        this.fen = fen;
        this.child.stdin.write("position fen " + fen + "\ngo movetime " + delay + "\n");
    }
}


const httpsOptions = {
    key: fs.readFileSync(__dirname + '/key.pem'),
    cert: fs.readFileSync(__dirname + '/cert.pem')
};

const server = https.createServer(httpsOptions, app);

server.listen(PORT, () => {
    console.log('Server running at ' + PORT);
});

const io = require('socket.io')(server);

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/public/index.html');
});


io.on('connection', (socket) => {
    console.log('a user connected', socket.id);

    let engine = new EngineConnect(socket.id, STOCKFISH_PATH, [], (bestmove) => {
        console.log('bestmove', bestmove);
        socket.emit('on_result', {
            fen: engine.fen, data: bestmove
        });
    });

    socket.on('new_move', (data) => {
        engine.findBestMove(data.FEN, 'infinity');
    });

    socket.on('disconnect', () => {
        console.log('user disconnected', socket.id);
    });
});