const path = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');

// Is the current build a development build
const IS_DEV = (process.env.NODE_ENV === 'dev');

const dirNode = 'node_modules';
const dirApp = path.join(__dirname, 'app');
console.log(dirApp);
/**
 * Webpack Configuration
 */
module.exports = {
    devtool : 'sourcemap',

    output  : {
        pathinfo   : true,
        publicPath : '/chromeExtension/',
        path: __dirname + '/chromeExtension',
        filename   : 'content.js'
    },
    entry   : {
        bundle : './app/index.js'
    },
    resolve : {
        modules : [
            dirNode,
            dirApp
        ]
    },
    plugins : [
        new webpack.DefinePlugin({
            IS_DEV : IS_DEV
        })
    ],
    module  : {
        rules : [
            // BABEL
            {
                test    : /\.js$/,
                loader  : 'babel-loader',
                exclude : /(node_modules)/,
                options : {
                    compact : true
                }
            }
        ]
    }
};
