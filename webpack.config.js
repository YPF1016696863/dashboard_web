/* eslint-disable */

const fs = require("fs");
const webpack = require("webpack");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const HtmlWebpackIncludeAssetsPlugin = require("html-webpack-include-assets-plugin");
const WebpackBuildNotifierPlugin = require("webpack-build-notifier");
const ManifestPlugin = require("webpack-manifest-plugin");
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CopyWebpackPlugin = require("copy-webpack-plugin");
const LessPluginAutoPrefix = require("less-plugin-autoprefix");
const BundleAnalyzerPlugin = require("webpack-bundle-analyzer")
  .BundleAnalyzerPlugin;

const path = require("path");

const isProduction = process.env.NODE_ENV === "production";
const basePath = path.join(__dirname, "client");
const appPath = path.join(__dirname, "client", "app");

const extensionsRelativePath = process.env.EXTENSIONS_DIRECTORY ||
  path.join("client", "app", "extensions");
const extensionPath = path.join(__dirname, extensionsRelativePath);

function getWebpackDevServerArg(name){
  let result = '';
  process.argv.forEach((argv)=>{
    if(argv.indexOf('--' + name) === -1) return;
    result = argv.split('=')[1];
  });
  return  result;
}

const config = {
  mode: isProduction ? "production" : "development",
  entry: {
    app: [
      "./client/app/index.js",
      "./client/app/assets/less/main.less",
      "./client/app/assets/less/ant.less"
    ],
    server: ["./client/app/assets/less/server.less"]
  },
  output: {
    path: path.join(basePath, "./dist"),
    filename: isProduction ? "[name].[chunkhash].js" : "[name].js",
    publicPath: "/static/"
  },
  resolve: {
    symlinks: false,
    extensions: ['.js', '.jsx'],
    alias: {
      "@": appPath,
      "extensions": extensionPath
    },
  },
  plugins: [
    new WebpackBuildNotifierPlugin({ title: "DataVis" }),
    // Enforce angular to use jQuery instead of jqLite
    new webpack.ProvidePlugin({ "window.jQuery": "jquery" }),
    new webpack.ProvidePlugin({ echarts: 'echarts' }),
    // bundle only default `moment` locale (`en`)
    new webpack.ContextReplacementPlugin(/moment[\/\\]locale$/, /en/),
    new webpack.DefinePlugin({
        'API_SERVER': process.env.API_SERVER?JSON.stringify(process.env.API_SERVER):JSON.stringify(getWebpackDevServerArg('api-server'))
    }),
    new HtmlWebpackPlugin({
      template: "./client/app/index.html",
      filename: "index.html",
      excludeChunks: ["server"]
    }),
    new HtmlWebpackPlugin({
      template: "./client/app/multi_org.html",
      filename: "multi_org.html",
      excludeChunks: ["server"]
    }),
    new MiniCssExtractPlugin({
      filename: "[name].[chunkhash].css"
    }),
    new ManifestPlugin({
      fileName: "asset-manifest.json",
      publicPath: "",
    }),
    new CopyWebpackPlugin([
      { from: "client/app/assets/robots.txt" },
      { from: "client/app/unsupported.html" },
      { from: "client/app/assets/css/*.css", to: "styles/", flatten: true },
      { from: "node_modules/jquery/dist/jquery.min.js", to: "js/jquery.min.js" },
    ]),
  ],
  optimization: {
    splitChunks: {
      chunks: (chunk) => {
        return chunk.name != "server";
      }
    }
  },
  module: {
    rules: [
      {
        test: /\.jsx?$/,
        exclude: /node_modules/,
        use: ["babel-loader", "eslint-loader"]
      },
      {
        test: /\.html$/,
        exclude: [/node_modules/, /index\.html/],
        use: [
          {
            loader: "raw-loader"
          }
        ]
      },
      {
        test: /\.css$/,
        use: [
          {
            loader: MiniCssExtractPlugin.loader
          },
          {
            loader: "css-loader",
            options: {
              minimize: process.env.NODE_ENV === "production"
            }
          }
        ]
      },
      {
        test: /\.less$/,
        use: [
          {
            loader: MiniCssExtractPlugin.loader
          },
          {
            loader: "css-loader",
            options: {
              minimize: process.env.NODE_ENV === "production"
            }
          },
          {
            loader: "less-loader",
            options: {
              plugins: [
                new LessPluginAutoPrefix({ browsers: ["last 3 versions"] })
              ],
              javascriptEnabled: true
            }
          }
        ]
      },
      {
        test: /\.(png|jpe?g|gif|svg)(\?.*)?$/,
        use: [
          {
            loader: "file-loader",
            options: {
              context: path.resolve(appPath, "./assets/images/"),
              outputPath: "images/",
              name: "[path][name].[ext]"
            }
          }
        ]
      },
      {
        test: /\.geo\.json$/,
        type: 'javascript/auto',
        use: [
          {
            loader: "file-loader",
            options: {
              outputPath: "data/",
              name: "[hash:7].[name].[ext]"
            }
          }
        ]
      },
      {
        test: /\.(woff2?|eot|ttf|otf)(\?.*)?$/,
        use: [
          {
            loader: "url-loader",
            options: {
              limit: 10000,
              name: "fonts/[name].[hash:7].[ext]"
            }
          }
        ]
      }
    ]
  },
  devtool: isProduction ? "source-map" : "cheap-eval-module-source-map",
  stats: {
    modules: false,
    chunkModules: false
  },
  watchOptions: {
    ignored: /\.sw.$/
  },
  devServer: {
    inline: true,
    index: "/static/index.html",
    historyApiFallback: {
      index: "/static/index.html",
      rewrites: [{ from: /./, to: "/static/index.html" }]
    },
    contentBase: false,
    publicPath: "/static/",
    stats: {
      modules: false,
      chunkModules: false
    }
  }
};

if (process.env.DEV_SERVER_HOST) {
  config.devServer.host = process.env.DEV_SERVER_HOST;
}

if (process.env.BUNDLE_ANALYZER) {
  config.plugins.push(new BundleAnalyzerPlugin());
}

module.exports = config;
