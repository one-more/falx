var path = require('path');

module.exports = {
    output: {
        path: path.join(__dirname, 'dist'),
        filename: 'main.js',
        library: 'falx',
        libraryTarget:'umd'
    },
    module: {
        rules: [
            { test: /\.js$/, exclude: /node_modules/, loader: "babel-loader" }
        ]
    }
};