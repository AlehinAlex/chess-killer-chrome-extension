const spawn = require('child_process').spawn;

export default class EngineConnect {
    // private loop;
    // private result = '';
    // private cmd;
    // private args;

    constructor(cmd, args) {
        this.cmd = cmd;
        this.args = args;
    }

    run(fen, delay, cb) {
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

}