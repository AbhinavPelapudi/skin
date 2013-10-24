module.exports = function(grunt) {
	"use strict";

	var getCustomFileList = function() {
			var fs = require('fs'),
				path = require('path'),
				src = 'src/',
				dest = 'dist/',
				files = {};

			fs.readdirSync(src).forEach(function(file){
				if(fs.statSync(src + '/' + file).isFile()){
					// Check if it is a less file
					if(path.extname(file) === '.less') {
						files[dest + file.replace('.less', '') + '.css'] = src + file;
					}
				} else {
					files[dest + file + '.css'] = src + file + '/' + file + '.less';
				}
			});
			return files;
		};

	// Project configuration.
	grunt.initConfig({
		pkg  : grunt.file.readJSON('package.json'),

		banner: [
			'/*!',
            'Skin v<%= pkg.version %>',
            'Copyright 2013 eBay! Inc. All rights reserved.',
            'Licensed under the BSD License.',
            'https://github.com/eBay/skin/blob/master/LICENSE.txt"',
            '*/\n'
		].join('\n'),

		// Clean config
		clean: ['dist/'],

		// CSSlint configuration
		csslint: {
			options: {
				csslintrc: '.csslintrc'
			},
			src: ['dist/**/*.css']
		},

		recess: {
			options: {
				compile: true,
				banner: '<%= banner %>'
			},
			skin: {
				files: getCustomFileList()
			}
		}
	});

	// Load the plugins
	grunt.loadNpmTasks('grunt-contrib-clean');
	grunt.loadNpmTasks('grunt-contrib-csslint');
	grunt.loadNpmTasks('grunt-recess');

	// Register tasks
	grunt.registerTask('default', ['build', 'test']);
	grunt.registerTask('test', ['csslint']);
	grunt.registerTask('build', ['clean', 'recess']);
};