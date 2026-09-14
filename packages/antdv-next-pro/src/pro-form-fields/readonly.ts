import type { VNodeChild } from 'vue'

import type { ProValueType } from '../types'
import { normalizeFieldOption } from './options'
import type { ProFormFieldOption } from './types'

export type ProReadonlyValueType = ProValueType | 'upload'

export interface FormatReadonlyValueOptions<Value = unknown> {
  options?: readonly ProFormFieldOption<Value>[]
  type?: ProReadonlyValueType
  emptyText?: VNodeChild
  moneyPrefix?: VNodeChild | false
}

export function findFieldOption<Value = unknown>(
  value: unknown,
  options: readonly ProFormFieldOption<Value>[] = [],
): ProFormFieldOption<Value> | undefined {
  const exactMatch = findNestedFieldOption<Value>(options, (item) => Object.is(item.value, value))
  if (exactMatch) return exactMatch

  const valueText = toComparableText(value)
  if (valueText === undefined) return undefined
  return findNestedFieldOption<Value>(options, (item) => toComparableText(item.value) === valueText)
}

function findNestedFieldOption<Value>(
  options: readonly unknown[],
  predicate: (item: ProFormFieldOption<Value>) => boolean,
): ProFormFieldOption<Value> | undefined {
  for (const rawOption of options) {
    const option = normalizeFieldOption<Value>(rawOption)
    if (predicate(option)) return option
    if (!Array.isArray(option.children)) continue
    const nested = findNestedFieldOption<Value>(option.children, predicate)
    if (nested) return nested
  }
  return undefined
}

export function formatReadonlyValue<Value = unknown>(
  value: unknown,
  {
    options = [],
    type,
    emptyText = '-',
    moneyPrefix = '¥',
  }: FormatReadonlyValueOptions<Value> = {},
): VNodeChild {
  if (isEmptyReadonlyValue(value)) return emptyText
  if (type === 'password') return '••••••'

  if (type === 'upload' && Array.isArray(value)) {
    return joinReadonlyParts(
      value.map((item) => formatUploadFile(item, emptyText)),
      ', ',
    )
  }

  if (Array.isArray(value)) {
    const separator = isRangeValueType(type) ? ' ~ ' : ', '
    return joinReadonlyParts(
      value.map((item) => formatReadonlyScalar(item, options, type, emptyText)),
      separator,
    )
  }

  const formatted = formatReadonlyScalar(value, options, type, emptyText)
  if (type === 'money' && moneyPrefix !== false) {
    return prependReadonlyPart(moneyPrefix, formatted)
  }
  if (type === 'percent') return appendReadonlyPart(formatted, '%')
  return formatted
}

function formatReadonlyScalar<Value>(
  value: unknown,
  options: readonly ProFormFieldOption<Value>[],
  type: ProReadonlyValueType | undefined,
  emptyText: VNodeChild,
): VNodeChild {
  const option = findFieldOption(value, options)
  if (option && option.label !== undefined && option.label !== null) return option.label

  if (value instanceof Date) return formatDate(value, type)
  if (isRecord(value) && typeof value.format === 'function') {
    return (value.format as (template?: string) => string)(dateTemplate(type))
  }
  if (typeof value === 'boolean') return value ? '是' : '否'

  return toDisplayText(value) ?? emptyText
}

function formatUploadFile(value: unknown, emptyText: VNodeChild): VNodeChild {
  if (!isRecord(value)) return toDisplayText(value) ?? emptyText
  return (
    toDisplayText(value.name) ??
    toDisplayText(value.fileName) ??
    toDisplayText(value.url) ??
    emptyText
  )
}

function joinReadonlyParts(parts: VNodeChild[], separator: string): VNodeChild {
  if (parts.length === 0) return ''
  if (parts.every(isTextPart)) return parts.map((part) => `${part}`).join(separator)

  return parts.flatMap((part, index) => (index === 0 ? [part] : [separator, part]))
}

function prependReadonlyPart(prefix: VNodeChild, value: VNodeChild): VNodeChild {
  if (isTextPart(prefix) && isTextPart(value)) return `${prefix}${value}`
  return [prefix, value]
}

function appendReadonlyPart(value: VNodeChild, suffix: string): VNodeChild {
  if (isTextPart(value)) return `${value}${suffix}`
  return [value, suffix]
}

function isTextPart(value: VNodeChild): value is string | number {
  return typeof value === 'string' || typeof value === 'number'
}

function isEmptyReadonlyValue(value: unknown): boolean {
  return value === undefined || value === null || value === ''
}

function isRangeValueType(type: ProReadonlyValueType | undefined): boolean {
  return type === 'dateRange' || type === 'dateTimeRange' || type === 'timeRange'
}

function dateTemplate(type: ProReadonlyValueType | undefined): string {
  if (type === 'date' || type === 'dateRange') return 'YYYY-MM-DD'
  if (type === 'time' || type === 'timeRange') return 'HH:mm:ss'
  return 'YYYY-MM-DD HH:mm:ss'
}

function formatDate(value: Date, type: ProReadonlyValueType | undefined): string {
  const date = [value.getFullYear(), pad(value.getMonth() + 1), pad(value.getDate())].join('-')
  const time = [pad(value.getHours()), pad(value.getMinutes()), pad(value.getSeconds())].join(':')
  if (type === 'date' || type === 'dateRange') return date
  if (type === 'time' || type === 'timeRange') return time
  return `${date} ${time}`
}

function pad(value: number): string {
  return `${value}`.padStart(2, '0')
}

function toDisplayText(value: unknown): string | undefined {
  if (typeof value === 'string') return value
  if (typeof value === 'number' || typeof value === 'bigint') return `${value}`
  return undefined
}

function toComparableText(value: unknown): string | undefined {
  if (typeof value === 'boolean') return value ? 'true' : 'false'
  return toDisplayText(value)
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}
