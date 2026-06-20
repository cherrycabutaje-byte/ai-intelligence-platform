const fs = require('fs');
let c = fs.readFileSync('src/app/dashboard/page.tsx', 'utf8');
c = c.replace(
  '            + Update Stats Today\n            </button>',
  '            + Update Stats Today\n            </button>'
);
fs.writeFileSync('src/app/dashboard/page.tsx', c, 'utf8');
console.log('done');
