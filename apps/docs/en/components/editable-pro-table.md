<script setup>
import EditableProTableDemo from '../../examples/EditableProTableDemo.vue'
</script>

# EditableProTable

`EditableProTable` reuses the `ProTable` column model, editing state machine, and validation logic for workflows where the whole table is one form field. Search, pagination, table options, and focus revalidation are disabled by default.

<ClientOnly>
  <EditableProTableDemo />
</ClientOnly>

## Controlled data and edit state

`v-model:value` is the only controlled whole-table data entry point; a conflicting `dataSource` prop is not exposed. `defaultValue` supplies uncontrolled initial rows.

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

`editable.type` is `single` or `multiple`. `onSave`, `onCancel`, and `onDelete` may return Promises. Returning `false` from save or delete keeps the current edit/data state. Column-level `editable` can vary by record.

## Validation and lifecycle

Place validation in column `formItemProps.rules`:

```ts
const columns: ProColumns<Member>[] = [
  {
    title: 'Name',
    dataIndex: 'name',
    valueType: 'text',
    formItemProps: {
      rules: [{ required: true, message: 'Enter a name' }],
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

`saveEditable` returns `false` when validation fails. Lifecycle exceptions emit `editable-error`. The component-level `formItemProps` wraps the whole EditableProTable in an Antdv Next FormItem for outer-form integration.

## Record creator

```ts
const recordCreatorProps: RecordCreatorProps<Member> = {
  record: () => ({
    id: crypto.randomUUID(),
    name: '',
  }),
  position: 'bottom',
  parentKey: undefined,
  newRecordType: 'dataSource',
  creatorButtonText: 'Add member',
}
```

| Field               | Description                                                             |
| ------------------- | ----------------------------------------------------------------------- |
| `record`            | Record or factory called for each creation                              |
| `position`          | `top` / `bottom`; defaults to bottom                                    |
| `parentKey`         | Parent for a new tree row                                               |
| `newRecordType`     | `dataSource` writes immediately; `cache` writes after a successful save |
| `creatorButtonText` | Creator button label                                                    |

Every new row must have a unique `rowKey`. `maxLength` counts the flattened tree, hides the button at the limit, and is also enforced by ref-based `addEditRecord`.

## Main props

| Prop                                        | Type                                    | Description                                     |
| ------------------------------------------- | --------------------------------------- | ----------------------------------------------- |
| `columns`                                   | `ProColumns<T>[]`                       | Shared ProTable column model                    |
| `value` / `defaultValue`                    | `T[]`                                   | Controlled value and uncontrolled initial value |
| `editableKeys`                              | `ProKey[]`                              | Current editing keys; supports two-way binding  |
| `editable`                                  | `false \| EditableConfig<T>`            | Editing mode and lifecycle                      |
| `recordCreatorProps`                        | `false \| RecordCreatorProps<T>`        | Creator configuration                           |
| `maxLength`                                 | `number`                                | Maximum row count                               |
| `formItemProps`                             | `Record<string, unknown>`               | Outer Antdv Next FormItem props                 |
| `onValuesChange`                            | `(values, changedRecord) => void`       | Whole-table change callback                     |
| `onTableChange`                             | `(pagination, filters, sorter) => void` | Table-state callback                            |
| `request` / `params` / `postData`           | Same as ProTable                        | Optional remote initialization/refresh          |
| `toolbar` / `rowSelection` / `columnsState` | Same as ProTable                        | Opt into related capabilities                   |
| `polling` / `manualRequest`                 | Same as ProTable                        | Remote request controls                         |
| `scroll` / `size` / `bordered`              | Same as ProTable                        | Table presentation                              |

## Callback props and Vue events

`onValuesChange` / `onTableChange` props and `@values-change` / `@table-change` are two syntaxes for the same Vue listener channel. Choose one syntax; every change is dispatched exactly once, so do not bind the same handler through both forms:

| Event                  | Arguments                     | Description                    |
| ---------------------- | ----------------------------- | ------------------------------ |
| `update:value`         | `rows`                        | `v-model:value` update         |
| `update:editable-keys` | `keys`                        | `v-model:editable-keys` update |
| `values-change`        | `rows, changedRecord`         | Any row mutation               |
| `table-change`         | `pagination, filters, sorter` | Table-state change             |
| `request-error`        | `error`                       | Remote request failure         |
| `editable-error`       | `error`                       | Editing lifecycle failure      |

## Slots

EditableProTable forwards every slot to its inner ProTable:

- `toolbar-title` and `toolbar-actions`.
- `header-${columnKey}`.
- `cell-${columnKey}` or `${columnKey}` with `{ value, record, index, column, editable }`.
- Other slots supported by the underlying Antdv Next Table.

## Component ref

`EditableProTableInstance<T>` includes all ProTable methods and adds whole-table access:

```ts
const editableRef = ref<EditableProTableInstance<Member>>()

editableRef.value?.startEditable(memberId)
const first = editableRef.value?.getRowData(0)
const all = editableRef.value?.getRowsData()
editableRef.value?.setRowData(memberId, { allocation: 100 })
```

| Method                          | Description                                                                     |
| ------------------------------- | ------------------------------------------------------------------------------- |
| `getRowData(indexOrKey)`        | Numeric input resolves an exact row key first, then a top-level index           |
| `getRowsData()`                 | Read a copy of all current rows                                                 |
| `setRowData(indexOrKey, value)` | Resolve with the same key/index rule, shallow-merge, and update `v-model:value` |

Inherited methods are `reload`, `reset`, `setPageInfo`, `clearSelected`, `fullScreen`, `scrollTo`, `startEditable`, `saveEditable`, `cancelEditable`, and `addEditRecord`.
