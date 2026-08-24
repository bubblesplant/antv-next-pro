<script setup>
import ProTableDemo from '../examples/ProTableDemo.vue'
</script>

# ProTable

`ProTable` 面向查询和浏览场景，统一管理本地/远程数据、搜索、分页、排序、筛选、列状态、选择和行编辑。

<ClientOnly>
  <ProTableDemo />
</ClientOnly>

## 数据模式

本地模式传入 `dataSource` 或 `defaultDataSource`。搜索、排序、筛选和分页会直接作用于本地数据：

```vue
<ProTable
  v-model:data-source="rows"
  :columns="columns"
  row-key="id"
  :pagination="{ defaultPageSize: 20 }"
/>
```

远程模式使用固定请求契约：

```ts
import type { ProRequest } from 'antdv-next-pro'

const request: ProRequest<User, Query> = async (params, sort, filter) => {
  const result = await api.list({ ...params, sort, filter })
  return {
    data: result.items,
    total: result.total,
    success: true,
  }
}
```

搜索、分页、排序、筛选和外部 `params` 变化都会进入同一请求。并发请求只接纳最后发起的结果；请求抛错时保留当前数据、结束 loading，并触发 `request-error`。返回 `success: false` 的结果不会覆盖数据。

`manualRequest` 可阻止首次自动请求，之后通过组件 ref 的 `reload()` 发起。`postData` 在展示前同步转换成功数据。

## 搜索区与折叠

`search: false` 关闭查询区。默认情况下，包含 `dataIndex` 且没有 `hideInSearch` / `search: false` 的列会生成搜索项；`search.transform` 可将一个字段转换为多个请求参数。

```ts
const columns = [
  {
    title: '最低分',
    dataIndex: 'score',
    valueType: 'digit',
    search: {
      transform: (value) => ({ minScore: value }),
    },
  },
]
```

非受控折叠只需设置初始值：

```vue
<ProTable :search="{ defaultCollapsed: true, span: 8, labelWidth: 'auto' }" />
```

受控折叠使用 `collapsed` 和 `search-collapse`：

```vue
<ProTable
  :search="{ collapsed, span: 8, searchText: '筛选', resetText: '清空' }"
  @search-collapse="collapsed = $event"
/>
```

`span` 默认是 `8`，即 24 栅格下一行 3 项；折叠时仅保留首行。也可通过 `search.onCollapse(next)` 接收状态变化。

## 主要 Props

| Prop                           | 类型                                      | 说明                                     |
| ------------------------------ | ----------------------------------------- | ---------------------------------------- |
| `columns`                      | `ProColumns<T>[]`                         | 表格、搜索和编辑的统一列描述             |
| `dataSource`                   | `T[]`                                     | 受控本地数据，支持 `v-model:data-source` |
| `defaultDataSource`            | `T[]`                                     | 非受控初始数据                           |
| `request`                      | `ProRequest<T, P>`                        | 远程 Promise 请求                        |
| `params`                       | `P`                                       | 额外请求参数，变化时回到第一页并重载     |
| `postData`                     | `(data: T[]) => T[]`                      | 展示前同步转换                           |
| `rowKey`                       | `keyof T \| string \| (record) => ProKey` | 行唯一标识，默认 `id`                    |
| `loading`                      | `boolean`                                 | 叠加外部 loading                         |
| `search`                       | `false \| ProTableSearchConfig`           | 搜索区和折叠配置                         |
| `pagination`                   | `false \| ProTablePagination`             | 分页、页大小和选项                       |
| `options`                      | `false \| ProTableOptions`                | 密度、全屏、刷新和列设置                 |
| `toolbar`                      | `false \| { title?, actions? }`           | 工具栏内容，也可使用插槽                 |
| `rowSelection`                 | `false \| Record<string, unknown>`        | Antdv Next 行选择配置                    |
| `columnsState`                 | `ProColumnsStateConfig`                   | 列显隐、顺序、固定和持久化配置           |
| `editable`                     | `false \| EditableConfig<T>`              | 单行/多行编辑与生命周期                  |
| `editableKeys`                 | `ProKey[]`                                | 编辑行 key，支持 `v-model:editable-keys` |
| `polling`                      | `number`                                  | 轮询间隔（毫秒），页面隐藏时暂停         |
| `revalidateOnFocus`            | `boolean`                                 | 窗口重新聚焦时请求                       |
| `manualRequest`                | `boolean`                                 | 不执行首次自动请求                       |
| `scroll` / `size` / `bordered` | Antdv Next 对应值                         | 滚动、密度和边框                         |

## 列状态与列设置

工具栏中的内建列设置面板只提供列显隐开关。列顺序和固定位置由 `columnsState` 中每个列 key（优先使用列 `key`，否则使用 `dataIndex`）对应的 `order`、`fixed` 编程控制：

