# antv-next-pro 最终测试报告

日期：2026-08-24  
状态：通过，可进入提交与 GitHub 托管流水线验证阶段。

## 验收结论

- PRD 验收标准：通过 10，失败 0，无法验证 0。
- 严重缺陷：0。
- Vitest 单元测试：6 个文件，69/69 通过。
- Vitest Browser Mode：3 个文件，16/16 通过，浏览器为 Playwright Chromium。
- 核心逻辑覆盖率超过门槛：statements、lines、functions 均高于 80%，branches 高于 75%。
- Node.js 由 Vite+ 按 .node-version 解析为 24.19.0，pnpm 由 packageManager 解析为 11.22.0。

## PRD 验收矩阵

1. packages/antdv-next-pro、apps/playground、apps/docs 三个工作区均已建立并可构建。
2. Oxlint、Oxfmt、Vitest、Browser Mode、tsdown、staged 和任务编排均集中在对应 vite.config.ts。
3. @antfu/eslint-config 仅检查 Vue SFC，Oxfmt 为唯一格式化器，vue-tsc 覆盖 Vue 模板类型。
4. .vite-hooks 已接入 pre-commit 与 commit-msg，Commitlint 使用 Conventional Commits。
5. Changesets 已配置公开发布、GitHub changelog、main 基线和初始 minor changeset。
6. CI 已覆盖格式、Lint、类型、覆盖率、Browser Mode、构建和消费者包验证。
7. Release 工作流受 CI 与 main 分支约束；缺少 NPM_TOKEN 时不会执行 npm 发布。
8. 组件包已验证 ESM、CJS、类型声明、声明 source map、运行时代码 source map 和独立 CSS 入口，并外置 vue、antdv-next。
9. ProTable、EditableProTable、SchemaForm、公开类型、Vue 插件安装及八个 SchemaForm 布局别名均可用；Playground 与中英文文档已提供示例。
10. CI 核心逻辑覆盖率满足 statements/lines/functions 80%、branches 75% 的门槛。

## 最终执行结果

| 检查                                              | 结果                                                       |
| ------------------------------------------------- | ---------------------------------------------------------- |
| vp run quality --no-cache -v                      | 通过；完整质量链退出码 0                                   |
| vp fmt --check .                                  | 通过，77 个文件格式正确                                    |
| vp lint .                                         | 通过，0 warnings、0 errors                                 |
| Vue ESLint                                        | 通过，0 warnings、0 errors                                 |
| vp run --no-cache -v -r typecheck                 | 3/3 通过，0 次缓存命中                                     |
| vp run --no-cache -v antdv-next-pro#test:coverage | 69/69 通过，0 次缓存命中                                   |
| Browser Mode                                      | 16/16 通过，本轮 table.browser.test.ts 为 cache miss       |
| vp run --no-cache -v -r build                     | 3/3 通过，0 次缓存命中                                     |
| 消费者与包导出验证                                | ESM、CJS、声明、source map、CSS、npm pack 文件清单全部通过 |
| pnpm install --frozen-lockfile                    | Node 24.19.0 + pnpm 11.22.0 下通过，lockfile 无改动        |

## 覆盖率

CI 核心逻辑口径，仅统计 table 与 schema-form 的可复用核心逻辑：

| Statements | Branches | Functions |  Lines |
| ---------: | -------: | --------: | -----: |
|     96.61% |   87.37% |      100% | 99.65% |

探索性全源码口径，额外纳入 Vue SFC；此口径用于观察组件渲染层测试深度，不作为当前 CI 门槛：

| Statements | Branches | Functions |  Lines |
| ---------: | -------: | --------: | -----: |
|     76.95% |   67.15% |    68.47% | 79.96% |

## Browser Mode 覆盖范围

- ProTable：真实搜索、排序、筛选、分页、选择、刷新、列设置与最后请求胜出。
- ProTable / EditableProTable：单行和多行编辑、保存失败、取消、删除、创建行、树形 parentKey、maxLength、完整数据双向绑定、自定义操作区与 renderFormItem 更新。
- SchemaForm：依赖联动、异步选项、真实表单校验、URL/hash 同步、受控 StepsForm 导航与弹层/布局相关交互。

## 缺陷回流

本次完成 3 轮集中回流，均已修复并回归：

1. 声明与包导出集成：修复 Vue SFC 私有 Props 声明、统一 dist 文件名、补齐 ESM/CJS/类型/CSS 与 npm pack 验证。
2. 公共 API 一致性：修复 EditableProTable 回调重复派发，补齐 EditableAction.start/editing、renderFormItem.update 与八种 SchemaForm 公开注册名。
3. 竞态与测试真实性：修复 StepsForm 并发 next 跳步，补齐向前校验与向后导航，统一自定义保存的 validationError，并加入真实 Browser Mode 回归。

当前无严重缺陷。测试日志中的 Vue DOM stub 属性告警、ResizeObserver 通知、VitePress/Rolldown 兼容提示、混合导出与大 chunk 提示均未导致失败，列为非阻塞维护项。

## 本地无法替代的外部验证

以下环节依赖 GitHub 托管环境、仓库权限或密钥，本地未实际触发：

- GitHub Actions 托管 CI/Release/Docs 运行。
- Changesets 自动创建版本 PR。
- npm provenance 正式发布。
- GitHub Pages 实际部署。

npm 正式发布仍需在仓库 Secrets 中配置 NPM_TOKEN；未配置时，流水线只能完成 CI、版本 PR 和发布前构建，不执行 npm publish。
