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
    BEMBA_EXTENSIONS,
    BEMBA_SYNTAX,
    DEFAULT_CONFIG
};
