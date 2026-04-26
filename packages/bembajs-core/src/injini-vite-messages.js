/**
 * Phisha = BembaJS dev surface on top of Vite (Injini). Logs are skinned [vite]→[Phisha];
 * with BEMBA_CLI_LANG=bem, common Vite lines are translated to Cibemba.
 */
const { activeLang } = require('./cli-i18n');

function isBembaCliLang() {
    const s = String(activeLang() || 'en').trim().toLowerCase();
    return s === 'bem';
}

/** After Bemba phrase pass, rebrand remaining Vite tags for every CLI language. */
function skinViteTagsToPhisha(s) {
    return String(s == null ? '' : s)
        .replace(/\[vite:/gi, '[Phisha:')
        .replace(/\[vite\]/gi, '[Phisha]');
}

/**
 * @type {{ test: RegExp, replace: (...args: string[]) => string }[]}
 */
const BEMBA_VITE_PHRASEBOOK = [
    {
        test: /^\[vite-plugin-bemba\]\s*/i,
        replace: () => '[Phisha ya BembaJS] '
    },
    {
        test: /Both esbuild and oxc options were set\.[^\n]*/i,
        replace: () =>
            'Pa config mwabika oxc na esbuild bonse; Phisha talafwa oxc. Ifilubo fya esbuild fyakonkololwa.'
    },
    {
        test: /Port (\d+) is in use, trying another one\.\.\./i,
        replace: (_m, p) => `Port ${p} nkuti usesha kale; Phisha ileesha port ingine…`
    },
    {
        test: /(\d{1,2}:\d{2}:\d{2}\s*)\[vite\]\s*\(([^)]+)\)\s*\[optimizer\]\s*bundling dependencies.*$/im,
        replace: (_m, ts, env) => `${ts}[Phisha] (${env}) [optimizer] tulapanga dependencies…`
    },
    {
        test: /(\d{1,2}:\d{2}:\d{2}\s*)\[vite\]\s*\(([^)]+)\)\s*✨\s*new dependencies optimized:\s*(.+)$/im,
        replace: (_m, ts, env, deps) => `${ts}[Phisha] (${env}) ✨ dependencies ishya shasansa: ${deps.trim()}`
    },
    {
        test: /Failed to resolve import\s+"([^"]+)"\s+from\s+"([^"]+)"/i,
        replace: (_m, spec, from) =>
            `Taile ukupatikisha ingisa "${spec}" ukufuma "${from}". Mona nga file pali nangu ishina lyalikose.`
    },
    {
        test: /Failed to resolve import\s+"([^"]+)"/i,
        replace: (_m, spec) => `Taile ukupatikisha ingisa "${spec}". Mona nga file pali.`
    },
    {
        test: /Could not resolve\s+"([^"]+)"/i,
        replace: (_m, p) => `Taile ukusanga "${p}" mu project.`
    },
    {
        test: /Could not resolve\s+'([^']+)'/i,
        replace: (_m, p) => `Taile ukusanga '${p}' mu project.`
    },
    {
        test: /Rollup failed to resolve import\s+"([^"]+)"\s+from\s+"([^"]+)"/i,
        replace: (_m, spec, from) =>
            `Rollup taile ukupatikisha ingisa "${spec}" ukufuma "${from}".`
    },
    {
        test: /is not exported by "([^"]+)"/i,
        replace: (_m, mod) => `Ifishi "${mod}" taile pa kufumya (export) ifyo walemba.`
    },
    {
        test: /does not provide an export named '([^']+)'/i,
        replace: (_m, name) => `Tapali export ishina "${name}" mu module iyo.`
    },
    {
        test: /Import analysis failed/i,
        replace: () => `Taile ukubomfya ingisa (import analysis yapwa).`
    },
    {
        test: /Pre-transform error:/i,
        replace: () => `Fyabupwa mu kupanga file (pre-transform):`
    },
    {
        test: /Transform failed/i,
        replace: () => `Ukupwisha kwafwa (transform yapwa)`
    },
    {
        test: /Internal server error/i,
        replace: () => `Fyabupwa mu sava ya mukati`
    },
    {
        test: /EADDRINUSE|address already in use/i,
        replace: () => `Port nkuti usesha kale pa kompyuta iyi. Sanka port ingi nangu leka ifilyo fileluba.`
    },
    {
        test: /ENOENT[:\s,]*no such file or directory/i,
        replace: () => `Ifishi tapali (ENOENT): bufolder nangu file tashiko.`
    },
    {
        test: /Cannot find module ['"]([^'"]+)['"]/i,
        replace: (_m, mod) => `Taile ukusanga module "${mod}".`
    },
    {
        test: /Cannot find package ['"]([^'"]+)['"]/i,
        replace: (_m, pkg) => `Taile ukusanga package "${pkg}". Ukufwile \`bun install\` mu project.`
    },
    {
        test: /Module externalized for browser compatibility/i,
        replace: () => `Module yafumishe pa browser (externalized); mona ingisa nangu vite.config.`
    },
    {
        test: /Invalid hook call/i,
        replace: () => `Ukubikisha kwa React kwafwa (invalid hook call); mona nga pali abantu ababili ba React.`
    },
    {
        test: /Unexpected token/i,
        replace: () => `Icipande ca code tacisokwene (unexpected token).`
    },
    {
        test: /Unterminated string constant/i,
        replace: () => `Umushigi ukwete ukulekelesha (string).`
    },
    {
        test: /Unexpected end of file/i,
        replace: () => `Ifishi yapwa mu ukutinka (unexpected end).`
    },
    {
        test: /Parse error/i,
        replace: () => `Taile ukubeba ifishi (parse error).`
    },
    {
        test: /SyntaxError/i,
        replace: () => `Fyabupwa mu mulongo wa code (SyntaxError)`
    },
    {
        test: /Outdated optimize dep/i,
        replace: () => `Dependencies sha kale; leka ulesanse cache ya Phisha nangu \`bun run dev\` panono.`
    },
    {
        test: /504\s*\(Outdated Optimize Dep\)/i,
        replace: () => `504: dependencies sha kale — sansa cache ya Phisha.`
    },
    {
        test: /The requested module .+ does not provide an export named/i,
        replace: () => `Module tapali export ifyo walemba.`
    },
    {
        test: /\[commonjs--resolver\]/i,
        replace: () => `[CommonJS resolver]`
    }
];

