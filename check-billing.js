const fs = require('fs');
const txt = fs.readFileSync('index.html', 'utf8');
const count = (txt.match(/id=\"billing-patient-select\"/g) || []).length;
console.log('billing-patient-select count:', count);
const count2 = (txt.match(/id=\"presc-patient-select\"/g) || []).length;
console.log('presc-patient-select count:', count2);