```ts
const columnsState = ref<Record<string, ProColumnsState>>({
  name: { show: true, order: 10, fixed: 'left' },
  status: { show: true, order: 20 },
  actions: { show: true, order: 30, fixed: 'right' },
})

const tableColumnsState = computed<ProColumnsStateConfig>(() => ({
  value: columnsState.value,
  onChange: (next) => {
    columnsState.value = next
  },
  persistenceKey: 'users-table-columns',
  persistenceType: 'localStorage',
}))
```

```vue
<ProTable :columns-state="tableColumnsState" />
```

完全受控时将 `value` 与 `onChange` 配对；非受控初值使用 `defaultValue`。设置 `persistenceKey` 后，状态可写入 `localStorage` 或 `sessionStorage`，包括面板产生的 `show` 变化以及编程设置的 `order`、`fixed`。

## ProTable 内建编辑

`ProTable` 自身即可使用与 `EditableProTable` 相同的编辑状态机：

```vue
<ProTable
  v-model:data-source="rows"
  v-model:editable-keys="editableKeys"
  :columns="columns"
  :editable="{
    type: 'multiple',
    onSave: saveRow,
    onCancel: cancelRow,
    onDelete: deleteRow,
  }"
/>
```

列上的 `editable` 可按记录控制；`formItemProps.rules` 提供异步或同步校验；`renderFormItem(column, context)` 可自定义编辑器，并通过 `context.update(nextValue)` 写入共享编辑状态、触发 EditableProTable 的实时 `v-model:value`。没有 `valueType: 'option'` 列时，组件会自动补充操作列。

`editable.actionRender(record, actions)` 可完全替换默认操作区。`actions.editing` 表示当前行状态；未编辑时调用 `actions.start()`，编辑中可使用 `save()`、`cancel()` 和 `remove()`。

`addEditRecord(record, { position, parentKey, newRecordType })` 支持顶部/底部创建、树形 `parentKey` 以及 cache/dataSource 两种新记录策略。新记录必须具有唯一 `rowKey`。

## 命名插槽

列 key 取 `column.key`，否则取点连接后的 `dataIndex`。

```vue
<ProTable :columns="columns">
  <template #toolbar-title>项目列表</template>
  <template #toolbar-actions>
    <button @click="tableRef?.reload()">同步</button>
  </template>
  <template #header-name="{ column }">
    {{ column.title }} · 自定义表头
  </template>
  <template #cell-name="{ value, record, editable }">
    <strong>{{ value }}</strong>
    <small v-if="editable">编辑中</small>
  </template>
</ProTable>
```

- `header-${columnKey}`：参数为 `{ column }`。
- `cell-${columnKey}` 或直接 `${columnKey}`：参数为 `{ value, record, index, column, editable }`。
- 其他插槽继续透传给底层 Antdv Next Table。

单元格插槽优先于默认只读展示和编辑器；需要行内编辑的列通常只自定义表头，或在插槽中自行处理编辑态。

## 双向绑定与事件

| 事件                   | 参数                          | 说明                         |
| ---------------------- | ----------------------------- | ---------------------------- |
| `update:data-source`   | `rows`                        | `v-model:data-source` 更新   |
| `update:editable-keys` | `keys`                        | `v-model:editable-keys` 更新 |
| `data-source-change`   | `rows, changedRecord?`        | 编辑、新增或删除导致数据变化 |
| `request-error`        | `error`                       | 远程请求失败                 |
| `editable-error`       | `error`                       | 保存/删除生命周期抛错        |
| `validation-error`     | `key, errors`                 | 行编辑校验失败               |
| `search-collapse`      | `collapsed`                   | 搜索区折叠状态变化           |
| `change`               | `pagination, filters, sorter` | 分页、筛选或排序变化         |
| `selection-change`     | `keys, rows`                  | 行选择变化                   |
| `load`                 | `rows, total`                 | 成功接纳远程结果             |

## 组件 ref

```ts
import type { ProTableInstance } from 'antdv-next-pro'

const tableRef = ref<ProTableInstance<User>>()

await tableRef.value?.reload(true)
tableRef.value?.setPageInfo({ current: 2, pageSize: 50 })
tableRef.value?.clearSelected()
tableRef.value?.startEditable(userId)
await tableRef.value?.saveEditable(userId)
```

| 方法                              | 说明                                                              |
| --------------------------------- | ----------------------------------------------------------------- |
| `reload(resetPageIndex?)`         | 重新请求，可选回到第一页                                          |
| `reset()`                         | 清空搜索/排序/筛选并恢复初始分页                                  |
| `setPageInfo(page)`               | 更新当前页或页大小                                                |
| `clearSelected()`                 | 清空行选择                                                        |
| `fullScreen()`                    | 进入/退出全屏                                                     |
| `scrollTo(target)`                | `{ key }` 滚动到 rowKey，`{ top }` 按像素滚动；字符串直接视为 key |
| `startEditable(key)`              | 开始编辑                                                          |
| `saveEditable(key)`               | 校验并保存，返回是否成功                                          |
| `cancelEditable(key)`             | 取消并恢复原记录                                                  |
| `addEditRecord(record, options?)` | 创建并进入编辑态                                                  |
