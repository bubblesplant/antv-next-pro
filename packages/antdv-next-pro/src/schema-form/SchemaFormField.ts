import {
  Button,
  Checkbox,
  CheckboxGroup,
  Col,
  DatePicker,
  DateRangePicker,
  Divider,
  FormItem,
  Input,
  InputPassword,
  InputNumber,
  RadioGroup,
  Row,
  Select,
  Switch,
  TextArea,
  TimePicker,
} from 'antdv-next'
import { defineComponent, h, ref, watch, type Component, type PropType, type VNodeChild } from 'vue'

import type { ProColumns, SchemaFormColumn, SchemaFormLayoutType } from '../types'
import { cloneValue, getValue, normalizePath, type FormRecord } from './utils'

type SchemaSlots = Record<string, ((props: Record<string, unknown>) => VNodeChild) | undefined>

interface SelectOption {
  label: unknown
  value: unknown
  disabled?: boolean
}

const AFormItem = FormItem as Component
const AInput = Input as Component
const ATextArea = TextArea as Component
const AInputPassword = InputPassword as Component
const AInputNumber = InputNumber as Component
const ASelect = Select as Component
const ARadioGroup = RadioGroup as Component
const ACheckbox = Checkbox as Component
const ACheckboxGroup = CheckboxGroup as Component
const ASwitch = Switch as Component
const ADatePicker = DatePicker as Component
const ADateRangePicker = DateRangePicker as Component
const ATimePicker = TimePicker as Component

export const SchemaFormField = defineComponent({
  name: 'AntdvNextProSchemaFormField',
  props: {
    column: {
      type: Object as PropType<SchemaFormColumn<FormRecord>>,
      required: true,
    },
    model: {
      type: Object as PropType<FormRecord>,
      required: true,
    },
    prefix: {
      type: Array as PropType<Array<string | number>>,
      default: () => [],
    },
    readonly: Boolean,
    grid: Boolean,
    layoutType: {
      type: String as PropType<SchemaFormLayoutType>,
      default: 'Form',
    },
    schemaSlots: {
      type: Object as PropType<SchemaSlots>,
      default: () => ({}),
    },
    onValueChange: {
      type: Function as PropType<(path: Array<string | number>, value: unknown) => void>,
      required: true,
    },
  },
  setup(props) {
    const remoteOptions = ref<SelectOption[]>([])
    const optionLoading = ref(false)
    let requestSequence = 0

    const loadOptions = async () => {
      if (!props.column.request) {
        remoteOptions.value = []
        return
      }

      const sequence = ++requestSequence
      optionLoading.value = true
      try {
        const records = await props.column.request(props.column.params)
        if (sequence !== requestSequence) return
        remoteOptions.value = records.map(normalizeRemoteOption)
      } catch {
        if (sequence === requestSequence) remoteOptions.value = []
      } finally {
        if (sequence === requestSequence) optionLoading.value = false
      }
    }

    watch(
      () => [props.column.request, stableParams(props.column.params)],
      () => void loadOptions(),
      { immediate: true },
    )

    return () => {
      const column = props.column
      if (isHidden(column, props.layoutType)) return null

      const path = [...props.prefix, ...normalizePath(column.dataIndex)]
      const dependencyValues = column.dependencies?.map((dependency) =>
        getValue(props.model, normalizePath(dependency)),
      )
      const update = (next: unknown) => props.onValueChange(path, next)
      const context = {
        record: props.model,
        index: 0,
        column: column as ProColumns<FormRecord>,
        editable: !props.readonly && !column.readonly,
        dependencies: dependencyValues,
        update,
      }

      if (column.valueType === 'divider') {
        return h(Divider, {}, { default: () => resolveTitle(column) })
      }

      if (column.valueType === 'formList') {
        return renderFormList(column, path, props)
      }

      if (
        column.valueType === 'group' ||
        column.valueType === 'formSet' ||
        column.valueType === 'dependency'
      ) {
        const custom = column.renderFormItem?.(column, context)
        if (custom !== undefined && custom !== null)
          return h('div', { class: 'antdv-next-pro-dependency' }, [custom])
        return renderColumnGroup(column, props)
      }

      if (
        column.valueType === 'option' ||
        column.valueType === 'index' ||
        column.valueType === 'indexBorder' ||
        path.length === 0
      ) {
        return null
      }

      const value = getValue(props.model, path)
      const fieldName = path.join('.')
      const slot =
        props.schemaSlots[`field-${fieldName}`] ??
        props.schemaSlots[fieldName] ??
        props.schemaSlots[String(column.key ?? '')]
      const custom = slot?.({
        value,
        record: props.model,
        column,
        dependencies: dependencyValues,
        update,
      })
      const renderedByColumn = column.renderFormItem?.(column, context)
      const control =
        custom ??
        renderedByColumn ??
        renderControl(
          column,
          value,
          update,
          props.model,
          remoteOptions.value,
          optionLoading.value,
          props.readonly,
        )
      const formItemProps = resolveObjectProps(column.formItemProps, props.model)
      const labelSlot = props.schemaSlots[`label-${fieldName}`]
      const label = labelSlot?.({ column, record: props.model }) ?? resolveTitle(column)
      const formItem = h(
        AFormItem,
        {
          ...formItemProps,
          name: path,
          label,
          tooltip: column.tooltip,
          extra: column.extra,
        },
        { default: () => control },
      )

      return wrapGrid(formItem, column, props.grid)
    }
  },
})

