/**
 * Main `bemba` CLI strings (English / Bemba). Core messages live in bembajs-core/cli-i18n.js.
 */
const path = require('path');

function loadCoreI18n() {
    try {
        const corePkg = path.dirname(require.resolve('bembajs-core/package.json'));
        return require(path.join(corePkg, 'dist', 'cli-i18n.js'));
    } catch (_) {
        try {
            return require(path.resolve(__dirname, '..', '..', 'bembajs-core', 'src', 'cli-i18n.js'));
        } catch (e2) {
            return null;
        }
    }
}

const core = loadCoreI18n();

const EXTRA = {
    en: {
        programDesc: 'BembaJS — Next.js-like framework for the Bemba language',
        pangaDesc: 'Create a new BembaJS project',
        tungululaDesc: 'Start dev server (same as bun run dev in generated apps)',
        akhaDesc: 'Export static HTML for production (default ./dist)',
        fumyaDesc: 'Export static HTML (default ./out)',
        emitReactDesc: 'Emit JSX from .bemba for Vite/esbuild + React',
        lintDesc: 'Lint BembaJS code',
        formatDesc: 'Format BembaJS code',
        helpDesc: 'Show help information',
        optTemplate: 'Project template: base | ui',
        optTypescript: 'Use TypeScript',
        optOutput: 'Output directory',
        optBaseUrl: 'Origin for sitemap.xml / feed.xml (or BEMBA_SITE_URL)',
        optLocale: 'html lang (BCP 47)',
        optSiteTitle: 'RSS channel title',
        optNoBembaSite: 'Do not inject or copy bemba-site.js',
        optEmitOut: 'Output directory for emitted JSX',
        optLang: 'CLI messages: en | bem (or BEMBA_CLI_LANG)',

        chooseCliLang: 'Choose CLI language · Sala ululomi (prompts + scaffolding)',
        langChoiceEnglish: 'English',
        langChoiceBemba: 'Bemba (CLI messages in Bemba)',
        langPromptRl: 'Language [1 English · 2 Bemba, default 1]: ',

        pangaArgName: 'Project folder name (optional if you use interactive prompts)',
        projectNamePrompt: 'Project folder name (e.g. my-app)',
        projectNameRequired: 'Enter a non-empty name',
        projectNameRl: 'Project folder name: ',
        invalidProjectName:
            'Invalid name: use letters, numbers, dot, underscore, or hyphen only (no paths or spaces).',

        mainMenuTitle: 'What do you want to do?',
        mainMenuCreate: 'Create a new project (language → name → template)',
        mainMenuHelp: 'Show command help',
        mainMenuExit: 'Exit',
        mainMenuPromptRl: 'Choose [1 create · 2 help · 3 exit, default 1]: ',

        startingDev: 'Starting BembaJS development server...',
        hotReload: 'Hot reload on; press Ctrl+C to stop.',
        stoppingDev: 'Stopping BembaJS development server...',
        devStartErr: 'Failed to start development server:',
        devCwdHint: 'Make sure you are in a BembaJS project directory',
        devNoProject:
            'Not a BembaJS project here: expected amapeji/ with at least one .bemba page. Run bemba panga to create a project, then cd into it.',
        coreMissingPanga: 'bembajs-core is required for project scaffolding. Install/reinstall bembajs-core and try again.',
        unknownTemplate: (t) => `Unknown template "${t}". Use --template base or --template ui.`,
        exportMissing: 'bembajs-core with static-html-export is required.',
        emitScriptMissing: 'emit-react-routes.js not found. Rebuild the bembajs package.',
        coreMissingTemplate:
            'bembajs-core is required for `bemba template` / `bemba sync-template`. In a project: bun add -d bembajs-core',
        chooseTemplate: 'Choose a project template',
        tmplBase: 'base — minimal starter',
        tmplUi: 'ui — starter UI blocks',
        tmplPrompt: 'Template [1/2, default 1]: ',
        promptHeader: 'Choose a project template:',
        promptLine1: '  1) base — minimal starter router',
        promptLine2: '  2) ui   — starter UI blocks',

        helpTitle: 'BembaJS — Programming in Bemba',
        helpCmdPanga: 'bemba panga [name]   — Create project (language → name → template if omitted)',
        helpCmdTemplate: 'bemba template sync   — Refresh docs/starter from bembajs-core',
        helpCmdSyncTpl: 'bemba sync-template     — Same as template sync',
        helpCmdTungulula: 'bemba tungulula       — Start dev server (primary; matches bun run dev)',
        helpCmdAkha: 'bemba akha            — Export static HTML (→ dist/)',
        helpCmdFumya: 'bemba fumya           — Export static HTML (→ out/)',
        helpCmdLint: 'bemba lint            — Lint code',
        helpCmdFormat: 'bemba format          — Format code',
        helpCmdEmit: 'bemba emit-react      — Emit JSX for bundler + React',
        helpCmdVersion: 'bemba --version       — Show version',
        helpCmdHelp: 'bemba help            — Show this help',
        helpLangHint:
            'Run `bemba` alone for a menu. `bemba panga` without a name asks language, folder name, then template. Or: bemba --lang bem panga my-app -t ui',
        helpWebsite: 'Website: https://bembajs.dev',
        helpDocs: 'Docs: https://docs.bembajs.dev',
        helpGh: 'Community: https://github.com/bembajs/bembajs',
        lintRunning: 'Linting BembaJS code...',
        lintDone: 'Linting complete.',
        formatRunning: 'Formatting BembaJS code...',
        formatDone: 'Formatting complete.'
    },
    bem: {
        programDesc: 'BembaJS — framework iingana ne Next.js pa chilambo cha Bemba',
        pangaDesc: 'Panga project iipya',
        tungululaDesc: 'Gulula sava yakupanga (cimo ne bun run dev mu maproject)',
        akhaDesc: 'Fumya HTML pa production (default ./dist)',
        fumyaDesc: 'Fumya HTML (default ./out)',
        emitReactDesc: 'Fumya JSX ukufuma .bemba',
        lintDesc: 'Konkola ama code',
        formatDesc: 'Lungika ama code',
        helpDesc: 'Mona ukwafwa',
        optTemplate: 'Ifishi shapusulo: base | ui',
        optTypescript: 'TypeScript',
        optOutput: 'Bufolder bwa kufumya',
        optBaseUrl: 'URL ya site (sitemap / RSS)',
        optLocale: 'html lang (BCP 47)',
        optSiteTitle: 'Ishina lya RSS',
        optNoBembaSite: 'Kwatako bemba-site.js',
        optEmitOut: 'Bufolder bwa JSX',
        optLang: 'Umulomo wa CLI: en | bem (nangu BEMBA_CLI_LANG)',

        chooseCliLang: 'Sala ululomi lwa CLI · Choose language (mapeeso + project)',
        langChoiceEnglish: 'Icilungu (English)',
        langChoiceBemba: 'Icifulo ca Bemba',
        langPromptRl: 'Ululomi [1 Icilungu · 2 Bemba, default 1]: ',

        pangaArgName: 'Ishina lyabufolder (nga tashile, kulakulanda)',
        projectNamePrompt: 'Ishina lyabufolder (nga my-app)',
        projectNameRequired: 'Lemba ishina',
        projectNameRl: 'Ishina lyabufolder: ',
        invalidProjectName: 'Ishina tashilungika: ukufwile ama letters, numbers, . _ - (tafwile ama path nangu amasango).',

        mainMenuTitle: 'Ulefwaya ukucita nshi?',
        mainMenuCreate: 'Panga project iipya (ululomi → ishina → ifishi)',
        mainMenuHelp: 'Mona ukwafwa wa ma command',
        mainMenuExit: 'Fuma',
        mainMenuPromptRl: 'Sala [1 panga · 2 help · 3 fuma, default 1]: ',

        startingDev: 'Tungulula sava yakupanga ya BembaJS...',
        hotReload: 'Hot reload yaliko; cinshi Ctrl+C pakuleka.',
        stoppingDev: 'Tuleka sava yakupanga...',
        devStartErr: 'Twashilibwesha ukutungulula sava:',
        devCwdHint: 'Ina mu bufolder bwa project ya BembaJS',
        devNoProject:
            'Tayali project ya BembaJS: ukufwile amapeji/ ne page .bemba. Panga project ne bemba panga, elyo ina muli.',
        coreMissingPanga: 'bembajs-core yafwile pakupanga project. Shishikishe bembajs-core.',
        unknownTemplate: (t) => `Ifishi shapusulo "${t}" tashishishiba. Ukufwile --template base nangu ui.`,
        exportMissing: 'bembajs-core ne static export yafwile.',
        emitScriptMissing: 'emit-react-routes.js tayashikwete. Panga nakabili bembajs.',
        coreMissingTemplate: 'bembajs-core yafwile pa `bemba template`. Shishikishe: bun add -d bembajs-core',
        chooseTemplate: 'Sala ifishi shapusulo',
        tmplBase: 'base — pusulo ya panshi',
        tmplUi: 'ui — ama block ya UI',
        tmplPrompt: 'Ifishi [1/2, default 1]: ',
        promptHeader: 'Sala ifishi shapusulo:',
        promptLine1: '  1) base — pusulo ya panshi',
        promptLine2: '  2) ui   — ama block ya UI',

        helpTitle: 'BembaJS',
        helpCmdPanga: 'bemba panga [ishina] — Panga project (ululomi → ishina → ifishi nga tashile)',
        helpCmdTemplate: 'bemba template sync   — Sansa docs ne starter',
        helpCmdSyncTpl: 'bemba sync-template     — Cimo ne template sync',
        helpCmdTungulula: 'bemba tungulula       — Gulula sava (cimo ne bun run dev)',
        helpCmdAkha: 'bemba akha            — Fumya HTML → dist/',
        helpCmdFumya: 'bemba fumya           — Fumya HTML → out/',
        helpCmdLint: 'bemba lint            — Konkola',
        helpCmdFormat: 'bemba format          — Lungika',
        helpCmdEmit: 'bemba emit-react      — Fumya JSX',
        helpCmdVersion: 'bemba --version       — Mano ya version',
        helpCmdHelp: 'bemba help            — Uku afwa',
        helpLangHint:
            'Ina `bemba` yeka ku menu. `bemba panga` nga tashile ishina kulanda ululomi, ishina, elyo ifishi. Nangu: bemba --lang bem panga my-app -t ui',
        helpWebsite: 'Website: https://bembajs.dev',
        helpDocs: 'Docs: https://docs.bembajs.dev',
        helpGh: 'GitHub: https://github.com/bembajs/bembajs',
        lintRunning: 'Tulikonkola...',
        lintDone: 'Ukukonkola kwapwa.',
        formatRunning: 'Tulungika...',
        formatDone: 'Ukulungika kwapwa.'
    }
};

