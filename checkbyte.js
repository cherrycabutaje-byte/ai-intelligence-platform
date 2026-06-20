const fs = require('fs');
const buf = fs.readFileSync('src/app/dashboard/page.tsx');
console.log('byte at 6288:', buf[6288], buf[6289], buf[6290]);
