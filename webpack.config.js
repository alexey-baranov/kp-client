var webpack= require('webpack');

module.exports = {
    entry: {
        "index": './src/index.js',
        "poligon-log4javascript": './src/poligon-log4javascript.js'
    },
    output: {
        path: __dirname+'/bin',
        filename: '[name].webpack.js'
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
    plugins:[
        new webpack.NoErrorsPlugin(),
        new webpack.dependencies.LabeledModulesPlugin()
    ],
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