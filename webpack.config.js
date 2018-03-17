const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CleanWebpackPlugin = require('clean-webpack-plugin');

const paths = {
	scripts: 'src/js/**/*.*',
	styles: 'src/less/**/*.*',
	images: 'src/img/**/*.*',
	templates: 'src/templates/**/*.html',
	index: './src/index.html',
	bower_fonts: 'src/components/**/*.{ttf,woff,eof,svg,woff2,eot,otf}',
	other: 'src/*.{swf,xml}',
	videojs: 'src/videojs/*.{css,js}',
	pouchdb: 'src/components/pouchdb/dist/{pouchdb,pouchdb.find}.min.js',
	datepicker: 'src/datepicker/*.*'
};

module.exports = {
	entry: './src/components/pouchdb/dist/pouchdb.min.js',
	output: {
		filename: 'bundle.js',
		path: path.resolve(__dirname, 'dest')
	},
	devtool: 'inline-source-map',
	devServer: {
		contentBase: '.dest'
	},
	plugins: [
		new CleanWebpackPlugin(['dest']),
		new HtmlWebpackPlugin({
			title: 'Output Management'
		})
	],
	module: {
		rules: [
			{
				test: /\.css$/,
				use: [
					'style-loader',
					'css-loader'
				]
			},
			{
				test: /\.(png|svg|jpg|gif)$/,
				use: [
					'file-loader'
				]
			}
		]
	}
};