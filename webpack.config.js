const CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = {
    context: `${__dirname}`,
    entry: {
        content_scripts: './content_scripts/content_scripts.js',
        popup: './popup/popup.js',
        options: './options/options.js'
    },
    output: {
        path: `${__dirname}/target`,
        filename: '[name]/[name].js'
    },
    cache: true,
    plugins: [
        new CopyWebpackPlugin([
            { from: './manifest.json' },
            { from: './options/options.html', to: './options/'},
            { from: './popup/input_id.html', to: './popup/' }
        ])
    ]
};