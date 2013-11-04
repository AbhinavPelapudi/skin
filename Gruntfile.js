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
		},
		getLintList = function(dir) {
			var files = [];
			grunt.file.recurse(dir, function(abspath, rootdir, subdir, filename) {
				// Add only CSS files
				// Do not add if the file is skin.css or core.css
				if(/\.css$/i.test(filename) && !/^skin\.css$|^core\.css$/i.test(filename)) {
					files.push(abspath);
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
				"csslintrc": ".csslintrc"
			},
			core: { // This has normalize.css, adding options to prevent the associated linting errors
				options: {
					"outline-none": false,
					"box-sizing": false,
					"compatible-vendor-prefixes": false
				},
				src: ['dist/core.css']
			},
			all: {
				options: {
					"vendor-prefix": false // To allow firefox backword compatibility https://developer.mozilla.org/en-US/docs/Web/CSS/border-top-right-radius#Gecko
				},
				src: getLintList('dist')
			}
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