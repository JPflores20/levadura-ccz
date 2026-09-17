const fs = require('fs');
let code = fs.readFileSync('components/dashboard/comparacion-4v-tab.tsx', 'utf8');

// 1. Remove the import
code = code.replace(/import \* as htmlToImage from 'html-to-image'\n?/, '');

// 2. Remove the handleCapture function
code = code.replace(/const handleCapture = async \(\) => \{[\s\S]*?console\.error\(e\);\n    \}\n  \}\n/g, '');

// 3. Remove the button block
code = code.replace(/<button \s*onClick=\{handleCapture\}[\s\S]*?<\/button>/g, '');

fs.writeFileSync('components/dashboard/comparacion-4v-tab.tsx', code, 'utf8');
console.log('Button removed');
