const fs = require('fs');
const path = require('path');

const content = fs.readFileSync(path.join(__dirname, 'lib', 'index.d.ts'), 'utf-8');

fs.writeFileSync(path.join(__dirname, 'lib', 'index.d.ts'), content.replace(/import ?'.+\.css';?/g, ''));
