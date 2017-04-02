const CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = {
    context: `${__dirname}`,
    entry: {
        "content_scripts/contents_script": './content_scripts/content_scripts.js',
        "content_scripts/jira": './content_scripts/jira.js',
        "popup/popup": './popup/popup.js',
        "options/options": './options/options.js'
    },
    output: {
        path: `${__dirname}/target`,
        filename: '[name].js'
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
