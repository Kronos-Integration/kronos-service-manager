const fs = require('fs');
const path = require('path');

const sin = fs.createReadStream('copy_file.js');
const sout = fs.createWriteStream('/tmp/afile');

sin.pipe(sout);
