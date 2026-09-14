# 集成记录

## 当前集成范围

- Vite+ monorepo、pnpm workspace/catalog、Node/pnpm 版本约束。
- 组件包、Playground、双语 VitePress 文档。
- ProTable、EditableProTable 共享编辑内核。
- SchemaForm 字段渲染、组合字段和八个布局别名。
- Git hooks、Commitlint、Changesets、CI、Release、GitHub Pages。

## ProFormFields 消费者集成

- ProTable 搜索区统一通过 `ProFormField` 的 `form-item` 模式渲染，并完整透传 `dataIndex`、标题、`fieldProps` 与 `formItemProps`；可编辑单元格由 `ValueTypeControl` 兼容层复用 `FieldControl`。
- SchemaForm 默认字段统一通过 `FieldControl` 渲染，继续保留自定义 `column.component` 的优先级，并转发 `request`、`params`、`onFieldRequestError`；`readonly` 与 `disabled` 分别处理。
- 远程选项成功返回空数组时以空数组为权威结果；后续请求失败时保留最后一次成功结果，首次失败时回退本地选项，并调用字段级错误回调。组件卸载后会使未完成的选项请求失效。
- `valueEnum` 支持 `ReadonlyMap` 与枚举项显式 `value`，数字值不会被字符串化。
- 专项验证：`vp test run --project unit tests/table-value-type.test.ts tests/table-utils.test.ts tests/schema-form.test.ts tests/table.test.ts`，结果为 4 个文件、72 个测试通过。
- 包级 `vp run typecheck` 已消除 ProTable 消费者层 TS2589；公共字段层测试的剩余类型问题由对应集成任务继续收敛。

## 收尾检查项

- 修复 Vue SFC 声明生成中的私有 Props 类型。
- 以真实 `dist` 文件名统一 package exports 与 CI 校验。
- 增加消费者类型、ESM/CJS、样式入口及 tarball 验证。
- 运行格式、Lint、类型、覆盖率、Browser Mode、构建和 npm pack 全量验收。

最终命令、结果与缺陷回流记录见 `test-report.md`。
