//@ts-check

'use strict'

const path = require('path')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const fs = require('fs')
const CopyPlugin = require('copy-webpack-plugin')
const ncc = require('@vercel/ncc')

// const vm2Dir = (file) => path.resolve(__dirname, 'node_modules/vm2/lib/' + file)
// const vm2CopyFile = [
//     'bridge.js',
//     'events.js',
//     'setup-sandbox.js',
//     'setup-node-sandbox.js',
// ].map((js) => vm2Dir(js))

//@ts-check
/** @typedef {import('webpack').Configuration} WebpackConfig **/

/** @type WebpackConfig */
const extensionConfig = {
    target: 'node', // VS Code extensions run in a Node.js-context 📖 -> https://webpack.js.org/configuration/node/
    mode: 'none', // this leaves the source code as close as possible to the original (when packaging we set this to 'production')

    entry: './src/extension.ts', // the entry point of this extension, 📖 -> https://webpack.js.org/configuration/entry-context/
    output: {
        // the bundle is stored in the 'dist' folder (check package.json), 📖 -> https://webpack.js.org/configuration/output/
        path: path.resolve(__dirname, 'dist'),
        filename: 'extension.js',
        libraryTarget: 'commonjs2',
        clean: {
            keep: /assets|NeteaseCloudMusicApi/,
        },
    },
    externals: {
        vscode: 'commonjs vscode', // the vscode-module is created on-the-fly and must be excluded. Add other modules that cannot be webpack'ed, 📖 -> https://webpack.js.org/configuration/externals/
        // modules added here also need to be added in the .vscodeignore file
    },
    resolve: {
        alias: {
            handlebars: 'handlebars/dist/handlebars.js'
        },
        // support reading TypeScript and JavaScript files, 📖 -> https://github.com/TypeStrong/ts-loader
        extensions: ['.ts', '.js'],
    },
    module: {
        rules: [
            {
                test: /\.ts$/,
                exclude: /node_modules/,
                use: [
                    {
                        loader: 'ts-loader',
                    },
                ],
            },
        ],
        parser: {
            javascript: {
                commonjsMagicComments: true,
            },
        },
    },
    ignoreWarnings: [
        {
            message: /Can't resolve 'coffee-script'/,
        },
    ],
    devtool: 'nosources-source-map',
    infrastructureLogging: {
        level: 'log', // enables logging required for problem matchers
    },
    plugins: [
        new HtmlWebpackPlugin({
            template: 'index.html',
            inject: false,
        }),
        // new CopyPlugin({
        //     patterns: [
        //         ...vm2CopyFile.map((js) => ({
        //             from: js,
        //         })),
        //         {
        //             from: 'node_modules/NeteaseCloudMusicApi/module',
        //             to: 'module',
        //         },
        //     ],
        // })
    ],
}

module.exports = [extensionConfig]
