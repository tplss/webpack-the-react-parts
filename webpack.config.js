const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const merge = require("webpack-merge");
const webpack = require("webpack");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const WebpackMonitor = require("webpack-monitor");

const pkg = require("./package.json");

const PATHS = {
  app: path.join(__dirname, "app"),
  build: path.join(__dirname, "build"),
};

const commonConfig = {
  entry: PATHS.app,
  resolve: {
    extensions: [".js", ".jsx"],
  },
  output: {
    path: PATHS.build,
    filename: "[name].js",
  },
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        loader: "@sucrase/webpack-loader",
        options: {
          transforms: ["jsx"],
        },
      },
    ],
  },
  plugins: [
    new HtmlWebpackPlugin({
      title: "Kanban app",
    }),
  ],
};

const developmentConfig = {
  devServer: {
    historyApiFallback: true,
    hot: true,
    inline: true,

    // display only errors to reduce the amount of output
    stats: "errors-only",

    // parse host and port from env so this is easy
    // to customize
    host: process.env.HOST,
    port: process.env.PORT,
  },
  module: {
    rules: [
      // Define development specific CSS setup
      {
        test: /\.css$/,
        use: ["style-loader", "css-loader"],
      },
    ],
  },
  plugins: [new webpack.HotModuleReplacementPlugin()],
};

const productionConfig = {
  entry: {
    app: PATHS.app,
  },
  output: {
    path: PATHS.build,
    filename: "[name].[chunkhash].js",
    chunkFilename: "[chunkhash].js",
  },
  optimization: {
    splitChunks: {
      chunks: "initial",
    },
    runtimeChunk: {
      name: "manifest",
    },
  },
  module: {
    rules: [
      // Extract CSS during build
      {
        test: /\.css$/,
        use: [MiniCssExtractPlugin.loader, "css-loader"],
        include: PATHS.app,
      },
    ],
  },
  plugins: [
    // Output extracted CSS to a file
    new MiniCssExtractPlugin({
      filename: "[name].css",
      chunkFilename: "[id].css",
    }),
  ],
};

const monitorConfig = {
  mode: "development",
  plugins: [
    new WebpackMonitor({
      capture: true,
      launch: true,
    }),
  ],
};

module.exports = mode => {
  if (mode === "development") {
    return merge(commonConfig, developmentConfig, { mode });
  }

  if (mode === "monitor") {
    return merge(commonConfig, productionConfig, monitorConfig);
  }

  return merge(commonConfig, productionConfig, { mode });
};
