/**
 * Library for storing and editing data
 */

var fs = require('fs');
var path = require('path');

// container for the module to be exported
var lib = {};

// base directory of data folder
lib.baseDir = path.join(__dirname, '/../.data/');

// write data to the file, shitty created the calback tree-problem
lib.create = (dir, file, data, callback) => {
    fs.open(lib.baseDir+dir+'/'+file+'.json','wx',(error, fileDescriptor) => {
        if(!error && fileDescriptor){
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
        callback(error, data);
    });
};

// update data in the file
lib.read = (dir, file, data, callback) => {
    fs.open(lib.baseDir+dir+'/'+file+'.json','wx',(error, fileDescriptor) => {
        if(!error && fileDescriptor){
            var stringData = JSON.stringify(data);
            fs.truncate(fileDescriptor, (error) => {
                if(!error){
                    fs.close(fileDescriptor, (error)=> {
                        if(!error){
                            callback(false);
                        }else{
                            callback('Error closing the file');
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

// export the modules
module.exports = lib;