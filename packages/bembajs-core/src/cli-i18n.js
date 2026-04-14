/**
 * CLI UI strings (English / Bemba). Set via --lang / -l or BEMBA_CLI_LANG (en | bem | bemba).
 */
const MSGS = {
    en: {
        rootDesc: 'BembaJS CLI — build web apps with the Bemba language',
        pangaDesc: 'Create a new BembaJS project',
        newDesc: 'Create a new BembaJS project (alias for panga)',
        initDesc: 'Initialize BembaJS in the current directory',
        templateDesc: 'Sync starter content from the installed bembajs-core package',
        templateSyncDesc:
            'Update docs/CODE-STYLE-AND-UI.md (built-in template). Use --starter to overwrite default .bemba pages, shell, README, etc.',
        syncTemplateDesc: 'Same as `template sync` — refresh docs/starter from this bembajs-core package',
        tungululaDesc: 'Start the development server (primary dev command)',
        akhaDesc: 'Build production React app (Vite) by default; optional legacy modes available',
        fumyaDesc: 'Export build output folder (React/Vite default)',
        staticExportDesc: 'Export legacy static HTML (pangaIpepa) to a folder',
        pangaIcibukishoDesc: 'Compile a single Bemba file',
        pangaIcipandaDesc: 'Generate a new component',
        pangaIpepaDesc: 'Generate a new page',
        lembaDesc: 'Lint Bemba code',
        eshaDesc: 'Run tests',
        optTemplate: 'Project template: base | ui',
        optTypescript: 'Use TypeScript',
        optTemplateSync: 'base | ui (default: ui if ifikopo/cipanda/StarterCard.bemba exists, else base)',
        optStarter: 'Overwrite starter pages/shell/partials/README/.gitignore/.editorconfig (destructive)',
        optPort: 'Port to run on',
        optHost: 'Host to bind to',
        optOutput: 'Output directory',
        optBaseUrl: 'Site origin for sitemap.xml / feed.xml (or BEMBA_SITE_URL)',
        optLocale: 'html lang (BCP 47)',
        optSiteTitle: 'RSS channel title',
        optAnalyze: 'Analyze bundle size (legacy build only)',
        optLegacyNext: 'Run legacy Next.js scaffold build',
        optLegacyStatic: 'Force legacy static HTML export path (skip Vite React app build)',
        optNoBembaSite: 'Do not inject or copy bemba-site.js',
        optOutputFile: 'Output file',
        optComponentType: 'Component type',
        optDynamic: 'Create dynamic route',
        optFix: 'Fix linting errors',
        optWatch: 'Watch mode',
        optLang: 'CLI messages: en | bem (or set BEMBA_CLI_LANG)',

        creatingProject: (name) => `Creating new BembaJS project: ${name}`,
        dirExists: (name) => `Directory ${name} already exists`,
        projectCreated: (name) => `Project ${name} created successfully.`,
        templateLine: (t) => `Template: ${t}`,
        cdLine: (name) => `Navigate to the project: cd ${name}`,
        startDevLine: 'Start development: bemba tungulula',
        initInCwd: 'Initializing BembaJS project in current directory',
        dirNotEmptyWarn: 'Warning: Directory is not empty. Some files may be overwritten.',
        initOk: 'Project initialized successfully.',
        locationLine: (p) => `Location: ${p}`,
        syncDocsOk: 'Updated docs/CODE-STYLE-AND-UI.md from built-in template.',
        syncDocsTip:
            'Tip: run with --starter to replace default umusango/index/about/partials/README (overwrites your edits).',
        syncFull: (template) =>
            `Synced full starter (${template}): shell, pages, docs, README, Button.bemba, global.css, .gitignore, .editorconfig.`,
        startingDevPort: (port) => `Starting BembaJS development server on port ${port}`,
        viteDevReact: 'Starting Injini (React app — pages with ukwisulula)...',
        viteBuildReact: 'Building with Injini (React SPA)...',
        viteBuildDone: '✅ Injini build finished.',
        usingLegacyStatic: 'Using legacy static HTML export path.',
        buildingLegacy: 'Building BembaJS project (legacy Next scaffold)...',
        exportingHtml: 'Exporting legacy static HTML (pangaIpepa)...',
        exportingSite: 'Exporting legacy static HTML site...',
        compilingFile: (file) => `Compiling ${file}...`,
        compiledTo: (out) => `✅ Compiled to ${out}`,
        compileErr: (msg) => `❌ Compilation error: ${msg}`,
        genComponent: (name) => `Generating component: ${name}`,
        componentCreated: (path) => `✅ Component created: ${path}`,
        genPage: (name) => `Generating page: ${name}`,
        pageCreated: (path) => `✅ Page created: ${path}`,
        linting: 'Linting Bemba code...',
        lintOk: '✅ Linting completed',
        runningTests: 'Running tests...',
        testsOk: '✅ All tests passed'
    },
    bem: {
        rootDesc: 'CLI ya BembaJS — panga masaiti na chilambo cha Bemba',
        pangaDesc: 'Panga project iipya ya BembaJS',
        newDesc: 'Panga project iipya (cimo ne panga)',
        initDesc: 'Panga BembaJS mu bufolder pali iino',
        templateDesc: 'Sansa ifishi shapusulo ukufuma mu bembajs-core',
        templateSyncDesc:
            'Sansa docs/CODE-STYLE-AND-UI.md ukufuma ku template. Ukufwile --starter pakulufwisha amapeji/umusango ne fye',
        syncTemplateDesc: 'Cimo ne `template sync` — sansa docs ne starter',
        tungululaDesc: 'Gulula sava yakupanga (development server) — uyu mushinga wakupanga',
        akhaDesc: 'Akha React app ya production (Vite by default); pali legacy options',
        fumyaDesc: 'Fumya ifya build ku folder (React/Vite default)',
        staticExportDesc: 'Fumya static HTML yakweka (pangaIpepa) ku folder',
        pangaIcibukishoDesc: 'Panga ifishi limo lya .bemba',
        pangaIcipandaDesc: 'Panga icipanda icipya',
        pangaIpepaDesc: 'Panga ipena icipya',
        lembaDesc: 'Konkola ama code ya Bemba',
        eshaDesc: 'Esha ama test',
        optTemplate: 'Ifishi shapusulo: base | ui',
        optTypescript: 'Kosebenzesha TypeScript',
        optTemplateSync: 'base | ui (default: ui nga pali StarterCard.bemba)',
        optStarter: 'Lufwisha amapeji/umusango/partials/README (cachena)',
        optPort: 'Namba ya port',
        optHost: 'Host',
        optOutput: 'Bufolder bwa kufumya',
        optBaseUrl: 'URL ya site (sitemap / RSS)',
        optLocale: 'html lang (BCP 47)',
        optSiteTitle: 'Ishina lya RSS',
        optAnalyze: 'Analyze bundle (legacy)',
        optLegacyNext: 'Build ya Next ya kale',
        optLegacyStatic: 'Bomfya inshila yakweka ya static HTML (leka Vite React app build)',
        optNoBembaSite: 'Kwatako bemba-site.js',
        optOutputFile: 'Ifishi ya kufumya',
        optComponentType: 'Ubwoko bwa cipanda',
        optDynamic: 'Dynamic route',
        optFix: 'Konkola ama fyabupwa',
        optWatch: 'Watch mode',
        optLang: 'Umulomo wa CLI: en | bem (nangu BEMBA_CLI_LANG)',

        creatingProject: (name) => `Tulipanga project iipya ya BembaJS: ${name}`,
        dirExists: (name) => `Bufolder ${name} pali kale`,
        projectCreated: (name) => `Project ${name} yapangwa bwino.`,
        templateLine: (t) => `Ifishi shapusulo: ${t}`,
        cdLine: (name) => `Ina mu project: cd ${name}`,
        startDevLine: 'Gulula ukupanga: bemba tungulula',
        initInCwd: 'Tulipanga BembaJS mu bufolder pali iino',
        dirNotEmptyWarn: 'Ukuchema: bufolder tashile file. Ifishi shingi shingafwike.',
        initOk: 'Project yapangwa bwino.',
        locationLine: (p) => `Icifulo: ${p}`,
        syncDocsOk: 'docs/CODE-STYLE-AND-UI.md yasanswa ukufuma ku template.',
        syncDocsTip: 'Ukuchema: ukufwile --starter pakulufwisha umusango/amapeji (kwafwisha ifyo walilemba).',
        syncFull: (template) =>
            `Ifishi shonse shasanswa (${template}): umusango, amapeji, docs, README, Button, global.css, .gitignore, .editorconfig.`,
        startingDevPort: (port) => `Tungulula sava yakupanga pa port ${port}`,
        viteDevReact: 'Tungulula Injini (React — amapeji ya ukwisulula)...',
        viteBuildReact: 'Tulipanga na Injini (React SPA)...',
        viteBuildDone: '✅ Injini yapwa.',
        usingLegacyStatic: 'Tulebomfya inshila yakweka ya static HTML.',
        buildingLegacy: 'Tulipanga project (Next ya kale)...',
        exportingHtml: 'Tulifumya HTML yakweka (pangaIpepa)...',
        exportingSite: 'Tulifumya static HTML yakweka...',
        compilingFile: (file) => `Tulipanga ${file}...`,
        compiledTo: (out) => `✅ Yapangwa ku ${out}`,
        compileErr: (msg) => `❌ Fyabupwa: ${msg}`,
        genComponent: (name) => `Tulipanga icipanda: ${name}`,
        componentCreated: (path) => `✅ Cipanda capangwa: ${path}`,
        genPage: (name) => `Tulipanga ipena: ${name}`,
        pageCreated: (path) => `✅ Ipena yapangwa: ${path}`,
        linting: 'Tulikonkola ama code ya Bemba...',
        lintOk: '✅ Ukukonkola kwapwa',
        runningTests: 'Tulesha ama test...',
        testsOk: '✅ Ama test yonse yalungika'
    }
};

