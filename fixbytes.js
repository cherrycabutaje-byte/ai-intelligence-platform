const fs = require('fs');
let c = fs.readFileSync('src/app/dashboard/page.tsx', 'latin1');
// Replace common corrupted emoji sequences
c = c.replace(/[\x80-\x9F]/g, '');
fs.writeFileSync('src/app/dashboard/page.tsx', c, 'utf8');
console.log('done');
