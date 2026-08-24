# antdv-next-pro

Vue 3 ProTable, EditableProTable, and SchemaForm powered by Antdv Next.

The API follows the major workflows of `@ant-design/pro-components@2.8.10`, expressed through idiomatic Vue `v-model`, events, slots, and component refs.

## Install

```bash
pnpm add antdv-next-pro antdv-next vue
```

```ts
import AntdvNextPro from 'antdv-next-pro'
import 'antdv-next-pro/style.css'

app.use(AntdvNextPro)
```

Named imports are available:

```ts
import {
  EditableProTable,
  ProTable,
  SchemaForm,
  type EditableProTableInstance,
  type ProColumns,
  type ProTableInstance,
  type SchemaFormColumn,
  type SchemaFormInstance,
} from 'antdv-next-pro'
```

## ProTable

```vue
<ProTable
  ref="tableRef"
  v-model:editable-keys="editableKeys"
  :columns="columns"
  :request="request"
  row-key="id"
/>
```

The request contract is independent of your HTTP client:

```ts
request(params, sort, filter): Promise<{
  data: T[]
  total?: number
  success?: boolean
}>
```

ProTable coordinates search, pagination, sorting, filters, selection, column persistence, polling, focus revalidation, and optional row editing.

## EditableProTable

```vue
<EditableProTable
  v-model:value="rows"
  v-model:editable-keys="editableKeys"
  :columns="columns"
  :editable="{ type: 'multiple', onSave, onDelete }"
  :record-creator-props="{
    record: () => ({ id: crypto.randomUUID(), name: '' }),
    newRecordType: 'dataSource',
  }"
  row-key="id"
/>
```

EditableProTable treats the complete table as a controlled value. It supports cached or immediate row creation, maximum row counts, tree parent keys, and async edit callbacks.

## SchemaForm

```vue
<SchemaForm ref="formRef" v-model="form" :columns="columns" @finish="save" />
```

Available layouts are `Form`, `Embed`, `ModalForm`, `DrawerForm`, `QueryFilter`, `LightFilter`, `StepForm`, and `StepsForm`. Composition value types include `group`, `formList`, `formSet`, `divider`, and `dependency`.

`convertValue` transforms inbound values; `transform` shapes submitted values.

## 中文简介

`antdv-next-pro` 为 Vue 3 + Antdv Next 提供高阶表格和 Schema 表单。三个组件共享 `columns` 字段模型，支持通用 Promise 请求、受控双向绑定、异步编辑以及普通/查询/弹层/步骤表单。

- [完整中文文档](https://bubblesplant.github.io/antv-next-pro/)
- [English documentation](https://bubblesplant.github.io/antv-next-pro/en/)
- [GitHub](https://github.com/bubblesplant/antv-next-pro)

## License

MIT
