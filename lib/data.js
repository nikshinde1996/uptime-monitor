/**
 * Library for storing and editing data
 */

var fs = require('fs');
var path = require('path');
var helpers = require('./helpers');

// container for the module to be exported
var lib = {};

// base directory of data folder
lib.baseDir = path.join(__dirname, '/../.data/');

// write data to the file, shitty created the calback tree-problem
lib.create = (dir, file, data, callback) => {
    fs.open(lib.baseDir+dir+'/'+file+'.json','wx',(err, fileDescriptor) => {
        if(!err && fileDescriptor){
            // convert data to string
            var stringData = JSON.stringify(data);
            fs.writeFile(fileDescriptor, stringData, (error) => {
                if(!error){
                    fs.close(fileDescriptor,(err) => {
                        if(!err){
                            callback(false);
                        }else{
                            callback('Failed while closing the file.');
                        }
                    });
                }else {
                    callback('Failed to write in the new file.');
                }
            });
        }else {
            callback('Failed to create new file, it may allready exist.');
        }
    });
};

// read data from the file
lib.read = (dir, file, callback) => {
    fs.readFile(lib.baseDir+dir+'/'+file+'.json','utf8',(error, data) => {
        if(!error && data){
            var parsedData = helpers.parseJsonToObject(data);
            callback(false, parsedData);
        }else{
            callback(error, data);
        }
    });
};

// update data in the file
lib.update = (dir, file, data, callback) => {
    fs.open(lib.baseDir+dir+'/'+file+'.json','w',(error, fileDescriptor) => {
        if(!error && fileDescriptor){
            var stringData = JSON.stringify(data);
            fs.ftruncate(fileDescriptor, (error) => {
                if(!error){
                    fs.writeFile(fileDescriptor, stringData, (error) => {
                        if(!error){
                            fs.close(fileDescriptor, (error)=> {
                                if(!error){
                                    callback(false);
                                }else{
                                    callback('Error closing the file');
                                }
                            });
                        }else{
                            callback('Error writing the file');
                        }
                    });
                }else{
                    callback('Error truncating file');
                }
            });
        }else{
            callback('Could not open file to update, file may not exist.');
        }
    });
};

// delete the file
lib.delete = (dir, file, callback) => {
    fs.unlink(lib.baseDir+dir+'/'+file+'.json', (error) => {
        if(!error){
            callback(false);
        }else{
            callback('Error deleting the file');
        }
    }); 
};

// list all the files in the directory
lib.list = (dir, callback) => {
    fs.readdir(lib.baseDir+dir+'/', (error, data) => {
        if(!error && data && data.length > 0){
            var trimmedFileNames = [];
            data.foreach((fileName) => {
                trimmedFileNames.push(fileName.replace('.json',''));
            });
            callback(false, trimmedFileNames);
        }else{
            callback('Error listing the files in directory');
        }
    }); 
};

// export the modules
module.exports = lib;