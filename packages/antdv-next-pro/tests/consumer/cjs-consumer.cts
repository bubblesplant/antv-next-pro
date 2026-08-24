import packageExports = require('antdv-next-pro')
import type {
  EditableAction,
  EditableProTableProps,
  ProColumns,
  ProTableProps,
  SchemaFormColumn,
  SchemaFormProps,
} from 'antdv-next-pro'
import type { Plugin } from 'vue'

interface CjsRow extends Record<string, unknown> {
  key: string
  count: number
}

interface CjsQuery extends Record<string, unknown> {
  scope: string
}

const columns: ProColumns<CjsRow>[] = [
  { dataIndex: 'key', title: 'Key' },
  {
    dataIndex: 'count',
    title: 'Count',
    valueType: 'digit',
    renderFormItem: (_column, context) => {
      context.update(2)
      return null
    },
  },
]

const schemaColumns: SchemaFormColumn<CjsRow>[] = [
  {
    valueType: 'formList',
    dataIndex: 'rows',
    columns: [
      {
        dataIndex: 'count',
        component: () => null,
        colProps: { span: 8 },
        tooltip: 'Count',
        extra: 'Nested schema field',
      },
    ],
  },
]

const tableProps: ProTableProps<CjsRow, CjsQuery> = {
  columns,
  params: { scope: 'all' },
  request: async ({ scope }) => ({
    data: [{ key: scope, count: 1 }],
    total: 1,
  }),
}

const editableProps: EditableProTableProps<CjsRow, CjsQuery> = {
  columns,
  value: [{ key: 'first', count: 1 }],
  rowKey: 'key',
  editable: {
    actionRender: (_record, actions) => {
      void [actions.start(), actions.editing, actions.record]
      return null
    },
  },
}

const editableAction: EditableAction<CjsRow> = {
  start: () => true,
  save: async () => true,
  cancel: () => undefined,
  remove: async () => true,
  record: { key: 'first', count: 1 },
  editing: false,
}

const schemaProps: SchemaFormProps<CjsRow> = {
  columns: schemaColumns,
  modelValue: { key: 'first', count: 1 },
}

const tableVNode = packageExports.ProTable<CjsRow, CjsQuery>(tableProps)
const editableVNode = packageExports.EditableProTable<CjsRow, CjsQuery>(editableProps)
const schemaVNode = packageExports.SchemaForm<CjsRow>(schemaProps)
const drawerVNode = packageExports.DrawerForm<CjsRow>({
  ...schemaProps,
  open: true,
  'onUpdate:open': (open: boolean) => void open,
})
const plugin: Plugin = packageExports.default

void [plugin, tableVNode, editableVNode, schemaVNode, drawerVNode, editableAction]
