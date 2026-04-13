const fs = require('fs');
const os = require('os');
const path = require('path');
const { exportStaticHtmlSite } = require('../dist/index.js');

async function main() {
    const t = fs.mkdtempSync(path.join(os.tmpdir(), 'bemba-ex-'));
    try {
        fs.mkdirSync(path.join(t, 'amapeji'), { recursive: true });
        fs.writeFileSync(
            path.join(t, 'amapeji', 'index.bemba'),
            "pangaIpepa('H', { umutwe: 'Hi', ilyashi: 'x' })",
            'utf8'
        );

        const r = await exportStaticHtmlSite({
            projectRoot: t,
            outDir: 'out',
            baseUrl: 'https://ex.test',
            bembaSiteScript: false
        });
        if (r.pages !== 1) throw new Error('expected 1 page');
        const html = fs.readFileSync(path.join(r.outDir, 'index.html'), 'utf8');
        if (!html.includes('<!DOCTYPE')) throw new Error('no doctype');
        if (!fs.existsSync(path.join(t, 'out', 'sitemap.xml'))) throw new Error('no sitemap');
        console.log('smoke-export: ok');
    } finally {
        fs.rmSync(t, { recursive: true, force: true });
    }
}

main().catch((e) => {
    console.error(e);
    process.exit(1);
});
