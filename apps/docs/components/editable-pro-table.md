<script setup>
import EditableProTableDemo from '../examples/EditableProTableDemo.vue'
</script>

# EditableProTable

`EditableProTable` 复用 `ProTable` 的列模型、编辑状态机和校验逻辑，面向“整张表就是一个表单字段”的场景。它默认关闭搜索、分页、工具选项和窗口聚焦刷新。

<ClientOnly>
  <EditableProTableDemo />
</ClientOnly>

## 受控数据与编辑状态

`v-model:value` 是完整数据的唯一受控入口，不再提供语义冲突的 `dataSource`。`defaultValue` 可提供非受控初始值。

```vue
<EditableProTable
  v-model:value="members"
  v-model:editable-keys="editableKeys"
  :columns="columns"
  :editable="{ type: 'multiple', onSave, onDelete }"
  :record-creator-props="recordCreatorProps"
  row-key="id"
/>
```

`editable.type` 可设为 `single` 或 `multiple`。`onSave`、`onCancel`、`onDelete` 支持 Promise；保存或删除返回 `false` 时保持当前编辑/数据状态。列级 `editable` 可根据记录决定是否允许编辑。

## 校验与生命周期

校验规则放在列的 `formItemProps.rules`：

```ts
const columns: ProColumns<Member>[] = [
  {
    title: '姓名',
    dataIndex: 'name',
    valueType: 'text',
    formItemProps: {
      rules: [{ required: true, message: '请输入姓名' }],
    },
  },
]

const editable: EditableConfig<Member> = {
  type: 'multiple',
  async onSave(key, record, origin) {
    await api.save(record)
  },
  async onDelete(key, record) {
    await api.remove(record.id)
    return true
  },
}
```

校验不通过时 `saveEditable` 返回 `false`；生命周期抛错会触发 `editable-error`。`formItemProps` Prop 则用于将整个 EditableProTable 包装为一个 Antdv Next FormItem，方便嵌入外层表单。

## 新建记录

```ts
const recordCreatorProps: RecordCreatorProps<Member> = {
  record: () => ({
    id: crypto.randomUUID(),
    name: '',
  }),
  position: 'bottom',
  parentKey: undefined,
  newRecordType: 'dataSource',
  creatorButtonText: '添加成员',
}
```

| 字段                | 说明                                              |
| ------------------- | ------------------------------------------------- |
| `record`            | 记录对象或每次创建时执行的工厂函数                |
| `position`          | `top` / `bottom`，默认底部                        |
| `parentKey`         | 树形数据的新记录父节点                            |
| `newRecordType`     | `dataSource` 立即写入模型；`cache` 保存成功后写入 |
| `creatorButtonText` | 创建按钮文本                                      |

每条新记录必须产生唯一 `rowKey`。`maxLength` 按展开后的树形记录总数计算；达到上限后隐藏创建按钮，通过 ref 调用 `addEditRecord` 时也会遵守该限制。

## 主要 Props

| Prop                                        | 类型                                    | 说明                          |
| ------------------------------------------- | --------------------------------------- | ----------------------------- |
| `columns`                                   | `ProColumns<T>[]`                       | 与 ProTable 共用的列模型      |
| `value` / `defaultValue`                    | `T[]`                                   | 受控值与非受控初始值          |
| `editableKeys`                              | `ProKey[]`                              | 当前编辑行，支持双向绑定      |
| `editable`                                  | `false \| EditableConfig<T>`            | 编辑模式和生命周期            |
| `recordCreatorProps`                        | `false \| RecordCreatorProps<T>`        | 创建行配置                    |
| `maxLength`                                 | `number`                                | 最大记录数                    |
| `formItemProps`                             | `Record<string, unknown>`               | 外层 Antdv Next FormItem 配置 |
| `onValuesChange`                            | `(values, changedRecord) => void`       | 完整数据变化回调              |
| `onTableChange`                             | `(pagination, filters, sorter) => void` | 表格状态回调                  |
| `request` / `params` / `postData`           | 与 ProTable 相同                        | 可选远程初始化/刷新           |
| `toolbar` / `rowSelection` / `columnsState` | 与 ProTable 相同                        | 可按需重新启用相关能力        |
| `polling` / `manualRequest`                 | 与 ProTable 相同                        | 远程请求控制                  |
| `scroll` / `size` / `bordered`              | 与 ProTable 相同                        | 表格外观                      |

## Props 回调与 Vue 事件

`onValuesChange` / `onTableChange` Props 与 `@values-change` / `@table-change` 是同一条 Vue 监听通道的两种写法，请任选一种。每次变化只派发一次，不要为同一个处理函数同时写两种语法：

| 事件                   | 参数                          | 说明                         |
| ---------------------- | ----------------------------- | ---------------------------- |
| `update:value`         | `rows`                        | `v-model:value` 更新         |
| `update:editable-keys` | `keys`                        | `v-model:editable-keys` 更新 |
| `values-change`        | `rows, changedRecord`         | 任一记录变化                 |
| `table-change`         | `pagination, filters, sorter` | 表格状态变化                 |
| `request-error`        | `error`                       | 远程请求失败                 |
| `editable-error`       | `error`                       | 编辑生命周期失败             |

## 插槽

EditableProTable 会将插槽全部转发给内部 ProTable，因此可以使用：

- `toolbar-title`、`toolbar-actions`。
- `header-${columnKey}`。
- `cell-${columnKey}` 或 `${columnKey}`，参数为 `{ value, record, index, column, editable }`。
- 底层 Antdv Next Table 的其他插槽。

## 组件 ref

`EditableProTableInstance<T>` 包含 ProTable 的全部实例方法，并额外提供整表读写：

```ts
const editableRef = ref<EditableProTableInstance<Member>>()

editableRef.value?.startEditable(memberId)
const first = editableRef.value?.getRowData(0)
const all = editableRef.value?.getRowsData()
editableRef.value?.setRowData(memberId, { allocation: 100 })
```

| 方法                            | 说明                                                    |
| ------------------------------- | ------------------------------------------------------- |
| `getRowData(indexOrKey)`        | 数字先按精确 rowKey 查找，再回退为顶层索引              |
| `getRowsData()`                 | 读取当前完整数据副本                                    |
| `setRowData(indexOrKey, value)` | 按同样的 key/索引规则查找，浅合并后更新 `v-model:value` |

继承的方法包括 `reload`、`reset`、`setPageInfo`、`clearSelected`、`fullScreen`、`scrollTo`、`startEditable`、`saveEditable`、`cancelEditable` 与 `addEditRecord`。
