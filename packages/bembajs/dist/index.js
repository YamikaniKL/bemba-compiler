/**
 * Public SDK surface for bembajs.
 * React-first framework behavior is implemented in bembajs-core; this package re-exports
 * the stable APIs and adds framework metadata.
 */
const core = require('bembajs-core');
const wrappers = require('./wrappers');
const { version } = require('../package.json');
const path = require('path');

function loadCoreCliClass() {
    try {
        const corePkg = path.dirname(require.resolve('bembajs-core/package.json'));
        const CoreCli = require(path.join(corePkg, 'dist', 'cli.js'));
        return typeof CoreCli === 'function' ? CoreCli : null;
    } catch (_) {
        return null;
    }
}

async function createDevServer(options = {}) {
    const CoreCli = loadCoreCliClass();
    if (!CoreCli) {
        throw new Error('bembajs-core CLI is unavailable for createDevServer()');
    }
    const cli = new CoreCli();
    const serverOptions = {
        port: options.port || 3000,
        host: options.host || 'localhost',
        ...options
    };
    return cli.startDevServer(serverOptions);
}

async function build(options = {}) {
    const CoreCli = loadCoreCliClass();
    if (!CoreCli) {
        throw new Error('bembajs-core CLI is unavailable for build()');
    }
    const cli = new CoreCli();
    const buildOptions = {
        output: options.output || 'dist',
        ...options
    };
    return cli.buildProject(buildOptions);
}

function cindika(code, options = {}) {
    return core.compile(code, options);
}

async function tungulula(options = {}) {
    return createDevServer(options);
}

async function akha(options = {}) {
    return build(options);
}

async function fumya(options = {}) {
    return core.exportStaticHtmlSite(options);
}

module.exports = {
    ...core,
    createDevServer,
    build,
    cindika,
    tungulula,
    akha,
    fumya,
    wrappers,
    framework: {
        name: 'bembajs',
        runtime: 'react',
        renderer: 'react-dom',
        routing: 'app-router'
    },
    version
};

module.exports.default = module.exports;
