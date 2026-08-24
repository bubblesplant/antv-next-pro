# 集成记录

## 当前集成范围

- Vite+ monorepo、pnpm workspace/catalog、Node/pnpm 版本约束。
- 组件包、Playground、双语 VitePress 文档。
- ProTable、EditableProTable 共享编辑内核。
- SchemaForm 字段渲染、组合字段和八个布局别名。
- Git hooks、Commitlint、Changesets、CI、Release、GitHub Pages。

## 收尾检查项

- 修复 Vue SFC 声明生成中的私有 Props 类型。
- 以真实 `dist` 文件名统一 package exports 与 CI 校验。
- 增加消费者类型、ESM/CJS、样式入口及 tarball 验证。
- 运行格式、Lint、类型、覆盖率、Browser Mode、构建和 npm pack 全量验收。

最终命令、结果与缺陷回流记录见 `test-report.md`。
