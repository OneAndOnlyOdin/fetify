const webpack = require('webpack')
const process = require('process')
const dotenv = require('dotenv')
const path = require('path')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const ForkTsChecker = require('fork-ts-checker-webpack-plugin')
const Terser = require('terser-webpack-plugin')
const VueLoaderPlugin = require('vue-loader/lib/plugin')

dotenv.config()

const root = path.resolve(process.cwd(), 'web')
const outputFolder = path.resolve(process.cwd(), 'build', 'web')

const envs = Object.keys(process.env)
  .filter(env => env.startsWith('REACT_APP_'))
  .reduce(
    (prev, curr) =>
      Object.assign(prev, {
        [curr.slice(10)]: JSON.stringify(process.env[curr])
      }),
    {}
  )

const isProd = process.env.NODE_ENV === 'production'

const plugins = [
  new VueLoaderPlugin(),
  new HtmlWebpackPlugin({
    inject: true,
    template: path.resolve(root, 'index.html')
  }),
  new webpack.DefinePlugin({
    'process.env': envs
  }),
  new ForkTsChecker({
    tsconfig: 'tsconfig.json',
    watch: root
  }),
  !isProd && new webpack.HotModuleReplacementPlugin()
].filter(Boolean)

module.exports = {
  mode: isProd ? 'production' : 'development',
  devtool: isProd ? '#eval-source-map' : false,
  devServer: {
    open: true,
    port: 3010,
    hot: true,
    historyApiFallback: true
  },
  entry: './web/index.ts',
  output: {
    path: outputFolder,
    filename: 'bundle.js'
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js'],
    alias: {
      vue$: 'vue/dist/vue.esm.browser.min.js'
    }
  },
  module: {
    rules: [
      {
        test: /\.svg$/,
        loader: 'vue-svg-loader'
      },
      {
        test: [/\.bmp$/, /\.gif$/, /\.jpe?g$/, /\.png$/],
        use: ['file-loader']
      },
      {
        test: /\.vue$/,
        loader: 'vue-loader',
        options: {
          esModule: true
        }
      },
      {
        test: /\.(s)?css$/,
        use: [
          'style-loader',
          'css-loader',
          {
            loader: 'sass-loader',
            options: {
              prependData: `
                @import './web/styles/main.scss';
            `
            }
          }
        ]
      },
      {
        test: /\.tsx?$/,
        use: [
          {
            loader: 'ts-loader',
            options: {
              appendTsSuffixTo: [/\.vue$/],
              configFile: 'tsconfig.json',
              transpileOnly: true
            }
          }
        ]
      }
    ]
  },
  optimization: {
    usedExports: false,
    minimize: isProd,
    minimizer: [
      new Terser({
        cache: true,
        sourceMap: false,
        parallel: true,
        terserOptions: {
          compress: {
            ecma: 6,
            inline: 2
          },
          output: {
            comments: false,
            ecma: 6
          }
        }
      })
    ]
  },
  plugins
}
