# ProFormFields 与上层组件统一改造测试报告

日期：2026-09-14

状态：最终验收完成。AC-01～AC-30 与 AC-32 通过；AC-31 因本机浏览器环境不可用，按契约记录为无法验证。

## 最终结论

- PRD 验收标准：通过 31，失败 0，无法验证 1。
- 当前严重缺陷：0。
- 回流轮次：1 轮缺陷回流；第 1 轮发现的 5 个阻断均已修复并在第 2 轮最终验收关闭。
- 单元测试：无缓存完整覆盖率运行共 8 个文件、126/126 测试通过；其中 ProFormFields 专项为 2 个文件、32/32 测试通过。
- 发布消费：包构建、ESM、CJS、类型声明、CSS 入口与 npm pack 文件清单全部验证通过。
- TODO：剩余 3 项任务和 19 项 ProFormFields 清单已更新为完成。
- Browser Mode：无法验证。项目 Playwright Core 1.62.1 要求 Chromium revision 1234，本机仅缓存 revision 1187/1208；按 PRD 与技术契约要求未自行安装浏览器。

## 最终执行结果

| 命令或检查                                                                      | 结果                                                                                                       |
| ------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------- |
| `vp run -r typecheck`                                                           | 通过，工作区类型检查退出码 0                                                                               |
| `vp test run --project unit --coverage --no-cache`（`packages/antdv-next-pro`） | 通过，8/8 文件、126/126 测试通过                                                                           |
| `vp run -w lint:vue`                                                            | 通过，两个 Vue 宏顺序问题修复后复跑退出码 0                                                                |
| `vp run -r build`                                                               | 通过，组件包、playground 与 docs 全部构建成功；沙箱内首次 `spawn EPERM` 属环境限制，允许子进程后同命令通过 |
| `vp run docs#build`                                                             | 通过，中英文文档与示例构建成功                                                                             |
| `vp run antdv-next-pro#verify:package`                                          | 通过；`vp pack`、消费者 `tsc`、ESM/CJS/types/CSS/npm-pack 校验全部成功，0/3 缓存命中                       |
| 文档格式与局部差异检查                                                          | 通过                                                                                                       |
| `git diff --check`                                                              | 通过，无尾随空格或差异格式错误                                                                             |
| Browser Mode                                                                    | 无法验证；缺少项目要求的 Chromium revision 1234，未安装浏览器                                              |

## 覆盖率

无缓存覆盖率结果：

| 范围                  | Statements | Branches | Functions |  Lines |
| --------------------- | ---------: | -------: | --------: | -----: |
| 全局                  |     91.81% |   83.06% |    85.38% | 94.61% |
| `src/pro-form-fields` |     84.46% |   76.33% |    73.97% | 87.50% |

覆盖率配置已纳入 `src/pro-form-fields/**/*.ts`、`FieldControl.vue`、`ProFormField.vue` 与 `ReadonlyField.vue`；现有全局门槛未降低。

## AC-01～AC-32 证据矩阵

