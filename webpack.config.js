const webpack = require('webpack');
const path = require('path');
const { execSync } = require('child_process');
const TerserPlugin = require('terser-webpack-plugin');
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin');

const userscriptHeader = require('./config/header.json');
const userscriptExclusionList = require('./config/exclusion_list.json');

function getCurrentBranch() {
  try {
    return execSync('git branch --show-current').toString().trim();
  } catch (err) {
    return '';
  }
}

module.exports = (env, argv) => {
  const isDevelopment = getCurrentBranch().startsWith('dev-') ? true : false;
  if (isDevelopment) {
    const now = new Date();
    userscriptHeader.name = `${userscriptHeader.name}-test`;
    userscriptHeader.version = `${now.getFullYear()}${(now.getMonth() + 1).toString().padStart(2, '0')}${(now.getDate() + 1).toString().padStart(2, '0')}.${now.getHours()}.${now.getMinutes()}`;
  }
  return {
    plugins: [
      new webpack.BannerPlugin({
        banner: function () {
          const lines = [];
          lines.push('==UserScript==');
          let maxLength = 'exclude'.length;
          for (const key in userscriptHeader) {
            const thisLength = String(key).length;
            if (thisLength > maxLength) {
              maxLength = thisLength;
            }
          }
          const padding = maxLength + 2;
          for (const key in userscriptHeader) {
            if (key === 'updateURL' || key === 'downloadURL') {
              if (isDevelopment) continue;
            }
            lines.push(`@${String(key).padEnd(padding, ' ')}${userscriptHeader[key]}`);
          }
          for (const website of userscriptExclusionList.exclusion_list) {
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
        stage: webpack.Compilation.PROCESS_ASSETS_STAGE_OPTIMIZE
      })
    ],
    target: ['web', 'es6'], // Target the browser environment (es6 is the default for browsers)
    mode: 'production', // Set the mode to 'production' or 'development'
    entry: './src/index.ts', // Entry point of your application
    output: {
      filename: `${userscriptHeader.name}.user.js`, // Output bundle filename
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
              presets: [['@babel/preset-env', { exclude: ['@babel/plugin-transform-regenerator', '@babel/plugin-transform-template-literals'] }], '@babel/preset-flow', 'babel-preset-modules', '@babel/preset-typescript'],
              plugins: ['@babel/plugin-syntax-flow']
            }
          }
        },
        {
          test: /\.css$/i,
          use: [
            { loader: 'style-loader', options: { attributes: { id: 'auto-dark-mode-css' }, injectType: 'singletonStyleTag' } },
            'css-loader',
            {
              loader: 'postcss-loader',
              options: {
                postcssOptions: {
                  plugins: [['postcss-preset-env', {}], require('cssnano')({ preset: 'default' })]
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
          extractComments: true
          /*
          terserOptions: {
            compress: {
              inline: false,
              loops: false
            }
          }
          */
        }),
        new CssMinimizerPlugin()
      ]
    }
  };
};
