/**
 * Pure helpers for `<head>` meta, sitemap.xml, and RSS — use from export scripts or tooling.
 */

function escapeXml(s) {
    return String(s)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&apos;');
}

/**
 * @param {object} [opts]
 * @param {string} [opts.description]
 * @param {string} [opts.canonical]
 * @param {string} [opts.ogTitle]
 * @param {string} [opts.ogDescription]
 * @param {string} [opts.ogImage]
 * @returns {string} HTML fragment (trusted — values are XML-escaped)
 */
function buildHeadMetaTags(opts = {}) {
    const lines = [];
    if (opts.description) {
        lines.push(`<meta name="description" content="${escapeXml(opts.description)}">`);
    }
    if (opts.canonical) {
        lines.push(`<link rel="canonical" href="${escapeXml(opts.canonical)}">`);
    }
    if (opts.ogTitle || opts.ogDescription || opts.ogImage) {
        lines.push('<meta property="og:type" content="website">');
        if (opts.ogTitle) lines.push(`<meta property="og:title" content="${escapeXml(opts.ogTitle)}">`);
        if (opts.ogDescription) {
            lines.push(`<meta property="og:description" content="${escapeXml(opts.ogDescription)}">`);
        }
        if (opts.ogImage) lines.push(`<meta property="og:image" content="${escapeXml(opts.ogImage)}">`);
    }
    return lines.join('\n    ');
}

/**
 * @param {{ baseUrl: string, paths: string[] }} arg
 */
function generateSitemapXml({ baseUrl, paths }) {
    const base = String(baseUrl || '').replace(/\/$/, '');
    const urls = (paths || [])
        .sort()
        .map((p) => {
            const loc = p === '/' ? `${base}/` : `${base}${p.startsWith('/') ? p : `/${p}`}`;
            return `  <url><loc>${escapeXml(loc)}</loc></url>`;
        })
        .join('\n');
    return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>
`;
}

/**
 * @param {{ baseUrl: string, siteTitle?: string, items?: { path?: string, link?: string, title?: string, pubDate?: string|Date }[] }} arg
 */
function generateRssFeedXml({ baseUrl, siteTitle, items }) {
    const base = String(baseUrl || '').replace(/\/$/, '');
    const entries = (items || [])
        .map((it) => {
            const link = it.link || `${base}${it.path && it.path !== '/' ? it.path : '/'}`;
            const title = escapeXml(it.title || it.path || '');
            const pubDate = it.pubDate ? new Date(it.pubDate).toUTCString() : new Date().toUTCString();
            return `    <item>
      <title>${title}</title>
      <link>${escapeXml(link)}</link>
      <pubDate>${escapeXml(pubDate)}</pubDate>
    </item>`;
        })
        .join('\n');
    return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>${escapeXml(siteTitle || 'Site')}</title>
    <link>${escapeXml(`${base}/`)}</link>
${entries}
  </channel>
</rss>
`;
}

module.exports = {
    escapeXml,
    buildHeadMetaTags,
    generateSitemapXml,
    generateRssFeedXml
};
