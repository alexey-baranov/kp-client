var webpack= require('webpack');

module.exports = {
    entry: './src/index.js',
    output: {
        path: './bin',
        filename: 'index.webpack.js'
    },
    stats: {
        hash: false,
        version: false,
        timings: true,
        assets: false,
        chunks: false,
        modules: false,
        reasons: false,
        children: false,
        source: false,
        errors: true,
        errorDetails: true,
        warnings: false,
        publicPath: true
    },
    devtool: 'eval',
    watch: true,
    noParse: /jquery/,
    module: {
        loaders: [
            { test: /\.json$/, loader: 'json', },
            { test: /\.md$/, loader: "html!markdown" },
            { test: /\.js$/, loader: 'babel' }
        ]
    },
};


module.exports.devtool = 'eval';