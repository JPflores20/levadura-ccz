const fs = require('fs');
let code = fs.readFileSync('components/dashboard/comparacion-4v-tab.tsx', 'utf8');
code = code.replace(/import \{ Camera \} from 'lucide-react'\n?/, '');
fs.writeFileSync('components/dashboard/comparacion-4v-tab.tsx', code, 'utf8');