function normalizeLang(raw) {
    if (core) return core.normalizeLang(raw);
    const s = String(raw == null ? 'en' : raw)
        .trim()
        .toLowerCase();
    if (s === 'bem' || s === 'bemba' || s === 'ci-bemba') return 'bem';
    return 'en';
}

/** `-l` / `--lang` in argv only; `undefined` if absent (interactive may prompt). */
function parseLangFromArgvOnly(argv) {
    if (core && typeof core.parseLangFromArgvOnly === 'function') {
        return core.parseLangFromArgvOnly(argv);
    }
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

function parseEarlyLangFromArgv(argv) {
    if (core) return core.parseEarlyLangFromArgv(argv);
    const fromArgv = parseLangFromArgvOnly(argv);
    if (fromArgv !== undefined) return fromArgv;
    return normalizeLang(process.env.BEMBA_CLI_LANG || 'en');
}

function activeLang() {
    return normalizeLang(process.env.BEMBA_CLI_LANG || 'en');
}

function langExplicitInArgv(argv) {
    return parseLangFromArgvOnly(argv) !== undefined;
}

function hasPersistedCliLangEnv() {
    const v = process.env.BEMBA_CLI_LANG;
    return v != null && String(v).trim() !== '';
}

function msg(key, ...args) {
    const lang = activeLang();
    const bucket = EXTRA[lang] || EXTRA.en;
    const val = bucket[key] != null ? bucket[key] : EXTRA.en[key];
    if (typeof val === 'function') return val(...args);
    return val != null ? val : key;
}

// Apply language from argv only; keep shell BEMBA_CLI_LANG; leave unset for interactive `panga` prompt.
const __langFlag = parseLangFromArgvOnly(process.argv);
if (__langFlag !== undefined) {
    process.env.BEMBA_CLI_LANG = __langFlag;
}

module.exports = {
    parseEarlyLangFromArgv,
    parseLangFromArgvOnly,
    langExplicitInArgv,
    hasPersistedCliLangEnv,
    normalizeLang,
    activeLang,
    msg,
    loadCoreI18n: () => core
};
