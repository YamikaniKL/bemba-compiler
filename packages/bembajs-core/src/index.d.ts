export interface CompileStaticOptions {
    projectRoot?: string;
    currentPath?: string;
    pageFilePath?: string;
    layoutCode?: string;
    legacyFallback?: boolean;
    includeAst?: boolean;
    includeTransformedAst?: boolean;
    htmlLang?: string;
    headExtra?: string;
    bembaSiteScript?: boolean;
    engine?: 'js' | 'go';
    goBinary?: string;
}

export type CompileResult =
    | { success: true; code: string; legacy?: boolean; ast?: unknown; transformedAst?: unknown }
    | { success: false; error: string; stack?: string };

export interface ListStaticDepsOptions {
    projectRoot: string;
    pageFilePath?: string;
    transitive?: boolean;
    engine?: 'js' | 'go';
    goBinary?: string;
}

export interface ExportStaticHtmlOptions {
    projectRoot?: string;
    outDir?: string;
    baseUrl?: string;
    htmlLang?: string;
    locale?: string;
    siteTitle?: string;
    bembaSiteScript?: boolean;
}

export interface HeadMetaOptions {
    description?: string;
    canonical?: string;
    ogTitle?: string;
    ogDescription?: string;
    ogImage?: string;
}

export interface RssItem {
    path?: string;
    link?: string;
    title?: string;
    pubDate?: string | Date;
}

export interface PictureSourceSpec {
    srcset: string;
    media?: string;
    type?: string;
}

export interface BuildPictureHtmlOptions {
    src: string;
    alt?: string;
    sources?: PictureSourceSpec[];
    class?: string;
    sizes?: string;
    loadingLazy?: boolean;
}

interface BembajsCoreExports {
    compile(code: string, options?: CompileStaticOptions): CompileResult;
    listStaticPageDependencyPaths(code: string, options: ListStaticDepsOptions): string[];
    exportStaticHtmlSite(options?: ExportStaticHtmlOptions): Promise<{ outDir: string; pages: number }>;
    routeToOutHtmlPath(outDir: string, routePath: string): string;
    buildHeadMetaTags(opts?: HeadMetaOptions): string;
    generateSitemapXml(args: { baseUrl: string; paths: string[] }): string;
    generateRssFeedXml(args: { baseUrl: string; siteTitle?: string; items?: RssItem[] }): string;
    escapeXmlForStatic(s: string): string;
    resolveCssImports(
        css: string,
        baseDir: string,
        seen?: Set<string>,
        rootDir?: string | null
    ): string;
    publicAssetUrl(rel: string): string;
    buildPictureHtml(o?: BuildPictureHtmlOptions): string;
    parse(code: string): unknown;
    transform(ast: unknown): unknown;
    generate(ast: unknown): string;
    BembaLexer: unknown;
    BembaParser: unknown;
    BembaTransformer: unknown;
    BembaGenerator: unknown;
    BEMBA_KEYWORDS: Record<string, unknown>;
    BEMBA_FOLDERS: Record<string, string>;
    BEMBA_FILES: Record<string, string>;
    BEMBA_INGISA: Record<string, string>;
    version: string;
}

declare const bembajsCore: BembajsCoreExports & { default: BembajsCoreExports };
export = bembajsCore;
