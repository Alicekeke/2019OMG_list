module.exports = {
  entry: __dirname + "/src/index.js",
  output: {
      path: __dirname + '/build',
      filename: 'bundle.js'
  },
  // module: {
  //   rules: [
  //     {
  //       test: /\.json$/,
  //       use: 'json-loader'
  //     }
  //   ]
  // }
};