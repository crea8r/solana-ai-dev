// webpack.config.mjs
import path from 'path';
import { fileURLToPath } from 'url';
import MonacoWebpackPlugin from 'monaco-editor-webpack-plugin';

// Resolve __dirname in ES module format
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default {
  entry: './src/index.js',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'bundle.js',
    publicPath: '/', 
  },
  module: {
    rules: [
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader'],
      },
    ],
  },
  plugins: [
    new MonacoWebpackPlugin({
      languages: ['javascript', 'typescript', 'json', 'css', 'html'], 
    }),
  ],
  resolve: {
    extensions: ['.js', '.jsx', '.ts', '.tsx'], 
  },
  devServer: {
    static: {
      directory: path.join(__dirname, 'public'),
    },
    compress: true,
    port: 3000,
    historyApiFallback: true,
  },
  mode: 'development',
};
