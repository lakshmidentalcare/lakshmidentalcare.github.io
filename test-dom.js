const fs = require('fs');
const jsdom = require('jsdom');
const { JSDOM } = jsdom;

const html = fs.readFileSync('index.html', 'utf8');

const dom = new JSDOM(html, { runScripts: "dangerously" });
setTimeout(() => {
  const document = dom.window.document;
  
  const bSelect = document.getElementById('billing-patient-select');
  console.log('billing-patient-select parent class:', bSelect ? bSelect.parentNode.className : 'NOT FOUND');

  const pSelect = document.getElementById('presc-patient-select');
  console.log('presc-patient-select parent class:', pSelect ? pSelect.parentNode.className : 'NOT FOUND');

  const bProcSelect = document.getElementById('billing-procedure-select');
  console.log('billing-procedure-select parent class:', bProcSelect ? bProcSelect.parentNode.className : 'NOT FOUND');

}, 500);
