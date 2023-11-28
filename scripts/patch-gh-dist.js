const fs = require('fs');
const path = require('path');

const patchFile = path.resolve(__dirname, '../dist/index.html');

let patchContent = fs.readFileSync(patchFile, 'utf8');

if(!patchContent){
    throw new Error('Cannot find file');
}

if (patchContent.includes('src="./assets/index')) {
    console.log('already patched')
    return;
}

patchContent = patchContent.replace('src="/assets/index', 'src="./assets/index')

fs.writeFileSync(patchFile, patchContent);

console.log('patch done!')