const webpack = require("webpack");
const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const webpackBundleAnalyzer = require("webpack-bundle-analyzer");
const CopyPlugin = require("copy-webpack-plugin");

process.env.NODE_ENV = "production";

module.exports = {
  mode: "production",
  devtool: "source-map",
  entry: {
    main: path.resolve(__dirname, "src/index"),
  },
  output: {
    path: path.resolve(__dirname, "build"),
    filename: "[name].[chunkhash].js",
  },
  optimization: {
    splitChunks: {
      cacheGroups: {
        commons: {
          test: /[\\/]node_modules[\\/]/,
          name: "vendor",
          chunks: "initial",
        },
      },
    },
  },
  plugins: [
    new webpack.DefinePlugin({
      "process.env.NODE_ENV": JSON.stringify(process.env.NODE_ENV),
      "process.env.BASENAME": JSON.stringify("/test"),
      "process.env.API_URL": JSON.stringify("/apiv2"),
      "process.env.HELP_EMAIL": JSON.stringify("3dexcite.picgen@3ds.com"),
      "process.env.IMAGEGEN_URL": JSON.stringify("/apeximagegen"),
    }),
    new CopyPlugin({
      patterns: [{ from: "public", to: "" }],
    }),
    // Create HTML file that includes reference to bundled JS.
    new HtmlWebpackPlugin({
      template: "public/index.html",
      favicon: "public/favicon.ico",
      minify: {
        removeComments: true,
        collapseWhitespace: true,
        removeRedundantAttributes: true,
        useShortDoctype: true,
        removeEmptyAttributes: true,
        removeStyleLinkTypeAttributes: true,
        keepClosingSlash: true,
        minifyJS: true,
        minifyCSS: true,
        minifyURLs: true,
      },
    }),

    // Generate an external css file with a hash in the filename
    new MiniCssExtractPlugin({
      filename: "[name].[chunkhash].css",
    }),
    new webpackBundleAnalyzer.BundleAnalyzerPlugin({ analyzerMode: "disabled" }),
  ],
  module: {
    rules: [
      { test: /\.js$/, exclude: /node_modules/, use: ["babel-loader"] },
      {
        test: /\.css$/,
        use: [MiniCssExtractPlugin.loader, "css-loader"],
      },
      {
        test: /\.(ttf|png|jpg|gif|svg)$/,
        use: [
          {
            loader: "file-loader",
          },
        ],
      },
      {
        test: /react-spring/,
        sideEffects: true,
      },
    ],
  },
};
