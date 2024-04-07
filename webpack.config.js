const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

module.exports = {
  mode: 'development',
  devtool: 'inline-source-map',
  entry: {
    '1-bar-chart': './src/1-bar-chart/index.ts',
    '2-scatterplot-graph': './src/2-scatterplot-graph/index.ts',
    '3-heat-map': './src/3-heat-map/index.ts',
    '4-choropleth-map': './src/4-choropleth-map/index.ts',
    '5-treemap-diagram': './src/5-treemap-diagram/index.ts',
  },
  output: {
    filename: '[name]/index.js',
    path: path.resolve(__dirname, 'dist'),
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: [
          {
            loader: 'ts-loader',
          },
        ],
      },
      {
        test: /\.json$/,
        use: [
          {
            loader: 'url-loader',
            options: {
              limit: 8192,
            },
          },
        ],
        type: 'javascript/auto',
      },
      {
        test: /\.scss$/,
        use: [
          MiniCssExtractPlugin.loader, // Extracts CSS into separate files
          'css-loader', // Translates CSS into CommonJS
          'sass-loader', // Compiles Sass to CSS
        ],
      },
    ],
  },
  plugins: [
    new MiniCssExtractPlugin({
      filename: '[name]/styles.css',
    }),
    ...[
      '1-bar-chart',
      '2-scatterplot-graph',
      '3-heat-map',
      '4-choropleth-map',
      '5-treemap-diagram',
    ].map(
      (name) =>
        new HtmlWebpackPlugin({
          filename: `${name}/index.html`,
          chunks: [name],
          template: `./src/${name}/index.html`,
        }),
    ),
  ],
  devServer: {
    static: {
      directory: path.join(__dirname, 'dist'),
    },
    compress: true,
    port: 8080,
    open: true,
    hot: true,
  },
};
