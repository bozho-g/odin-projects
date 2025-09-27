const path = require('path');
const HtmlBundlerPlugin = require('html-bundler-webpack-plugin');

module.exports = {
    mode: 'development',
    devtool: 'eval-source-map',
    output: {
        path: path.resolve(__dirname, 'dist'),
        clean: true,
    },
    devServer: {
        watchFiles: ['src/**/*'],
        open: true,
        hot: true,
        liveReload: true,
        client: {
            overlay: true,
            progress: true,
        },
    },
    entry: './src/index.js',
    plugins: [
        new HtmlBundlerPlugin({
            entry: { index: 'src/template.html' },
            js: { filename: 'js/[name].[contenthash:8].js' },
            css: { filename: 'css/[name].[contenthash:8].css' },
        }),
    ],
    module: {
        rules: [
            {
                test: /\.js$/,
                exclude: /node_modules/,
                type: 'javascript/auto',
            },
            {
                test: /\.css$/i,
                use: ['css-loader'],
            },
            {
                test: /\.(png|svg|jpg|jpeg|gif)$/i,
                type: 'asset/resource',
                generator: {
                    filename: 'assets/img/[name].[hash:8][ext]',
                },
            },
        ],
    },

};