const app = require('express')();
const https = require('https');
const fs = require('fs');
const PORT = 5000;
const STOCKFISH_PATH = '/usr/games/stockfish';
// const STOCKFISH_PATH = __dirname + '/stockfish';
const spawn = require('child_process').spawn;


class EngineConnect {
    constructor(cmd, args) {
        this.cmd = cmd;
        this.args = args;
        this.child = spawn(this.cmd, this.args);
    }

    findBestMove(fen, delay, cb) {
        let result = '';
        if (this.loop) {
            clearInterval(this.loop);
        }

        this.child.stdout.on('data', function (buffer) {
            this.stdout += buffer.toString();
            result = this.stdout;
        });

        this.child.stdout.on('end', function () {
            cb(this.stdout);
        });

        this.child.stdin.write("position fen " + fen + "\ngo movetime " + delay + "\n");

        this.loop = setInterval(() => {
            cb(result);
        }, 1000);

        // setTimeout(() => {
        //     this.child.stdin.end();
        // }, delay);

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

let loop;

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/public/index.html');
});


let engine = new EngineConnect(STOCKFISH_PATH, []);

io.on('connection', (socket) => {
    console.log('a user connected', socket.id);

    socket.on('new_move', (data) => {
        engine.findBestMove(data.FEN, 20000, (bestmove) => {
            socket.emit('on_result', {fen: data.FEN, data: bestmove});
        });
    });

    socket.on('disconnect', () => {
        console.log('user disconnected', socket.id);
    });
});