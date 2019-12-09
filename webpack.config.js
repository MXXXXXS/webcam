const path = require('path')
const HTMLWebpackPlugin = require('html-webpack-plugin')

const isProduction = typeof NODE_ENV !== 'undefined' && NODE_ENV === 'production'
const mode = isProduction ? 'production' : 'development'

const public = path.resolve(__dirname, 'public')
const dist = path.resolve(__dirname, 'dist')

const entryIndex = path.resolve(__dirname, 'src/app/index.tsx')
const entryServer = path.resolve(__dirname, 'src/server/server.ts')

//HTMLWebpackPlugin's options
const indexTemplate = path.resolve(public, 'index.html')
const favicon = path.resolve(public, 'favicon.ico')

//clean-webpack-plugin
const { CleanWebpackPlugin } = require('clean-webpack-plugin')

const base = {
  mode: mode,
  watch: true,
  devtool: 'source-map',
  devServer: {
    open: true,
    compress: true,
    contentBase: public,
    https: true,
    host: '0.0.0.0',
    port: 8080,
    watchContentBase: true,
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: [{
          loader: 'babel-loader'
        }],
        exclude: /node_modules/,
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader']
      },
      {
        test: /\.html?$/,
        use: [{
          loader: 'html-loader',
          options: { minimize: isProduction }
        }]
      }
    ]
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js']
  },
}

const configs = [
  {
    entry: { index: entryIndex },
    output: {
      filename: '[name].js',
      path: path.resolve(dist, 'app'),
      publicPath: '/'
    },
    plugins: [
      // new CleanWebpackPlugin(),
      new HTMLWebpackPlugin({
        template: indexTemplate,
        favicon: favicon,
        filename: 'index.html'
      })
    ]
  },
  {
    target: 'node',
    node: {
      __dirname: false,
      __filename: false,
    },
    entry: { server: entryServer },
    output: {
      filename: '[name].js',
      path: path.resolve(dist, 'server'),
    },
    plugins: [
      // new CleanWebpackPlugin(),
    ],
    module: {
      rules: [
        {
          test: /\.tsx?$/,
          use: [{
            loader: 'babel-loader',
          }],
          exclude: /node_modules/,
        },
        {
          test: /\.node$/,
          use: [{
            loader: 'node-loader'
          }]
        }
      ]
    }
  },
]

module.exports = configs.map(config => Object.assign({}, base, config))