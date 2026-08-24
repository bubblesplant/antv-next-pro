# React Pro Components 兼容矩阵

兼容基线为 `@ant-design/pro-components@2.8.10`。目标是在 Vue 3 中近全量映射核心类型和工作流，而不是提供 React 运行时兼容层。

状态说明：<span class="compat-ok">支持</span>、<span class="compat-map">Vue 映射</span>、<span class="compat-partial">首版边界</span>。

## 核心映射

| React API                       | Vue API                 | 状态                                     | 说明                              |
| ------------------------------- | ----------------------- | ---------------------------------------- | --------------------------------- |
| `columns`                       | `columns`               | <span class="compat-ok">支持</span>      | 三个组件共享列模型                |
| `request(params, sort, filter)` | 同名 Promise 契约       | <span class="compat-ok">支持</span>      | 返回 `{ data, total?, success? }` |
| `actionRef`                     | 组件 `ref`              | <span class="compat-map">Vue 映射</span> | 实例方法保持相近命名              |
| `formRef` / `editableFormRef`   | 组件 `ref`              | <span class="compat-map">Vue 映射</span> | 不保留 React ref Props            |
| `value` / `onChange`            | `v-model`               | <span class="compat-map">Vue 映射</span> | 使用标准 `update:*` 事件          |
| `editableKeys`                  | `v-model:editable-keys` | <span class="compat-map">Vue 映射</span> | 单行和多行编辑共享状态机          |
| ReactNode Props                 | 具名插槽 / render 回调  | <span class="compat-map">Vue 映射</span> | 模板优先，回调便于复用            |
| `onRequestError`                | `request-error`         | <span class="compat-map">Vue 映射</span> | 请求失败保留当前数据              |

## 搜索折叠

`ProTable.search` 保留 React API 的核心含义：

| 配置                       | 行为                                  |
| -------------------------- | ------------------------------------- |
| `defaultCollapsed`         | 只初始化非受控折叠状态                |
| `collapsed`                | 受控折叠状态；父组件负责更新          |
| `span`                     | 搜索项栅格跨度，默认 `8`，即每行 3 项 |
| `labelWidth`               | 数字按 px 设置；`auto` 保持自适应     |
| `searchText` / `resetText` | 查询与重置按钮文本                    |
| `onCollapse(next)`         | 折叠状态变化回调                      |

Vue 同时触发 `search-collapse` 事件，可用受控方式书写：

```vue
<ProTable :search="{ collapsed, span: 8 }" @search-collapse="collapsed = $event" />
```

折叠时只展示首行；只有字段数量超过首行容量时才显示“展开/收起”按钮。

## 命名插槽

列插槽名优先使用 `column.key`，没有 `key` 时使用 `dataIndex`；数组路径以点连接，例如 `['profile', 'name']` 对应 `profile.name`。

| 组件       | 插槽                                  | 插槽参数                                          |
| ---------- | ------------------------------------- | ------------------------------------------------- |
| ProTable   | `toolbar-title`、`toolbar-actions`    | 工具栏内容                                        |
| ProTable   | `header-${columnKey}`                 | `{ column }`                                      |
| ProTable   | `cell-${columnKey}` 或 `${columnKey}` | `{ value, record, index, column, editable }`      |
| SchemaForm | `field-${path}`、`${path}` 或列 `key` | `{ value, record, column, dependencies, update }` |
| SchemaForm | `label-${path}`                       | `{ column, record }`                              |
| SchemaForm | `submitter`                           | `{ values, current }`                             |

未被 ProTable 消费的其他插槽会继续透传给底层 Antdv Next Table。

## `valueType` 支持

| 分类     | 类型                                                                  | ProTable / EditableProTable                       | SchemaForm                         |
| -------- | --------------------------------------------------------------------- | ------------------------------------------------- | ---------------------------------- |
| 文本     | `text`、`textarea`、`password`                                        | Input、Textarea、Password 搜索/编辑与格式化只读值 | Input、Textarea、Password          |
| 数字     | `digit`、`money`、`percent`                                           | 数字搜索与行内 InputNumber                        | InputNumber 及金额/百分比装饰      |
| 选项     | `select`、`radio`                                                     | 配合 `valueEnum` 的 Select / Radio 搜索和编辑     | Select、Radio                      |
| 状态     | `checkbox`、`switch`                                                  | 行内 Checkbox / Switch                            | Checkbox(Group) / Switch           |
| 日期时间 | `date`、`dateTime`、`dateRange`、`dateTimeRange`、`time`、`timeRange` | 对应日期/时间控件与格式化只读值                   | 日期/时间控件（`timeRange` 除外）  |
| 表格     | `index`、`indexBorder`、`option`                                      | 序号与操作列                                      | 不生成字段                         |
| 组合     | `group`、`formList`、`formSet`、`divider`、`dependency`               | 不生成数据列                                      | 分组、动态列表、集合、分隔线和联动 |