| AC    | 状态     | 最终证据                                                                                                                                                             |
| ----- | -------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| AC-01 | 通过     | 19 个独立公开 SFC 均存在；目录与根入口可具名导出，19 个模板友好名称全部进入 Vue 插件注册数组。                                                                       |
| AC-02 | 通过     | 19 个公开字段及共享 `ProFormField` 均使用 `.vue`、`<template>`、`<script setup lang="ts">`，未新增 JSX/TSX 组件视图。                                                |
| AC-03 | 通过     | 公开包装统一复用 `ProFormField`、`FieldControl`、字段注册表、异步选项与只读工具，没有复制维护 value/checked/fileList、请求或只读主逻辑。                             |
| AC-04 | 通过     | 默认 `fieldMode='form-item'` 只创建一个 FormItem；`fieldMode='field'` 只渲染控件，测试验证 FieldControl 直接子节点与裸控件结构。                                     |
| AC-05 | 通过     | 公共字段 Props、19 个专属泛型 Props、`name` 路径、`fieldProps`、`formItemProps` 与 emits 均有声明；消费者类型检查通过。                                              |
| AC-06 | 通过     | 测试验证顶层语义属性优先、默认值可由 fieldProps 覆盖、class/style/attrs 分流，以及内部更新 → fieldProps 回调 → 公开 emit 的顺序。                                    |
| AC-07 | 通过     | 共享只读与受控更新测试覆盖 disabled、readonly、undefined/null、空字符串、0、false、空数组及父级重置后的回显。                                                        |
| AC-08 | 通过     | Checkbox/Switch 使用 checked 桥接，Upload 使用 fileList 桥接；受控更新与表单重置沿统一 modelValue 协议生效。                                                         |
| AC-09 | 通过     | Select、TreeSelect、Checkbox Group、RadioGroup 与 Segmented 共用 options/valueEnum/request，覆盖加载态、错误回调、本地回退和只读标签。                               |
| AC-10 | 通过     | 测试覆盖远程成功、权威空数组、失败保留、params 变化、最后请求胜出、卸载保护及卸载后 refresh。                                                                        |
| AC-11 | 通过     | ReadonlyMap 与枚举项显式 value 保留数字类型；选择、回显、只读匹配不修改 modelValue 类型。                                                                            |
| AC-12 | 通过     | Text、Password、TextArea 的值桥接、清空、只读、密码掩码、属性及共享插槽透传已覆盖。                                                                                  |
| AC-13 | 通过     | Digit 默认 `precision=2`、`min=0`，fieldProps 可覆盖，顶层 `false` 可分别关闭默认限制。                                                                              |
| AC-14 | 通过     | Money 默认 `¥`、formatter/parser/stringMode、字符串值、空值与只读格式化均通过验证。                                                                                  |
| AC-15 | 通过     | 四类日期控件的 update/清空桥接、DateTime showTime 默认、Dayjs 单值/区间语义、重置与只读格式化通过。                                                                  |
| AC-16 | 通过     | Captcha 覆盖 loading、防重复点击、成功倒计时、显式 resetCountdown、返回 false、reject 恢复及错误事件。                                                               |
| AC-17 | 通过     | Select 普通/异步与单多选共用选项核心；TreeSelect 对本地和远程 children 递归归一化，并递归解析只读标签。                                                              |
| AC-18 | 通过     | Checkbox 单控件/组选项切换与 horizontal/vertical layout 通过；RadioGroup 异步选项刷新通过。                                                                          |
| AC-19 | 通过     | Slider、Switch、Segmented 的值更新、checked/value 适配、禁用/只读和属性透传通过共享与专项测试。                                                                      |
| AC-20 | 通过     | UploadButton/UploadDragger 覆盖受控 fileList、change/drop、默认内容插槽、只读文件名；无 action/customRequest 时阻止隐式网络上传。                                    |
| AC-21 | 通过     | `ProFormText.Password === ProFormTextPassword`、`ProFormRadio.Group === ProFormRadioGroup`；模板友好名称可独立导入和全局注册，文档已说明对应关系。                   |
| AC-22 | 通过     | ProTable 搜索区使用 `ProFormField` 表单项模式，保留查询、重置、折叠、异步选项、列级 fieldProps/formItemProps 与请求错误回调。                                        |
| AC-23 | 通过     | ProTable 可编辑单元格通过兼容层复用 `FieldControl` 裸控件，不嵌套 FormItem；编辑、校验、保存与失败路径回归通过。                                                     |
| AC-24 | 通过     | SchemaForm 默认字段统一复用 `FieldControl`，布局、嵌套路径、FormList、依赖、转换、异步选项、动态配置与只读流程回归通过。                                             |
| AC-25 | 通过     | SchemaForm 保留字段 slot → renderFormItem → 自定义 component → 默认控件优先级，动态字段插槽与 FormItem 直接子节点测试通过。                                          |
| AC-26 | 通过     | EditableProTable 继续经 ProTable 复用字段核心；新增、编辑、校验、保存、取消、树形记录、草稿同步和外层 formItemProps 回归通过。                                       |
| AC-27 | 通过     | `treeSelect`、`slider`、`segmented` 已加入 valueType/字段注册；`timeRange` 映射修复；Captcha 与两个 Upload 保持独立组件，边界有文档。                                |
| AC-28 | 通过     | 中英文 ProFormFields 页面覆盖全部 19 项并含 live demo；三类上层文档、导航、快速开始、兼容矩阵、根 README、包 README 与链接均已同步，docs 构建通过。                  |
| AC-29 | 通过     | 32 项字段专项测试覆盖公共 API、双模式、优先级、重置、插槽、异步竞态、只读、错误及各高风险专属行为；完整单测 126/126 通过。                                           |
| AC-30 | 通过     | 类型检查、无缓存单测/覆盖率、Vue lint、全构建、docs 构建及 ESM/CJS/types/CSS/npm-pack 消费验证全部通过。                                                             |
| AC-31 | 无法验证 | Playwright Core 要求 Chromium revision 1234，本机仅缓存 1187/1208。依契约未自行安装；替代证据为 126 项无缓存单测、72 项上层专项回归、全构建、docs 构建及包消费验证。 |
| AC-32 | 通过     | 在 AC-01～AC-30 全部通过且无严重缺陷后，`artifacts/TODO.md` 剩余 3 项与 19 项组件清单已全部标记完成。                                                                |

## 缺陷回流关闭记录

1. 覆盖率口径：已纳入 ProFormFields 纯逻辑与三个关键 SFC，并以无缓存覆盖率复验。
2. TreeSelect 深层选项：已修复 children 递归归一化与递归只读标签查找，并补本地/远程测试。
3. 包消费验证：已补 19 个运行时导出、两个组合别名、代表性泛型 Props，以及基于 TypeScript AST 的 ESM/CJS 顶层导出校验。
4. 公开 ProFormField 类型：SFC 已复用公开泛型 Props，消费者类型检查不再出现 `readonlyRender` 的 `never` 漂移。
5. 专属行为测试：专项测试由 26 项扩展至 32 项，补齐 Slider/Segmented、Checkbox layout、Radio 异步、四类日期、Money、TreeSelect 与 Upload 插槽等风险路径。

当前无未关闭的严重产品缺陷。构建中的 CJS/ESM 混合导出提示、插件耗时提示，以及包校验脚本的 Node 弃用提示均未导致失败，列为非阻塞维护项。
