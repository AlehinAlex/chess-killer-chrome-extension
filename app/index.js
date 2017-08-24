import * as $ from 'jquery';
import * as io from "socket.io-client";
const Chess = require('chess.js');
const HOST = 'https://localhost:5000/';
const $banner = $('<div style="position: absolute;top:0;left:0;width:100%;height:30px;background-color: beige;"></div>');


const socket = io.connect(HOST);

const showResult = (text) => {
    $banner.html(text);
};

const getMoves = () => {
    return $('.moves').find('move');
};

const parseResult = (result, fen) => {
    const tmp = result.split(' pv');
    const l = tmp.length;
    const bestconstiantLine = tmp[l - 2];

    if (bestconstiantLine) {
        const bestconstiantWithDepthArr = bestconstiantLine.split('info');
        const bestconstiant = bestconstiantWithDepthArr[0];
        const moves = bestconstiant.split(' ');
        const chessNewconstiant = new Chess(fen);

        $.each(moves, (index, move) => {
            if (move !== '') {
                const from = move.substr(0, 2);
                const to = move.substr(2, 4);

                chessNewconstiant.move({
                    from,
                    to
                });
            }

        });

        const fullPGN = chessNewconstiant.pgn({newline_char: "__SEP__"});
        const notation = fullPGN.split("__SEP__");
        showResult(notation[3]);
    }
}

socket.on('on_result', (obj) => {
    parseResult(obj.data, obj.fen);
})


try {
    $('body').append($banner);

    const init = () => {
        const chess = new Chess();

        getMoves().each((index, el) => {
            let move = el.innerText;
            move = move.replace('х', 'x');
            chess.move(move);
        });

        let fen = chess.fen();

        console.log(['-----------------------']);
        console.log(['-------Init----------']);
        console.log(['-----------------------']);
        console.log(chess.ascii());
        console.log(chess.pgn());

        socket.emit('new_move', {FEN: fen});
    };


    const target = document.querySelector('.moves');

    if (target) {
        // create an observer instance
        const observer = new MutationObserver(function (mutations) {
            init();
        });

        // configuration of the observer:
        const config = {attributes: false, childList: true, characterData: false}

        // pass in the target node, as well as the observer options
        observer.observe(target, config);
    }

} catch (err) {
    console.log(err);
}