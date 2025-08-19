const jPackData = {
    name: 'DOM',
    alias: 'jizy-dom',
    cfg: 'dom',
    assetsPath: 'dist',

    buildTarget: null,
    buildZip: false,
    buildName: 'default',

    onCheckConfig: () => { },

    onGenerateBuildJs: (code) => code,

    onGenerateWrappedJs: (wrapped) => wrapped,

    onPacked: () => { }
};

export default jPackData;