function renderColumnGroup(
  column: SchemaFormColumn<FormRecord>,
  props: {
    model: FormRecord
    prefix: Array<string | number>
    readonly: boolean
    grid: boolean
    layoutType: SchemaFormLayoutType
    schemaSlots: SchemaSlots
    onValueChange: (path: Array<string | number>, value: unknown) => void
  },
): VNodeChild {
  const children = (column.columns ?? []).map((child, index) =>
    h(SchemaFormField, {
      key: childKey(child, index),
      column: child,
      model: props.model,
      prefix: props.prefix,
      readonly: props.readonly,
      grid: props.grid,
      layoutType: props.layoutType,
      schemaSlots: props.schemaSlots,
      onValueChange: props.onValueChange,
    }),
  )
  const content = props.grid
    ? h(Row, { gutter: 16, ...column.rowProps }, { default: () => children })
    : children

  return h(
    'fieldset',
    {
      class: [
        'antdv-next-pro-schema-group',
        `antdv-next-pro-schema-${column.valueType ?? 'group'}`,
      ],
    },
    [
      column.title
        ? h('legend', { class: 'antdv-next-pro-schema-group-title' }, [resolveTitle(column)])
        : null,
      content,
    ],
  )
}

function renderFormList(
  column: SchemaFormColumn<FormRecord>,
  path: Array<string | number>,
  props: {
    model: FormRecord
    readonly: boolean
    grid: boolean
    layoutType: SchemaFormLayoutType
    schemaSlots: SchemaSlots
    onValueChange: (path: Array<string | number>, value: unknown) => void
  },
): VNodeChild {
  if (path.length === 0) return null
  const current = getValue(props.model, path)
  const rows = Array.isArray(current) ? current : []
  const fieldProps = resolveObjectProps(column.fieldProps, props.model)
  const creatorText = toDisplayText(fieldProps.creatorButtonText ?? 'Add item')

  const rowNodes = rows.map((_row, rowIndex) => {
    const fields = (column.columns ?? []).map((child, childIndex) =>
      h(SchemaFormField, {
        key: childKey(child, childIndex),
        column: child,
        model: props.model,
        prefix: [...path, rowIndex],
        readonly: props.readonly,
        grid: props.grid,
        layoutType: props.layoutType,
        schemaSlots: props.schemaSlots,
        onValueChange: props.onValueChange,
      }),
    )
    const removeButton = props.readonly
      ? null
      : h(
          Button,
          {
            danger: true,
            size: 'small',
            type: 'text',
            onClick: () => {
              const next = rows.map((item) => cloneValue(item))
              next.splice(rowIndex, 1)
              props.onValueChange(path, next)
            },
          },
          { default: () => toDisplayText(fieldProps.removeText ?? 'Remove') },
        )

    return h('div', { class: 'antdv-next-pro-form-list-row', key: rowIndex }, [
      props.grid
        ? h(
            Row,
            { gutter: 16, class: 'antdv-next-pro-form-list-fields' },
            { default: () => fields },
          )
        : h('div', { class: 'antdv-next-pro-form-list-fields' }, fields),
      removeButton,
    ])
  })

  const addButton = props.readonly
    ? null
    : h(
        Button,
        {
          block: true,
          type: 'dashed',
          onClick: () => {
            const next = rows.map((item) => cloneValue(item))
            const initial = fieldProps.initialValue
            next.push(isRecord(initial) ? cloneValue(initial) : {})
            props.onValueChange(path, next)
          },
        },
        { default: () => creatorText },
      )

  return h('section', { class: 'antdv-next-pro-form-list' }, [
    column.title
      ? h('div', { class: 'antdv-next-pro-form-list-title' }, [resolveTitle(column)])
      : null,
    ...rowNodes,
    addButton,
  ])
}

