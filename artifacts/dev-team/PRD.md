# antv-next-pro 首版 PRD

状态：已确认。来源为用户提交的《antv-next-pro Monorepo 与组件库实施计划》，并已明确要求实施。

## 目标

交付一个基于 Vue 3.5、TypeScript、Antdv Next 和 Vite+ 的可发布 monorepo，npm 包名为 `antdv-next-pro`，首版提供 `ProTable`、`EditableProTable`、`SchemaForm` 三个核心组件，并配套开发站、双语文档、测试、质量门禁和 Changesets 自动发布。

## 用户故事

1. 组件消费者可以通过具名导入或 Vue 插件安装使用三个核心组件及八个 SchemaForm 布局别名。
2. 业务开发者可以用统一的 `columns` 模型描述表格展示、查询、筛选、排序、编辑和表单字段。
3. 业务开发者可以用通用 Promise `request` 接入任意请求层，并获得竞态保护、加载态和错误事件。
4. 表格用户可以在 `ProTable` 或 `EditableProTable` 中编辑、校验、保存、取消、删除和创建记录。
5. 表单用户可以使用普通、嵌入、弹层、查询、轻量和步骤布局，以及组合字段、转换、异步选项和 URL 同步。
6. 维护者可以在 Node.js 24 + pnpm 11 下统一执行格式、Lint、类型、单测、浏览器测试、构建、打包和发布。

## 验收标准

- monorepo 包含 `packages/antdv-next-pro`、`apps/playground`、`apps/docs`。
- Vite+ 集中配置 Oxlint、Oxfmt、Vitest、Browser Mode、tsdown、staged 和任务编排。
- `@antfu/eslint-config` 仅检查 Vue SFC，Oxfmt 是唯一格式化器，`vue-tsc` 补充模板类型检查。
- Git hooks 使用 `.vite-hooks`，提交信息由 Commitlint 校验。
- Changesets 初始 minor 变更可将 `0.0.0` 发布为 `0.1.0`。
- CI 覆盖格式、Lint、类型、覆盖率、Chromium Browser Mode、构建及消费者导出/包内容验证。
- Release 仅在 main 分支 CI 成功后创建版本 PR 或发布；无 `NPM_TOKEN` 时不发布 npm。
- npm 包输出 ESM、CJS、类型声明、source map 和独立样式入口，并外置 `vue`、`antdv-next`。
- 三个核心组件与公开类型、Vue 插件安装、文档示例可用。
- 核心逻辑覆盖率门槛：statements/lines/functions 80%，branches 75%。

## 边界

- 不引入特定请求库，不提供 React 运行时兼容。
- 不实现 ProLayout、ProCard、ProList、ProDescriptions 等其他组件。
- 仓库名保留 `antv-next-pro`，npm 包名使用 `antdv-next-pro`。
