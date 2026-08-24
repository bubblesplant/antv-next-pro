import {
  Checkbox,
  CheckboxGroup,
  DatePicker,
  DateRangePicker,
  Input,
  InputNumber,
  InputPassword,
  RadioGroup,
  Select,
  Switch,
  TextArea,
  TimePicker,
  TimeRangePicker,
} from 'antdv-next'
import { defineComponent, h, type Component, type PropType, type VNodeChild } from 'vue'

import type { ProColumns, ProValueType } from '../types'
import { getValueEnumOptions } from './utils'

export interface ProFieldOption {
  label: unknown
  value: unknown
  disabled?: boolean
}

const ACheckbox = Checkbox as Component
const ACheckboxGroup = CheckboxGroup as Component
const ADatePicker = DatePicker as Component
const ADateRangePicker = DateRangePicker as Component
const AInput = Input as Component
const AInputNumber = InputNumber as Component
const AInputPassword = InputPassword as Component
const ARadioGroup = RadioGroup as Component
const ASelect = Select as Component
const ASwitch = Switch as Component
const ATextArea = TextArea as Component
const ATimePicker = TimePicker as Component
const ATimeRangePicker = TimeRangePicker as Component

export const ValueTypeControl = defineComponent({
  name: 'AntdvNextProValueTypeControl',
  props: {
    column: {
      type: Object as PropType<object>,
      required: true,
    },
    value: { type: null as unknown as PropType<unknown> },
    options: {
      type: Array as PropType<ProFieldOption[]>,
      default: () => [],
    },
    loading: Boolean,
    fieldProps: {
      type: Object as PropType<Record<string, unknown>>,
      default: () => ({}),
    },
  },
  emits: {
    'update:value': (_value: unknown) => true,
  },
  setup(props, { emit }) {
    return () => {
      const column = props.column as ProColumns<Record<string, unknown>>
      const type = column.valueType ?? 'text'
      const update = (value: unknown) => emit('update:value', value)
      const valueProps = {
        ...props.fieldProps,
        value: props.value,
        'onUpdate:value': update,
      }

      if (type === 'textarea') return h(ATextArea, valueProps)
      if (type === 'password') return h(AInputPassword, valueProps)
      if (type === 'digit') {
        return h(AInputNumber, { ...valueProps, precision: props.fieldProps.precision })
      }
      if (type === 'money') {
        return h(AInputNumber, { ...valueProps, prefix: props.fieldProps.prefix ?? '¥' })
      }
      if (type === 'percent') {
        return h(AInputNumber, { ...valueProps, addonAfter: props.fieldProps.addonAfter ?? '%' })
      }
      if (type === 'radio') {
        return h(ARadioGroup, { ...valueProps, options: props.options })
      }
      if (type === 'checkbox') {
        if (props.options.length > 0) {
          return h(ACheckboxGroup, { ...valueProps, options: props.options })
        }
        return h(ACheckbox, {
          ...props.fieldProps,
          checked: Boolean(props.value),
          'onUpdate:checked': update,
        })
      }
      if (type === 'switch') {
        return h(ASwitch, {
          ...props.fieldProps,
          checked: Boolean(props.value),
          'onUpdate:checked': update,
        })
      }
      if (type === 'date') return h(ADatePicker, valueProps)
      if (type === 'dateTime') return h(ADatePicker, { ...valueProps, showTime: true })
      if (type === 'dateRange') return h(ADateRangePicker, valueProps)
      if (type === 'dateTimeRange') {
        return h(ADateRangePicker, { ...valueProps, showTime: true })
      }
      if (type === 'time') return h(ATimePicker, valueProps)
      if (type === 'timeRange') return h(ATimeRangePicker, valueProps)
      if (type === 'select' || props.options.length > 0) {
        return h(ASelect, { ...valueProps, options: props.options, loading: props.loading })
      }
      return h(AInput, valueProps)
    }
  },
})

export function resolveFieldOptions(
  column: ProColumns<Record<string, unknown>>,
  remoteOptions: ProFieldOption[],
  fieldProps: Record<string, unknown>,
): ProFieldOption[] {
  if (remoteOptions.length > 0) return remoteOptions
  if (Array.isArray(fieldProps.options)) return fieldProps.options.map(normalizeFieldOption)
  return getValueEnumOptions(column.valueEnum)
}

export function normalizeFieldOption(item: unknown): ProFieldOption {
  if (!isRecord(item)) return { label: item, value: item }
  return {
    label: item.label ?? item.text ?? item.title ?? item.name ?? item.value,
    value: item.value ?? item.key ?? item.id,
    disabled: Boolean(item.disabled),
  }
}

export function formatProValue(
  value: unknown,
  options: ProFieldOption[],
  type: ProValueType | undefined,
): VNodeChild {
  if (value === undefined || value === null || value === '') return '-'
  if (type === 'password') return '••••••'
  if (Array.isArray(value)) {
    const separator = ['dateRange', 'dateTimeRange', 'timeRange'].includes(type ?? '')
      ? ' ~ '
      : ', '
    return value.map((item) => formatScalarValue(item, options, type)).join(separator)
  }
  if (type === 'money' && typeof value === 'number') return `¥${value}`
  if (type === 'percent' && typeof value === 'number') return `${value}%`
  if (typeof value === 'boolean') return value ? '是' : '否'
  return formatScalarValue(value, options, type)
}

function formatScalarValue(
  value: unknown,
  options: ProFieldOption[],
  type: ProValueType | undefined,
): string {
  const valueText = toFieldText(value)
  const option = options.find((item) => {
    if (Object.is(item.value, value)) return true
    const optionValueText = toFieldText(item.value)
    return valueText !== undefined && optionValueText === valueText
  })
  if (option) return toFieldText(option.label) ?? toFieldText(option.value) ?? '-'
  if (value instanceof Date) return value.toLocaleString()
  if (isRecord(value) && typeof value.format === 'function') {
    const formatter = value.format as (template?: string) => string
    const template =
      type === 'date'
        ? 'YYYY-MM-DD'
        : type === 'time' || type === 'timeRange'
          ? 'HH:mm:ss'
          : 'YYYY-MM-DD HH:mm:ss'
    return formatter(template)
  }
  return valueText ?? '-'
}

function toFieldText(value: unknown): string | undefined {
  if (typeof value === 'string') return value
  if (typeof value === 'number' || typeof value === 'bigint') return `${value}`
  if (typeof value === 'boolean') return value ? 'true' : 'false'
  return undefined
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}
