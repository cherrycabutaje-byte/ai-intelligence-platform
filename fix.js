const fs = require('fs');
let c = fs.readFileSync('src/app/dashboard/page.tsx', 'utf8');
c = c.replace(/selectedSource\?\.platform .{1,3} ""/g, 'selectedSource?.platform ?? ""');
fs.writeFileSync('src/app/dashboard/page.tsx', c, 'utf8');
console.log('done');