## ProTable 能力

| 能力                                  | 状态                                       | 备注                                                                         |
| ------------------------------------- | ------------------------------------------ | ---------------------------------------------------------------------------- |
| 本地/远程数据、搜索、分页、排序、筛选 | <span class="compat-ok">支持</span>        | 请求只接纳最后一次结果                                                       |
| 列显隐、顺序、固定与持久化            | <span class="compat-ok">支持</span>        | 内建面板仅控制显隐；`order` / `fixed` 通过 `columnsState` 编程控制，可持久化 |
| 刷新、密度、全屏、选择                | <span class="compat-ok">支持</span>        | Options、事件与实例 API                                                      |
| 轮询、窗口聚焦刷新、手动首请求        | <span class="compat-ok">支持</span>        | `polling` / `revalidateOnFocus` / `manualRequest`                            |
| 单行、多行、创建行和树形编辑          | <span class="compat-ok">支持</span>        | 与 EditableProTable 共用内核                                                 |
| React 特有 DOM/portal Props           | <span class="compat-partial">不移植</span> | 使用 Vue 插槽和 Antdv Next Props                                             |

## EditableProTable 映射

| React API            | Vue API                                                                      | 状态                                     |
| -------------------- | ---------------------------------------------------------------------------- | ---------------------------------------- |
| `value`              | `v-model:value`                                                              | <span class="compat-map">Vue 映射</span> |
| `controlled`         | 标准 `v-model` 约定                                                          | <span class="compat-map">Vue 映射</span> |
| `editableKeys`       | `v-model:editable-keys`                                                      | <span class="compat-map">Vue 映射</span> |
| `recordCreatorProps` | 同名 `record`、`position`、`parentKey`、`newRecordType`、`creatorButtonText` | <span class="compat-ok">支持</span>      |
| `maxLength`          | `maxLength`                                                                  | <span class="compat-ok">支持</span>      |
| `onValuesChange`     | 同名 Prop 或 `values-change` 事件                                            | <span class="compat-map">Vue 映射</span> |
| `onTableChange`      | 同名 Prop 或 `table-change` 事件                                             | <span class="compat-map">Vue 映射</span> |
| `editableFormRef`    | 组件 `ref`                                                                   | <span class="compat-map">Vue 映射</span> |

`value` 是完整数据的唯一受控入口，不再额外提供语义冲突的 `dataSource`。

## SchemaForm 映射

| React SchemaForm                 | Vue SchemaForm                   | 状态                                     |
| -------------------------------- | -------------------------------- | ---------------------------------------- |
| `columns`                        | `columns`                        | <span class="compat-ok">支持</span>      |
| `layoutType`                     | `layoutType`                     | <span class="compat-ok">支持</span>      |
| `Form` / `Embed`                 | 同名布局                         | <span class="compat-ok">支持</span>      |
| `ModalForm` / `DrawerForm`       | 同名布局 + `v-model:open`        | <span class="compat-map">Vue 映射</span> |
| `QueryFilter` / `LightFilter`    | 同名布局                         | <span class="compat-ok">支持</span>      |
| `StepForm` / `StepsForm`         | 同名布局 + `v-model:current`     | <span class="compat-map">Vue 映射</span> |
| `group` / `formList` / `formSet` | 同名 `valueType`                 | <span class="compat-ok">支持</span>      |
| `dependency`                     | `dependencies` + dependency 字段 | <span class="compat-ok">支持</span>      |

`urlSync` 是 Vue 版本提供的扩展能力：`true` 将字段分别写入 query，`{ key: 'filters' }` 将完整模型 JSON 写入一个参数，`{ mode: 'hash' }` 改写 hash；浏览器前进/后退会回填表单。

## 组件 ref 对照

| 组件             | 方法                                                                                                                                            |
| ---------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| ProTable         | `reload`、`reset`、`setPageInfo`、`clearSelected`、`fullScreen`、`scrollTo`、`startEditable`、`saveEditable`、`cancelEditable`、`addEditRecord` |
| EditableProTable | ProTable 方法 + `getRowData`、`getRowsData`、`setRowData`                                                                                       |
| SchemaForm       | `validate`、`reset`、`getFieldsValue`、`setFieldsValue`、`submit`、`open`、`close`、`next`、`prev`                                              |

## 项目发布约定

Changesets 与 GitHub Actions 属于本项目工程约定，不是 React API 的一部分。npm 变更通过 `pnpm changeset` 描述；`main` CI 通过后维护版本 PR，配置 `NPM_TOKEN` 时才发布 npm，并启用 provenance。

## 明确不包含

首版不提供 ProLayout、ProCard、ProList、ProDescriptions，也不依赖特定请求库。网络层只需实现通用 Promise `request` 回调。