function renderControl(
  column: SchemaFormColumn<FormRecord>,
  value: unknown,
  update: (value: unknown) => void,
  record: FormRecord,
  remoteOptions: SelectOption[],
  optionLoading: boolean,
  formReadonly: boolean,
): VNodeChild {
  const fieldProps = resolveObjectProps(column.fieldProps, record)
  const disabled = formReadonly || column.readonly || Boolean(fieldProps.disabled)
  const type = column.valueType ?? 'text'
  const options = remoteOptions.length > 0 ? remoteOptions : resolveOptions(column, fieldProps)

  if (disabled) {
    return h('span', { class: 'antdv-next-pro-schema-readonly' }, [
      formatReadonlyValue(value, options),
    ])
  }

  const valueProps = {
    ...fieldProps,
    value,
    disabled,
    'onUpdate:value': update,
  }

  if (column.component) {
    return h(column.component, {
      ...fieldProps,
      value,
      modelValue: value,
      disabled,
      'onUpdate:value': update,
      'onUpdate:modelValue': update,
    })
  }

  switch (type) {
    case 'textarea':
      return h(ATextArea, valueProps)
    case 'password':
      return h(AInputPassword, valueProps)
    case 'digit':
      return h(AInputNumber, { ...valueProps, precision: fieldProps.precision })
    case 'money':
      return h(AInputNumber, { ...valueProps, prefix: fieldProps.prefix ?? '¥' })
    case 'percent':
      return h(AInputNumber, { ...valueProps, addonAfter: fieldProps.addonAfter ?? '%' })
    case 'select':
      return h(ASelect, { ...valueProps, options, loading: optionLoading })
    case 'radio':
      return h(ARadioGroup, { ...valueProps, options })
    case 'checkbox':
      if (options.length > 0) return h(ACheckboxGroup, { ...valueProps, options })
      return h(ACheckbox, {
        ...fieldProps,
        checked: Boolean(value),
        disabled,
        'onUpdate:checked': update,
      })
    case 'switch':
      return h(ASwitch, {
        ...fieldProps,
        checked: Boolean(value),
        disabled,
        'onUpdate:checked': update,
      })
    case 'date':
      return h(ADatePicker, valueProps)
    case 'dateTime':
      return h(ADatePicker, { ...valueProps, showTime: true })
    case 'dateRange':
      return h(ADateRangePicker, valueProps)
    case 'dateTimeRange':
      return h(ADateRangePicker, { ...valueProps, showTime: true })
    case 'time':
      return h(ATimePicker, valueProps)
    default:
      return h(AInput, valueProps)
  }
}

function resolveOptions(
  column: SchemaFormColumn<FormRecord>,
  fieldProps: Record<string, unknown>,
): SelectOption[] {
  if (Array.isArray(fieldProps.options)) {
    return fieldProps.options.map((item) =>
      isRecord(item)
        ? {
            label: item.label ?? item.text ?? item.title ?? item.value,
            value: item.value ?? item.key ?? item.id,
            disabled: Boolean(item.disabled),
          }
        : { label: item, value: item },
    )
  }

  const valueEnum = typeof column.valueEnum === 'function' ? column.valueEnum() : column.valueEnum
  if (!valueEnum) return []
  return Object.entries(valueEnum).map(([key, item]) =>
    typeof item === 'string'
      ? { label: item, value: key }
      : { label: item.text, value: key, disabled: item.disabled },
  )
}

function normalizeRemoteOption(item: Record<string, unknown>): SelectOption {
  return {
    label: item.label ?? item.text ?? item.title ?? item.name ?? item.value,
    value: item.value ?? item.key ?? item.id,
    disabled: Boolean(item.disabled),
  }
}

function formatReadonlyValue(value: unknown, options: SelectOption[]): VNodeChild {
  if (value === undefined || value === null || value === '') return '-'
  if (Array.isArray(value)) {
    return value
      .map((item) =>
        toDisplayText(options.find((option) => Object.is(option.value, item))?.label ?? item),
      )
      .join(', ')
  }
  const option = options.find((item) => Object.is(item.value, value))
  if (option) return option.label as VNodeChild
  if (value instanceof Date) return value.toLocaleString()
  if (typeof value === 'object') return JSON.stringify(value)
  return toDisplayText(value)
}

function resolveObjectProps(
  value: SchemaFormColumn<FormRecord>['fieldProps'] | SchemaFormColumn<FormRecord>['formItemProps'],
  record: FormRecord,
): Record<string, unknown> {
  return (typeof value === 'function' ? value(record) : value) ?? {}
}

function resolveTitle(column: SchemaFormColumn<FormRecord>): VNodeChild {
  return typeof column.title === 'function' ? column.title(column) : column.title
}

function wrapGrid(
  node: VNodeChild,
  column: SchemaFormColumn<FormRecord>,
  grid: boolean,
): VNodeChild {
  if (!grid) return node
  return h(Col, { xs: 24, sm: 12, lg: 8, ...column.colProps }, { default: () => node })
}

function childKey(column: SchemaFormColumn<FormRecord>, index: number): string {
  const key = column.key ?? normalizePath(column.dataIndex).join('.')
  return String(key === '' ? index : key)
}

function isHidden(column: SchemaFormColumn<FormRecord>, layoutType: SchemaFormLayoutType): boolean {
  if (column.hideInForm) return true
  if ((layoutType === 'QueryFilter' || layoutType === 'LightFilter') && column.hideInSearch) {
    return true
  }
  return false
}

function stableParams(params: Record<string, unknown> | undefined): string {
  try {
    return JSON.stringify(params ?? {})
  } catch {
    return '[unserializable]'
  }
}

function toDisplayText(value: unknown): string {
  if (value === undefined || value === null) return ''
  if (typeof value === 'string') return value
  if (
    typeof value === 'number' ||
    typeof value === 'boolean' ||
    typeof value === 'bigint' ||
    typeof value === 'symbol'
  ) {
    return String(value)
  }
  if (value instanceof Date) return value.toLocaleString()
  try {
    return JSON.stringify(value) ?? ''
  } catch {
    return '[unserializable]'
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Object.prototype.toString.call(value) === '[object Object]'
}
