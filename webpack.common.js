const path = require('path');
const CopyPlugin = require('copy-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  entry: {
    popup: path.resolve('src/popup/index.tsx'),
    options: path.resolve('src/options.js'),
    background: path.resolve('src/background/index.ts'),
    content: path.resolve('src/content/index.ts'),
  },
  module: {
    rules: [
      {
        test: /\.(js|jsx|ts|tsx)$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: [
              '@babel/preset-env',
              '@babel/preset-react',
              '@babel/preset-typescript',
            ],
          },
        },
      },
      {
        test: /\.css$/i,
        use: ['style-loader', 'css-loader'],
      },
      {
        test: /\.(png|jpg|jpeg|gif|svg)$/i,
        type: 'asset/resource',
      },
    ],
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js', '.jsx'],
  },
  plugins: [
    new CopyPlugin({
      patterns: [
        { 
          from: path.resolve('src/manifest.json'), 
          to: path.resolve('dist') 
        },
        { 
          from: path.resolve('src/assets'), 
          to: path.resolve('dist/assets') 
        },
        {
          from: path.resolve('src/options.html'),
          to: path.resolve('dist/options.html')
        }
      ],
    }),
    new HtmlWebpackPlugin({
      template: path.resolve('src/popup/index.html'),
      filename: 'popup.html',
      chunks: ['popup'],
    }),
  ],
  output: {
    filename: '[name].js',
    path: path.resolve('dist'),
    clean: true,
  },
  optimization: {
    splitChunks: {
      chunks: 'all',
    },
  },
}; 