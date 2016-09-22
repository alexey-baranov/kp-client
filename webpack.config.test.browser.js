/**
 * Created by alexey2baranov on 9/21/16.
 *
 * Конфиг который собирает браузерные тесты *.Test.Browser.js
 */

module.exports = Object.assign(require("./webpack.config"), {
    entry:{
        "test.browser": `mocha!${__dirname}/test/index.browser.js`,
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
});