function translateViteBodyToBembaOnly(text) {
    const raw = String(text == null ? '' : text);
    if (!raw.trim()) return raw;

    let out = raw;
    for (let round = 0; round < 8; round++) {
        const prev = out;
        for (const { test, replace } of BEMBA_VITE_PHRASEBOOK) {
            out = out.replace(test, (...args) => replace(...args));
        }
        if (out === prev) break;
    }

    if (out !== raw) return out;
    return `Ifyo Phisha yalandile:\n${raw}`;
}

/**
 * Phisha-branded dev/build log line: always [vite]→[Phisha]; with `-l bem`, translate known copy to Cibemba.
 * @param {string} text
 * @returns {string}
 */
function formatPhishaDevLog(text) {
    const raw = String(text == null ? '' : text);
    const body = isBembaCliLang() ? translateViteBodyToBembaOnly(raw) : raw;
    return skinViteTagsToPhisha(body);
}

/** @deprecated use formatPhishaDevLog — kept for callers */
const translateInjiniEngineText = formatPhishaDevLog;

/**
 * @param {import('vite').Logger} base
 * @returns {import('vite').Logger}
 */
function createBembaInjiniLogger(base) {
    const wrap = (m) => formatPhishaDevLog(m);
    return {
        get hasWarned() {
            return base.hasWarned;
        },
        set hasWarned(v) {
            base.hasWarned = v;
        },
        info(msg, options) {
            base.info(wrap(msg), options);
        },
        warn(msg, options) {
            base.warn(wrap(msg), options);
        },
        warnOnce(msg, options) {
            base.warnOnce(wrap(msg), options);
        },
        error(msg, options) {
            base.error(wrap(msg), options);
        },
        clearScreen(type) {
            base.clearScreen(type);
        },
        hasErrorLogged(error) {
            return base.hasErrorLogged(error);
        }
    };
}

/** Labels for SSR HTML error page */
function injiniSsrErrorLabels() {
    const bem = isBembaCliLang();
    if (!bem) {
        return {
            htmlLang: 'en',
            title: 'Phisha error (dev)',
            lead: 'Something failed while compiling or rendering this page. Details are below.',
            hint: 'Tip: fix the file, then refresh.',
            errorHeading: 'Error',
            codeFrameHeading: 'Code frame',
            stackHeading: 'Stack',
            pluginPill: 'plugin',
            atPill: 'at'
        };
    }
    return {
        htmlLang: 'bem',
        title: 'Fyabupwa mu Phisha',
        lead: 'Pali ifyo fileluba pa kupanga nangu ukwisulula ipena iyi. Mona ifyo fyalandila panshi.',
        hint: 'Ukulefwaya: konkola file, elyo ulesanse (refresh).',
        errorHeading: 'Ubulubulo',
        codeFrameHeading: 'Icipande ca code',
        stackHeading: 'Stack',
        pluginPill: 'plugin',
        atPill: 'pa'
    };
}

module.exports = {
    isBembaCliLang,
    formatPhishaDevLog,
    translateInjiniEngineText,
    createBembaInjiniLogger,
    injiniSsrErrorLabels,
    skinViteTagsToPhisha
};
