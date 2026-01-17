/**
 * @file Webpack通用配置
 * @description 开发和生产环境共享的配置
 */

const path = require("node:path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const webpack = require("webpack");
require("dotenv").config({ path: path.resolve(__dirname, "../.env.local") });

module.exports = {
  entry: path.resolve(__dirname, "../src/index.tsx"),

  output: {
    path: path.resolve(__dirname, "../dist"),
    filename: "[name].[contenthash].js",
    clean: true,
    publicPath: "/"
  },

  resolve: {
    extensions: [".tsx", ".ts", ".js", ".jsx"],
    alias: {
      "@": path.resolve(__dirname, "../src"),
      "@/components": path.resolve(__dirname, "../src/components"),
      "@/pages": path.resolve(__dirname, "../src/pages"),
      "@/hooks": path.resolve(__dirname, "../src/hooks"),
      "@/store": path.resolve(__dirname, "../src/store"),
      "@/services": path.resolve(__dirname, "../src/services"),
      "@/types": path.resolve(__dirname, "../src/types"),
      "@/utils": path.resolve(__dirname, "../src/utils"),
      "@/constants": path.resolve(__dirname, "../src/constants"),
      "@/styles": path.resolve(__dirname, "../src/styles")
    }
  },

  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: "ts-loader",
        exclude: /node_modules/
      },
      {
        test: /\.css$/,
        use: ["style-loader", "css-loader", "postcss-loader"]
      },
      {
        test: /\.(png|svg|jpg|jpeg|gif)$/i,
        type: "asset/resource"
      },
      {
        test: /\.(woff|woff2|eot|ttf|otf)$/i,
        type: "asset/resource"
      }
    ]
  },

  plugins: [
    new HtmlWebpackPlugin({
      template: path.resolve(__dirname, "../public/index.html"),
      title: "TravelCheck - 区块链旅行打卡",
      meta: {
        viewport: "width=device-width, initial-scale=1, shrink-to-fit=no"
      }
    }),
    new webpack.DefinePlugin({
      "process.env.VITE_SIGNER_PRIVATE_KEY": JSON.stringify(process.env.VITE_SIGNER_PRIVATE_KEY || ""),
      "process.env.VITE_API_BASE_URL": JSON.stringify(process.env.VITE_API_BASE_URL || "")
    })
  ]
};
