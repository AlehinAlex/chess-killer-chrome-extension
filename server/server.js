const app = require('express')();
const https = require('https');
const fs = require('fs');
const PORT = 5000;
const spawn = require('child_process').spawn;

const EngineConnect = function (cmd, args) {
    this.cmd = cmd;
    this.args = args;
}

EngineConnect.prototype.run = function (fen, delay, cb) {
    this.result = '';
    if (this.loop) {
        clearInterval(this.loop);
    }

    const child = spawn(this.cmd, this.args);

    child.stdout.on('data', function (buffer) {
        this.stdout += buffer.toString();
        result = this.stdout;
    });

    child.stdout.on('end', function () {
        cb(this.stdout);
    });

    child.stdin.write("position fen " + fen + "\ngo movetime " + delay + "\n");

    this.loop = setInterval(() => {
        cb(result);
    }, 1000);
}

const httpsOptions = {
    key: fs.readFileSync(__dirname + '/key.pem'),
    cert: fs.readFileSync(__dirname + '/cert.pem')
};

const server = https.createServer(httpsOptions, app).listen(PORT, () => {
    console.log('server running at ' + PORT);
});

const io = require('socket.io')(server);

let loop;

function runCmd(cmd, args, fen, delay, cb) {
    if (loop) {
        clearInterval(loop);
    }

    const spawn = require('child_process').spawn,
        child = spawn(cmd, args);

    let result = '';
    child.stdout.on('data', function (buffer) {
        this.stdout += buffer.toString();
        result = this.stdout;
    });

    child.stdout.on('end', function () {
        cb(this.stdout);
    });

    child.stdin.write("position fen " + fen + "\ngo movetime " + delay + "\n");

    loop = setInterval(() => {
        cb(result);
    }, 1000);
}

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/public/socket.html');
});

io.on('connection', (socket) => {
    console.log('a user connected', socket.id);

    socket.on('new_move', (data) => {
        const engine = new EngineConnect(__dirname + '/stockfish', []);
        engine.run(data.FEN, 20000, (bestmove) => {
            socket.emit('on_result', {fen: data.FEN, data: bestmove});
        });
    });

    socket.on('disconnect', () => {
        console.log('user disconnected', socket.id);
    });
});