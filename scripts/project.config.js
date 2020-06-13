export default {
    libraryName: 'GULP_UTDSL',
    libPath: './dist', // 相对于根目录
    bundleNodeModules: false, // 是否要打包 node_modules 下的文件
    enabledOutputCjs: false, // 是否打包出 cjs 模块文件
    isWebModule: false, // 是否是 web 模块
    defaultFormat: 'cjs', // 默认导出格式 (看你项目要在哪里使用)
    useExternal: true,
    externalPackage: 'dependencies', // 以哪个作为额外依赖包
};
