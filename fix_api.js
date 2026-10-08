const fs = require('fs');

function removeFetch(filePath) {
    let content = fs.readFileSync(filePath, 'utf-8');
    // Replace fetch(BACKEND_URL...) with dummy Promise
    content = content.replace(/fetch\([^)]+\)/g, (match) => {
        if (match.includes('BACKEND_URL') || match.includes('/api/website') || match.includes('/api/uploads')) {
            return `Promise.resolve({ ok: true, json: () => Promise.resolve({ data: [] }) })`;
        }
        return match;
    });
    fs.writeFileSync(filePath, content);
}

removeFetch('./app/(dashboard)/gallery/page.tsx');
removeFetch('./app/(dashboard)/exhibitor-list/page.tsx');