function normalizeLang(raw) {
    const s = String(raw == null ? 'en' : raw)
        .trim()
        .toLowerCase();
    if (s === 'bem' || s === 'bemba' || s === 'ci-bemba') return 'bem';
    return 'en';
}

/** `-l` / `--lang` only; `undefined` if absent (do not write `process.env` to `en`). */
function parseLangFromArgvOnly(argv) {
    const args = argv || process.argv;
    for (let i = 0; i < args.length; i++) {
        const a = args[i];
        if (a === '-l' || a === '--lang') {
            const v = args[i + 1];
            if (v && !v.startsWith('-')) return normalizeLang(v);
        }
        if (a.startsWith('--lang=')) return normalizeLang(a.slice('--lang='.length));
    }
    return undefined;
}

/** Resolved language for display (argv → env → en). Does not mutate env. */
function parseEarlyLangFromArgv(argv) {
    const fromArgv = parseLangFromArgvOnly(argv);
    if (fromArgv !== undefined) return fromArgv;
    return normalizeLang(process.env.BEMBA_CLI_LANG || 'en');
}

function activeLang() {
    return normalizeLang(process.env.BEMBA_CLI_LANG || 'en');
}

/**
 * @param {string} key
 * @param  {...any} args - passed to template function if value is a function
 */
function t(key, ...args) {
    const lang = activeLang();
    const bucket = MSGS[lang] || MSGS.en;
    const val = bucket[key] != null ? bucket[key] : MSGS.en[key];
    if (typeof val === 'function') return val(...args);
    return val != null ? val : key;
}

module.exports = {
    MSGS,
    normalizeLang,
    parseLangFromArgvOnly,
    parseEarlyLangFromArgv,
    activeLang,
    t
};
