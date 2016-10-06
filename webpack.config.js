/**
 * Конфиг который собирает приложение
 * @type {webpack}
 */

var webpack= require('webpack');

module.exports = {
    entry: {
        // "karma.test": `./test/Karma.test.js`,
        // "test.browser": `mocha!${__dirname}/test/index.browser.js`,
        // "index": './src/index.js',
        // "poligon-log4javascript": './src/poligon-log4javascript.js',
        // "test": 'mocha!./test/view/index.js'
        // "bootstrap": './src/bootstrap.js',
        //'mocha!./test/view/index.js',
        "poligon-vue": "./public/poligonvue/js/logic.js"
    },
    output: {
        path: __dirname+'/bin',
        filename: '[name].webpack.js',
        publicPath: 'http://localhost:8081/bin'

    // library:'[name]',
    },
    resolve: {
        alias: {
            vue: 'vue/dist/vue.js'
        }
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
    // devtool: 'eval',
    devtool: 'cheap-module-source-map',
    // devtool: 'inline-source-map',
    plugins:[
        new webpack.NoErrorsPlugin(),
        new webpack.dependencies.LabeledModulesPlugin(),
        new webpack.IgnorePlugin(/vertx/),
    ],
    watch: true,
    module: {
        loaders: [
            { test: /\.json$/, loader: 'json', },
            { test: /\.md$/, loader: "html!markdown" },
            { test: /\.js$/, loader: 'babel' },
            { test: /\.vue$/, loader: 'vue' },
        ]
    },
    devServer: {
        host: "localhost",
        port: 8081,
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
    }
};