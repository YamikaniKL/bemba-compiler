// Bemba folder structure and naming conventions
const BEMBA_FOLDERS = {
    PAGES: 'amapeji',           // pages - File-based routing
    COMPONENTS: 'ifikopo',      // components - Reusable components
    PUBLIC: 'amashinda',        // public - Static assets
    API: 'mafungulo',          // api - API routes
    STYLES: 'imikalile',       // styles - CSS/styling
    UTILS: 'imilandile',       // utils - Utility functions
    CONFIG: 'bemba.config.js'  // Framework configuration
};

/** Reserved filenames (inside folder paths like amapeji/). */
const BEMBA_FILES = {
    /** Shared navbar + footer + optional shell CSS; merged when a page uses umusangoSite: ee. */
    SITE_SHELL: 'umusango.bemba'
};

/** Special `ingisa` partial names (ifikopo/… or ifikopo/cipanda/…). */
const BEMBA_INGISA = {
    /**
     * Navbar shell: `pangaIcapaba` HTML may include `{{BEMBA_NAV_BRAND}}` and `{{BEMBA_NAV_LINKS}}`.
     * Filled from `umusango.bemba` when the page has `umusangoSite: ee` (same data as the built-in header).
     */
    NAV_BAR: 'NavBar'
};

// Bemba file extensions
const BEMBA_EXTENSIONS = {
    COMPONENT: '.bemba',
    PAGE: '.bemba',
    API: '.bemba',
    STYLE: '.css',
    CONFIG: '.js'
};

// Bemba syntax keywords for framework features
const BEMBA_SYNTAX = {
    // Component definition
    COMPONENT_DEF: 'fyambaIcipanda',
    PAGE_DEF: 'pangaIpepa',
    SITE_SHELL_DEF: 'pangaUmusango',
    /** HTML partial for static pages (ifikopo); paired with page field `ingisa: [ 'Name' ]`. */
    PARTIAL_DEF: 'pangaIcapaba',
    
    // Component properties
    PROPS: 'ifyapangwa',
    STATE: 'ifyakubika',
    CONSTRUCTOR: 'ukupanga',
    RENDER: 'ukwisulula',
    DATA_FETCHING: 'ukutolaCifukwa',
    
    // Hooks
    HOOKS: {
        useState: 'bomfyaFyakubika',
        useEffect: 'bomfyaCintikoLya',
        useContext: 'bomfyaUkwikala',
        useRef: 'bomfyaUkusangula',
        useReducer: 'bomfyaUkukonkelesha',
        useMemo: 'bomfyaUkwipaya',
        useCallback: 'bomfyaUkubomfya'
    },
    
    // Routing
    ROUTING: {
        navigate: 'ukuya',
        goBack: 'ukubwelela',
        route: 'inshila',
        params: 'ifyapilibula',
        query: 'ukufunafuna'
    },
    
    // Control flow
    RETURN: 'bwelela',
    FUNCTION: 'nokuti',
    ASYNC: 'lombako',
    AWAIT: 'leka',
    THIS: 'ici',
    IF: 'ngati',
    ELSE: 'kapena',
    ELSE_IF: 'kapena ngati',
    FOR: 'kwa',
    IN: 'mu',
    WHILE: 'pamene',
    DO: 'cita',
    TRY: 'linga',
    CATCH: 'kwata',
    FINALLY: 'paumalilo',
    SWITCH: 'sankha',
    CASE: 'case',
    DEFAULT: 'default',
    BREAK: 'bwelela',
    CONTINUE: 'tambulukila',
    
    // JSX elements (Bemba equivalents)
    JSX: {
        div: 'icipandwa',
        section: 'iciputulwa',
        header: 'umutwe',
        button: 'ibatani',
        input: 'ukulemba',
        img: 'icikope',
        link: 'umukunko',
        span: 'ukupandika',
        p: 'ukulondolola',
        h1: 'umutwe_ukulu',
        h2: 'umutwe_ukalamba',
        h3: 'umutwe_ukalamba_katono'
    }
};

// Default configuration
const DEFAULT_CONFIG = {
    inshila_yakutantika: '/',
    ifyuma_kunuma: '/amashinda',
    ukuakha: {
        fumyamo: './dist',
        ukukonkelesha: true
    },
    /**
     * React-first dev: pages with `ukwisulula` are rendered with react-dom/server (same module graph
     * shape as production bundlers). Layout-first `pangaIpepa` pages (no `ukwisulula`) still use the
     * static HTML compiler. Set `reactSsrDev: false` to restore legacy “static HTML first” ordering.
     */
    framework: {
        reactSsrDev: true,
        /** When true and a Vite config exists, `bemba tungulula` / `bemba akha` use Phisha (Injini / full React SPA). */
        reactApp: true,
        /** Tailwind-first responsive defaults used by starter templates and shell output. */
        responsive: {
            strategy: 'tailwind-first',
            mobileFirst: true,
            breakpoints: {
                sm: 640,
                md: 768,
                lg: 1024,
                xl: 1280,
                '2xl': 1536
            }
        }
    },
    server: {
        port: 3000
    },
    routing: {
        trailingSlash: false,
        caseSensitive: false
    }
};

module.exports = {
    BEMBA_FOLDERS,
    BEMBA_FILES,
    BEMBA_INGISA,
    BEMBA_EXTENSIONS,
    BEMBA_SYNTAX,
    DEFAULT_CONFIG
};
