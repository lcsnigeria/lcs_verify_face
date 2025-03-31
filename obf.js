const JavaScriptObfuscator = require('javascript-obfuscator');
const fs = require('fs');
const path = require('path');

// Input file and output directory
const inputFilePath = './src/la.js';
const outputDirectory = './dist';
const outputFilePath = path.join(outputDirectory, 'la.min.js');

// Function to clear the output directory
const clearOutputDirectory = (directory) => {
    if (fs.existsSync(directory)) {
        fs.rmSync(directory, { recursive: true, force: true });
        console.log(`Cleared output directory: ${directory}`);
    }
};

// Clear and recreate the output directory
clearOutputDirectory(outputDirectory);
fs.mkdirSync(outputDirectory, { recursive: true });

// Obfuscation options
const obfuscationOptions = {
    compact: true, // Keeps the code compact
    controlFlowFlattening: false, // Disable control flow flattening for better performance
    deadCodeInjection: false, // Avoid adding unnecessary junk code
    stringArrayEncoding: ['base64'], // Use simpler encoding for strings
    stringArrayThreshold: 0.75, // Slightly reduce string obfuscation
    splitStrings: true,
    splitStringsChunkLength: 3,
    selfDefending: false, // Disable self-defending for compatibility
    disableConsoleOutput: false, // Allow console.log for debugging
    renameGlobals: false // Avoid renaming globals to prevent conflicts
};

// Obfuscate la.js and output to la.min.js
const obfuscateFile = (inputPath, outputPath) => {
    try {
        const inputCode = fs.readFileSync(inputPath, 'utf8');
        
        // Obfuscate the code
        const obfuscatedCode = JavaScriptObfuscator.obfuscate(inputCode, obfuscationOptions).getObfuscatedCode();
        
        // Write the obfuscated code to the output file
        fs.writeFileSync(outputPath, obfuscatedCode, 'utf8');
        
        console.log(`Obfuscated: ${inputPath} -> ${outputPath}`);
    } catch (error) {
        console.error(`Error obfuscating file ${inputPath}:`, error);
    }
};

// Run obfuscation on la.js
obfuscateFile(inputFilePath, outputFilePath);
