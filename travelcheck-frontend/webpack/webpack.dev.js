/**
 * @file Webpack开发环境配置
 * @description 开发服务器和热更新配置
 */

const { merge } = require("webpack-merge");
const common = require("./webpack.common.js");

module.exports = merge(common, {
  mode: "development",
  devtool: "inline-source-map",

  devServer: {
    static: "./dist",
    hot: true,
    port: 3001,
    open: false,
    historyApiFallback: true,
    compress: true,
    client: {
      overlay: {
        errors: true,
        warnings: false
      }
    }
  },

  optimization: {
    runtimeChunk: "single"
  }
});
