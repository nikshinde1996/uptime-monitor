// LIBRARY FOR STORING LOGS

const fs = require('fs');
const path = require('path');
var zlib = require('zlib');

// Instantiate container for the library
var lib = {};

// base directory for logs folder
lib.baseDir = path.join(__dirname, '/../.logs/');

// append the string to the related log file
// create new log file if not found
lib.append = (file, str, callback) => {
    fs.open(lib.baseDir+file+'.log', 'a', (error, fileDescriptor) => {
        if(!error && fileDescriptor){
            fs.appendFile(fileDescriptor, str='\n', (error) => {
                if(!error){
                    fs.close(fileDescriptor, (error) => {
                        if(!error){
                            callback(false);
                        }else {
                            callback('Error : failed to close the file - ',error)
                        }
                    });
                }else {
                    callback('Error appending logs to the file - ',error);
                }
            });
        }else {
            callback('Failed to open file for appending logs - ',error);
        }
    });
};

// list all the logs and optionally include all the log files
lib.list = (includeCompressedLogs, callback) => {
    fs.readdir(lib.baseDir, (error, data) => {
        if(!error && data && data.length > 0){
            var trimmedFileNames = [];
            data.forEach((fileName) => {
                if(fileName.indexOf('.log') > -1){
                    trimmedFileNames.push(fileName.replace('.log',''));
                }
                if(fileName.indexOf('.gz.b64') > -1 && includeCompressedLogs){
                    trimmedFileNames.push(fileName.replace('.gz.b64',''));
                }
            });
            callback(false, trimmedFileNames);
        }else {
            callback(error, data);
        }
    });
};

// compress the log files
lib.compress = (logId, newFileId, callback) => {
    var sourceFile = logId + '.log';
    var destinationFile = newFileId + '.gz.b64';

    fs.readFile(lib.baseDir+sourceFile, 'utf8', (error, inputString) => {
        if(!error && inputString) {
            // compress the log files using gzip
            zlib.gzip(inputString, (error, buffer) => {
                if(!error && buffer){
                    // send data to the destincation file and then delete the old source file
                    fs.open(lib.baseDir+destinationFile, 'wx', (error, fileDescriptor) => {
                        if(!error && fileDescriptor){
                            // write file to the destination file
                            fs.writeFile(fileDescriptor, buffer.toString('base64'), (error) => {
                                if(!error){
                                    fs.close(fileDescriptor, (error) => {
                                        if(!error){
                                            callback(false);
                                        }else {
                                            callback(error);
                                        }
                                    });
                                }else {
                                    callback(error);
                                }
                            });
                        }else {
                            callback(error);
                        }
                    });
                }else {
                    callback(error);
                }
            });
        }else {
            callback(error);
        }
    });
};

// decompress the log files
lib.decompress = (fileId, callback) => {
    var fileName = fileId+'.gz.b64';
    fs.readFile(lib.baseDir+fileName, 'utf8', (error, str) => {
        if(!error && str) {
            var inputBuffer = Buffer.from(str, 'base64');
            zlib.unzip(inputBuffer, (error, outputBuffer) => {
                if(!error && outputBuffer){
                    var str = outputBuffer.toString();
                    // write this string to the original source log file
                    callback(false, str);
                }else {
                    callback(error);
                }
            });
        }else {
            callback(error);
        }
    });
};

// truncate the log files
lib.truncate = (logId, callback) => {
    fs.truncate(lib.baseDir+logId+'.log', 0, (error) => {
        if(!error){
            callback(false);
        }else {
            callback(error);
        }
    });
};

// Export the api
module.exports = lib;



