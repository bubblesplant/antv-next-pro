# antv-next-pro 最终测试报告

日期：2026-08-24  
状态：功能验收通过；完整 quality 复跑存在 1 项本地环境阻塞（Playwright Chromium 可执行文件缺失）。

## 验收结论

- PRD 验收标准：通过 10，失败 0，无法验证 0。
- 严重缺陷：0。
- Vitest 单元测试：6 个文件，70/70 通过。
- Vitest Browser Mode：4 个文件，31/31 通过，浏览器为 Playwright Chromium。
- Playground ProTable：15 个分组、41/41 个场景均已实现；id、title、mode 全部唯一且无缺失实现。
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
9. ProTable、EditableProTable、SchemaForm、公开类型、Vue 插件安装及八个 SchemaForm 布局别名均可用；Playground 与中英文文档已提供示例，并按官方 Table 页面顺序收录全部 41/41 个演示场景。
10. CI 核心逻辑覆盖率满足 statements/lines/functions 80%、branches 75% 的门槛。

## 最终执行结果

| 检查                                              | 结果                                                                                   |
| ------------------------------------------------- | -------------------------------------------------------------------------------------- |
| vp run quality --no-cache -v                      | 格式、Lint、类型与 70 个单测通过；Browser Mode 因本机缺少 chromium-1234 可执行文件中断 |
| vp fmt --check .                                  | 通过，87 个文件格式正确                                                                |
| vp lint .                                         | 通过，0 errors；用户既有 table.test.ts 有 2 条 warning                                 |
| Vue ESLint                                        | 通过，0 warnings、0 errors                                                             |
| vp run --no-cache -v -r typecheck                 | 3/3 通过                                                                               |
| vp run --no-cache -v antdv-next-pro#test:coverage | 70/70 通过                                                                             |
| Browser Mode                                      | 前序完整回归 4 个文件、31/31 通过；本轮复跑受本机浏览器缓存缺失阻塞                    |
| Playground ProTable 演示                          | 41/41 场景已收录；场景 28/29/30/33/41 完成浏览器烟测                                   |
| vp run --no-cache -v -r build                     | 3/3 通过，0 次缓存命中                                                                 |
| 消费者与包导出验证                                | ESM、CJS、声明、source map、CSS、npm pack 文件清单全部通过                             |
| pnpm install --frozen-lockfile                    | Node 24.19.0 + pnpm 11.22.0 下通过，lockfile 无改动                                    |

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
- Playground 场景 28：中英文查询、工具栏、分页、表头和状态文案切换正确。
- Playground 场景 29：阿拉伯语文案、RTL 方向和分页箭头正确。
- Playground 场景 30：暗色与紧凑主题视觉可读。
- Playground 场景 33：列显隐即时生效，重挂载后持久化正确，并已恢复默认状态。
- Playground 场景 41：空姓名可阻止行保存和外层提交；修正后保存、提交成功，百分比 75% 编辑保存正确。

## 缺陷回流

本次累计完成 5 轮集中回流，均已修复并回归：

1. 声明与包导出集成：修复 Vue SFC 私有 Props 声明、统一 dist 文件名、补齐 ESM/CJS/类型/CSS 与 npm pack 验证。
2. 公共 API 一致性：修复 EditableProTable 回调重复派发，补齐 EditableAction.start/editing、renderFormItem.update 与八种 SchemaForm 公开注册名。
3. 竞态与测试真实性：修复 StepsForm 并发 next 跳步，补齐向前校验与向后导航，统一自定义保存的 validationError，并加入真实 Browser Mode 回归。
4. ProTable 演示完整性：按官网目录补齐 41 个场景，完成 mode 唯一性、分组引用和实现覆盖审计，并补充能力级 Browser Mode 测试。
5. 本地化与交互回流：补齐中英阿文案、RTL、暗色/紧凑主题、columnsState 持久化、错误边界和外层表单校验；消除场景 41 的 InputNumber addonAfter 废弃告警。

当前无严重缺陷。测试日志中的 Vue DOM stub 属性告警、ResizeObserver 通知、VitePress/Rolldown 兼容提示、混合导出与大 chunk 提示均未导致失败，列为非阻塞维护项。

本轮完整 quality 复跑在 Browser Mode 启动阶段发现本机仅缓存 chromium-1187/1208，而当前 Playwright 需要 chromium-1234。该问题不属于产品代码缺陷；前序 31/31 浏览器回归与本轮页面烟测结果仍有效。若要再次获得单命令 quality 退出码 0，需要在用户明确授权后补齐对应 Playwright Chromium。

## 本地无法替代的外部验证

以下环节依赖 GitHub 托管环境、仓库权限或密钥，本地未实际触发：

- GitHub Actions 托管 CI/Release/Docs 运行。
- Changesets 自动创建版本 PR。
- npm provenance 正式发布。
- GitHub Pages 实际部署。

npm 正式发布仍需在仓库 Secrets 中配置 NPM_TOKEN；未配置时，流水线只能完成 CI、版本 PR 和发布前构建，不执行 npm publish。
