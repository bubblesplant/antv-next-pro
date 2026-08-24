import type { Plugin } from 'vue'

import AntdvNextPro, {
  AntdvNextPro as NamedPlugin,
  EditableProTable,
  Form,
  ModalForm,
  ProTable,
  QueryFilter,
  SchemaForm,
  type EditableAction,
  type EditableProTableInstance,
  type EditableProTableProps,
  type ProColumns,
  type ProTableInstance,
  type ProTableProps,
  type SchemaFormColumn,
  type SchemaFormInstance,
  type SchemaFormProps,
  type SchemaFormSlots,
} from 'antdv-next-pro'

interface UserRow extends Record<string, unknown> {
  id: number
  name: string
  enabled: boolean
}

interface UserQuery extends Record<string, unknown> {
  keyword: string
}

const columns: ProColumns<UserRow>[] = [
  {
    dataIndex: 'name',
    title: 'Name',
    search: true,
    renderFormItem: (_column, context) => {
      context.update('Grace')
      return null
    },
  },
  { dataIndex: 'enabled', title: 'Enabled', valueType: 'switch' },
]

const schemaColumns: SchemaFormColumn<UserRow>[] = [
  {
    title: 'Account',
    valueType: 'group',
    columns: [
      {
        dataIndex: 'name',
        component: () => null,
        colProps: { span: 12 },
        tooltip: 'Public display name',
        extra: 'Shown on the profile',
      },
      {
        valueType: 'dependency',
        dependencies: ['enabled'],
        renderFormItem: (_column, context) => {
          const dependencies: unknown[] | undefined = context.dependencies
          void dependencies
          return null
        },
      },
    ],
  },
]

const tableProps = {
  columns,
  params: { keyword: 'Ada' },
  request: async (params, sort, filter) => {
    const keyword: string = params.keyword
    const order = sort.name
    const acceptedIds = filter.id
    void [keyword, order, acceptedIds]
    return {
      data: [{ id: 1, name: 'Ada', enabled: true }],
      success: true,
      total: 1,
    }
  },
} satisfies ProTableProps<UserRow, UserQuery>

const editableProps = {
  columns,
  params: { keyword: '' },
  value: [{ id: 1, name: 'Ada', enabled: true }],
  recordCreatorProps: {
    record: () => ({ id: 2, name: 'Grace', enabled: false }),
  },
  editable: {
    actionRender: (_record, actions) => {
      const editing: boolean = actions.editing
      const started: boolean = actions.start()
      void [editing, started, actions.record, actions.save, actions.cancel, actions.remove]
      return null
    },
  },
  onValuesChange: (values, changedRecord) => void [values, changedRecord],
  onTableChange: (pagination, filters, sorter) => void [pagination, filters, sorter],
} satisfies EditableProTableProps<UserRow, UserQuery>

const editableAction: EditableAction<UserRow> = {
  start: () => true,
  save: async () => true,
  cancel: () => undefined,
  remove: async () => true,
  record: { id: 1, name: 'Ada', enabled: true },
  editing: false,
}

const schemaFormProps = {
  columns: schemaColumns,
  modelValue: { id: 1, name: 'Ada' },
} satisfies SchemaFormProps<UserRow>

const schemaFormSlots = {
  'field-name': ({ value, record, column, dependencies, update }) => {
    void [value, record.name, column.dataIndex, dependencies]
    update('Grace')
    return null
  },
  name: ({ value, record, column, dependencies, update }) => {
    void [value, record, column, dependencies, update]
    return null
  },
  'step-title': ({ title, index, current, step, steps, values }) => {
    void [index, current, step.columns, steps.length, values.name]
    return title
  },
  'step-content': ({ current, step, steps, columns, values, content }) => {
    void [current, step.title, steps.length, columns.length, values.name]
    return content()
  },
  'step-actions': ({
    current,
    step,
    steps,
    values,
    hasPrevious,
    hasNext,
    submitting,
    next,
    prev,
    submit,
    reset,
  }) => {
    void [current, step, steps, values, hasPrevious, hasNext, submitting]
    void [next, prev, submit, reset]
    return null
  },
} satisfies SchemaFormSlots<UserRow>

const tableVNode = ProTable<UserRow, UserQuery>(tableProps)
const editableVNode = EditableProTable<UserRow, UserQuery>(editableProps)
const schemaFormVNode = SchemaForm<UserRow>(schemaFormProps)
const formVNode = Form<UserRow>(schemaFormProps)
const modalFormVNode = ModalForm<UserRow>({
  ...schemaFormProps,
  open: false,
  'onUpdate:open': (open: boolean) => void open,
})
const queryFilterVNode = QueryFilter<UserRow>(schemaFormProps)

declare const table: ProTableInstance<UserRow>
declare const editableTable: EditableProTableInstance<UserRow>
declare const schemaForm: SchemaFormInstance<UserRow>

table.addEditRecord({ id: 3, name: 'Lin', enabled: true })
editableTable.setRowData(1, { enabled: false })
schemaForm.setFieldsValue({ name: 'Grace' })

const plugins: Plugin[] = [AntdvNextPro, NamedPlugin]
void [
  plugins,
  tableVNode,
  editableVNode,
  schemaFormVNode,
  formVNode,
  modalFormVNode,
  queryFilterVNode,
  schemaFormSlots,
  editableAction,
]
