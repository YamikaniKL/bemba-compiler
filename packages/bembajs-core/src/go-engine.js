const path = require('path');
const { spawnSync } = require('child_process');

function resolveGoBinary(options = {}) {
    if (options.goBinary && typeof options.goBinary === 'string') {
        return options.goBinary;
    }
    if (process.env.BEMBA_CORE_GO_BIN) {
        return process.env.BEMBA_CORE_GO_BIN;
    }
    if (process.platform === 'win32') return 'bemba-core-go.exe';
    return 'bemba-core-go';
}

function runGoEngine(command, payload, options = {}) {
    const bin = resolveGoBinary(options);
    const cwd = options.projectRoot ? path.resolve(options.projectRoot) : process.cwd();
    const out = spawnSync(bin, ['--json', command], {
        cwd,
        input: JSON.stringify(payload),
        encoding: 'utf8',
        stdio: ['pipe', 'pipe', 'pipe']
    });
    if (out.error) {
        return { ok: false, reason: out.error.message || String(out.error) };
    }
    if (out.status !== 0) {
        return { ok: false, reason: (out.stderr || out.stdout || '').trim() || `exit ${out.status}` };
    }
    try {
        return { ok: true, value: JSON.parse(out.stdout || '{}') };
    } catch (e) {
        return { ok: false, reason: `invalid json from ${bin}: ${e.message}` };
    }
}

function shouldUseGo(options = {}) {
    return options && options.engine === 'go';
}

module.exports = {
    shouldUseGo,
    runGoEngine
};

