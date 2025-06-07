const webpack = require('webpack');
const path = require('path');
const fs = require('fs');
const TerserPlugin = require('terser-webpack-plugin');
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin');

var userscriptHeader = require('./config/header.json');
var userscriptExclusionList = require('./config/exclusion_list.json');

module.exports = (env, argv) => {
  const isProduction = argv.mode === 'production';
  return {
    plugins: [
      new webpack.BannerPlugin({
        banner: function () {
          var lines = [];
          lines.push('==UserScript==');
          var lengthes = ['exclude'.length];
          for (var key in userscriptHeader) {
            lengthes.push(String(key).length);
          }
          var padding = Math.max(...lengthes) + 2;
          for (var key in userscriptHeader) {
            lines.push(`@${String(key).padEnd(padding, ' ')}${userscriptHeader[key]}`);
          }
          for (var website of userscriptExclusionList.exclusion_list) {
            lines.push(`@${'exclude'.padEnd(padding, ' ')}${website.pattern}`);
          }
          lines.push('==/UserScript==');
          return lines
            .map((e) => {
              return `// ${e}`;
            })
            .join('\n');
        },
        raw: true, // if true, banner will not be wrapped in a comment
        entryOnly: true, // if true, the banner will only be added to the entry chunks,
        test: /\.js$/,
        stage: webpack.Compilation.PROCESS_ASSETS_STAGE_REPORT
      })
    ],
    target: ['web', 'es6'], // Target the browser environment (es6 is the default for browsers)
    mode: 'production', // Set the mode to 'production' or 'development'
    entry: './src/index.ts', // Entry point of your application
    output: {
      filename: isProduction ? 'auto-dark-mode.user.js' : 'auto-dark-mode.dev.js', // Output bundle filename
      path: path.resolve(__dirname, 'dist'), // Output directory for bundled files
      publicPath: './',
      library: {
        name: 'autodarkmode',
        type: 'var',
        export: 'default'
      }
    },
    module: {
      rules: [
        {
          test: /\.js|ts|jsx|tsx?$/, // Use babel-loader for TypeScript files
          exclude: /node_modules/,
          use: {
            loader: 'babel-loader',
            options: {
              presets: ['@babel/preset-env', '@babel/preset-flow', 'babel-preset-modules', '@babel/preset-typescript'],
              plugins: ['@babel/plugin-syntax-flow']
            }
          }
        },
        {
          test: /\.css$/i,
          use: [
            'style-loader',
            'css-loader',
            {
              loader: 'postcss-loader',
              options: {
                postcssOptions: {
                  plugins: [
                    [
                      'postcss-preset-env',
                      {
                        // Options
                      }
                    ]
                  ]
                }
              }
            }
          ] // applied in reverse
        }
      ]
    },
    resolve: {
      extensions: ['.ts', '.tsx', '.js', '.jsx', '.css'], // File extensions to resolve
      mainFields: ['browser', 'module', 'main']
    },
    optimization: {
      minimize: true,
      minimizer: [
        new TerserPlugin({
          //terserOptions: {},
          extractComments: false
        }),
        new CssMinimizerPlugin()
      ]
    }
  };
};
