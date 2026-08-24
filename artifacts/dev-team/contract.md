# antv-next-pro 公共契约

状态：已确认。此文档固化用户计划中的公共 API，组件实现与测试以此为单一真相源。

## 包入口

- 默认导出：Vue 插件 `AntdvNextPro`。
- 组件导出：`ProTable`、`EditableProTable`、`SchemaForm`。
- 布局别名：`Form`、`Embed`、`ModalForm`、`DrawerForm`、`QueryFilter`、`LightFilter`、`StepForm`、`StepsForm`。
- 类型导出：`ProColumns<T>`、三类 Props/Instance、请求、编辑、分页、筛选、排序及 Schema 类型。
- 样式入口：`antdv-next-pro/style.css`。

## ProTable

请求契约：

```ts
request(params, sort, filter): Promise<{
  data: T[]
  total?: number
  success?: boolean
}>
```

- 数据入口：本地 `dataSource` / `v-model:data-source` 或远程 `request`。
- 请求触发：搜索、分页、排序、筛选、外部 `params`、轮询、窗口聚焦和 `reload`；仅最后一次请求可提交结果。
- 编辑控制：`editable` 与 `v-model:editable-keys`；支持单/多行、异步保存/删除/校验、取消、创建和树形 `parentKey`。
- ref：`reload`、`reset`、`setPageInfo`、`clearSelected`、`fullScreen`、`scrollTo`、`startEditable`、`saveEditable`、`cancelEditable`、`addEditRecord`。

## EditableProTable

- 唯一完整数据控制入口为 `v-model:value`，可用 `defaultValue` 初始化。
- 默认关闭搜索、分页、工具选项和聚焦刷新。
- 支持 `editable`、`recordCreatorProps`、`maxLength`、值变化与表格变化回调/事件。
- `recordCreatorProps` 支持 `record`、`position`、`parentKey`、`creatorButtonText`、`newRecordType`，新记录 row key 必须唯一。
- ref 在 ProTable 编辑方法基础上增加 `getRowData`、`getRowsData`、`setRowData`；`setRowData` 浅合并记录。

## SchemaForm

- Schema 唯一入口为 `columns`；通过 `v-model` 控制字段值。
- `convertValue` 仅用于进入表单的数据，`transform` 仅用于提交输出。
- 支持 `initialValues`、`request(params)`、异步字段选项、校验、动态字段、URL query/hash 同步。
- 布局：Form、Embed、ModalForm、DrawerForm、QueryFilter、LightFilter、StepForm、StepsForm。
- 组合字段：group、formList、formSet、divider、dependency。
- 弹层与步骤状态通过事件和 `v-model:open` / `v-model:current` 表达。
- ref：`validate`、`reset`、`getFieldsValue`、`setFieldsValue`、`submit`、`open`、`close`、`next`、`prev`。

## 工程契约

- Node.js 24，pnpm 11，Vue 3.5，`antdv-next@^1.5.2`。
- `vue` 与 `antdv-next` 是 peer dependency 且打包外置。
- 所有 Vite+ 子工具配置位于对应 `vite.config.ts`，不创建独立 Oxlint/Oxfmt/Vitest/tsdown 配置。
- 发布包初始版本 `0.0.0`，初始 minor changeset 产生首个 `0.1.0` 发布。
