#!/usr/bin/env node

/**
 * generator.js
 *
 * CLI to generate the lib directory with CSS files
 * generated from src/less
 *
*/

// dependencies
var less = require('less'),
	fs = require('fs'),
	path = require('path'),
	mkdirp = require('mkdirp'),
	nopt = require('nopt');

// Locals
var options = {
		"inputdir": path,
		"outputdir": path,
		"quiet": Boolean,
		"help": Boolean
	},
	shortHand = {
		"i": ['--inputdir'],
		"o": ['--outputdir'],
		"q": ['--quiet'],
		"h": ['--help']
	},
	paths = []; // Will be populated at run time

// options
options = nopt(options, shortHand);

/**
 * Wrapper for console.log, checks for quiet mode first
 * @param {String} message The message to be logged
 * @method log
 */
function log(message) {
	// Return if quiet mode
	if(options.quiet) {
		return;
	}
	console.log(message);
}

/**
 * Create the output directory if doesn's exist
 * @method createOutputDir
 */
function createOutputDir() {
	var output = getOutputDir();
	// Create the directory
	mkdirp.sync(output);
	// return the newly created directory
	return output;
}

/**
 * Create the output directory if doesn's exist
 * @param {String} file The file for which the directory should be created
 * @method isBaseFile
 */
function isBaseFile(file) {
	var baseDir = file.replace(getInputDir(), '')
					.replace(path.basename(file), '')
					.replace(/\//g, ''),
		fileName = path.basename(file, '.less');
	// If base directory is empty means the file itself is a base file
	return (baseDir === '') || (baseDir === fileName);
}

/**
 * Generate the CSS from less and put it in the output directory
 * @param {String} file The less file to process
 * @param {String} outputDir The output directory to dump the file
 * @method generateCSS
 */
function generateCSS(file, outputDir) {
	if(!isBaseFile(file)) {
		// return if the file is not a base file
		return;
	}
	log('Processing file ' + file);
	var cssFileName = outputDir + '/' + path.basename(file, '.less') + '.css';

	fs.readFile(file, function(err, lessStr) {
		if(err) {
			log('Error reading file ' + file);
			return;
		}
		lessStr = lessStr.toString();
		// Convert to CSS
		cssStr = convert(lessStr, cssFileName);
	});
}

/**
 * Converts the less string to CSS
 * @param {String} lessStr The less string to convert to CSS
 * @param {String} fileName The file name to write to
 * @method convert
 */
function convert(lessStr, fileName) {
	var parser = new less.Parser({
		paths: paths
	});
	parser.parse(lessStr, function(err, cssTree) {
		if(err) {
			log('Error parsing less file ' + err);
			return;
		}
		// Create the output file
		createFile(fileName, cssTree.toCSS());
	});
}

/**
 * Converts the less string to CSS
 * @param {String} name The name of the output file
 * @param {String} content The content to dump
 * @method createFile
 */
function createFile(name, content) {
	fs.writeFile(name, content, function(err) {
		if(err) {
			log('Error creating file ' + name);
		}
	});
}

/**
 * Process the file and generate the CSS
 * @param {String} file The file to process
 * @method processFile
 */
function processFile(file) {
	if(path.extname(file) !== '.less') {
		// return since it is not a less file
		return;
	}
	generateCSS(file, getOutputDir());
}

/**
 * Process the provided directory
 * @param {String} dir The directory to process
 * @method processDir
 */
function processDir(dir) {
	log('Processing direcory ' + dir);
	fs.readdir(dir, function(err, files) {
		if(err) {
			log('Invalid input path ' + dir);
			return;
		}
		files.forEach(function(file) {
			file = dir + '/' + file;
			fs.stat(file, function(e, stat) {
				if(e) {
					log('Problem getting stats ' + file);
					return;
				}
				if(stat.isFile()) {
					processFile(file);
				} else {
					processDir(file);
				}
			});
		});
	});
}

/**
 * Get the input directory based on options
 * @method getInputDir
 */
function getInputDir(){
	return options.inputdir || '../src';
}

/**
 * Get the output directory based on options
 * @method getOutputDir
 */
function getOutputDir(){
	return options.outputdir || '../dist';
}

/**
 * Populate the paths from the input directory
 * @method populatePaths
 */
function populatePaths(dir) {
	// Add the main path first
	paths.push(dir);
	// Iterate the directories
	try{
		fs.readdirSync(dir).forEach(function(file) {
			file = dir + '/' + file;
			var stat = fs.statSync(file);
			if(stat.isDirectory()) {
				// Add it to the paths
				paths.push(file);
				// Call recursively
				populatePaths(file);
			}
		});
	} catch(ex) {
		log('Invalid input path ' + dir + ' ' + ex);
		process.exit(1);
	}
}

/**
 * Main entry point
 * @param {Array} args The arguments provided in command line
 * @method exec
 */
function exec(args) {
	var input = getInputDir(),
		usage = [
            "\nUSAGE: node generator.js [options]*",
            " ",
            "Options:",
			"  --help | <-h>								Displays this information.",
            "  --inputdir=<dir> | -i <dir>					The input source directory of the less files",
            "  --outputdir=<dir> | -o <dir>					The output directory to dump the compiled CSS files",
            "  --quiet | <-q>								Keeps the console clear from logging.",
            " ",
            "Example:",
            "  node generator.js -i ../src -o ../dist",
            " "
        ].join("\n");

    if(options.help) {
		log(usage);
		process.exit(0);
    }

	log('Processing paths...');
	populatePaths(input);
	// Create output directory
	createOutputDir();
	// Start processing the directory
	processDir(input);
}

// Start the execution
exec(options.argv.remain);