# 项目配置

utdsl 的项目配置文件默认是在 `utdsl.config.js` 里面，同时也支持写在 `package.json` 的 utdsl 字段里面。

```javascript
module.exports = {
    // 测试文件的导出路径
    outputPath: './__tests__',
    // 被测试的文件相对于项目的路径
    fileRelativePath: './',
};
```

## 字段详细说明
