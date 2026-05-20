const XLSX = require('xlsx');
const path = require('path');

const workbook = XLSX.readFile(path.join(__dirname, '../Tables (1).xlsx'));
console.log('Sheet Names:', workbook.SheetNames);

workbook.SheetNames.forEach(sheetName => {
  const worksheet = workbook.Sheets[sheetName];
  const data = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
  console.log(`\nSheet: ${sheetName}`);
  console.log('Total Rows:', data.length);
  if (data.length > 0) {
    console.log('Headers:', data[0]);
    console.log('First Row:', data[1]);
  }
});
