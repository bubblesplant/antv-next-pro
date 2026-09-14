<script setup lang="ts">
import type { VNodeChild } from 'vue'

import { FormItem } from 'antdv-next'
import { getCurrentInstance, mergeProps, ref, useAttrs, useSlots } from 'vue'

import FieldControl from './FieldControl.vue'
import { hasExplicitProp, type ProFormControlType } from './fieldRegistry'
import type {
  ProFormCaptchaProps,
  ProFormDateTimePickerProps,
  ProFormDateTimeRangePickerProps,
  ProFormDigitProps,
  ProFormFieldProps,
  ProFormMoneyProps,
} from './types'

// The public generic remains available through ProFormFieldProps. The SFC accepts every
// specialized wrapper value type, so its internal bridge intentionally uses `any` here.
interface Props extends ProFormFieldProps<any, any, any, any> {
  fieldType?: ProFormControlType
  loading?: boolean
  precision?: ProFormDigitProps['precision']
  min?: ProFormDigitProps['min']
  prefix?: ProFormMoneyProps['prefix']
  showTime?: ProFormDateTimePickerProps['showTime'] | ProFormDateTimeRangePickerProps['showTime']
  layout?: 'horizontal' | 'vertical'
  onGetCaptcha?: () => void | boolean | Promise<void | boolean>
  countDown?: number
  captchaText?: VNodeChild
  countDownText?: (seconds: number) => VNodeChild
  buttonProps?: ProFormCaptchaProps['buttonProps']
}

defineOptions({ name: 'AntdvNextProFormField', inheritAttrs: false })

const props = defineProps<Props>()
const emit = defineEmits<{
  (event: 'update:modelValue', value: unknown): void
  (event: 'change', ...args: unknown[]): void
  (event: 'drop', value: unknown): void
  (event: 'requestError', error: unknown): void
  (event: 'captchaError', error: unknown): void
}>()

interface FieldControlInstance {
  refresh?: () => Promise<void>
  resetCountdown?: () => void
}

const attrs = useAttrs()
const slots = useSlots()
const instance = getCurrentInstance()
const fieldRef = ref<FieldControlInstance>()
const formItemSlotNames = new Set(['label', 'extra', 'help', 'tooltip'])
const controlPropNames: Array<keyof Props> = [
  'modelValue',
  'fieldProps',
  'options',
  'valueEnum',
  'request',
  'params',
  'disabled',
  'readonly',
  'emptyText',
  'readonlyRender',
  'loading',
  'precision',
  'min',
  'prefix',
  'showTime',
  'layout',
  'onGetCaptcha',
  'countDown',
  'captchaText',
  'countDownText',
  'buttonProps',
]

function rawProps(): Record<string, unknown> | null | undefined {
  return instance?.vnode.props
}

function resolveFieldMode(): 'form-item' | 'field' {
  return props.fieldMode ?? 'form-item'
}

function resolveFormItemProps(): Record<string, unknown> {
  const result = mergeProps(
    (props.formItemProps ?? {}) as Record<string, unknown>,
    attrs,
  ) as Record<string, unknown>

  for (const name of ['name', 'label', 'rules'] as const) {
    if (hasExplicitProp(rawProps(), name)) result[name] = props[name]
  }
  return result
}

function resolveControlProps(): Record<string, unknown> {
  const result: Record<string, unknown> = {}
  if (props.fieldType !== undefined) result.fieldType = props.fieldType
  if (props.valueType !== undefined) result.valueType = props.valueType

  for (const name of controlPropNames) {
    if (!hasExplicitProp(rawProps(), name)) continue
    const value = props[name]
    result[name] =
      name === 'fieldProps' || name === 'buttonProps'
        ? ((value ?? {}) as Record<string, unknown>)
        : value
  }

  if (resolveFieldMode() === 'field') Object.assign(result, attrs)
  return result
}

function resolveControlSlotNames(): string[] {
  return Object.keys(slots).filter((name) => !formItemSlotNames.has(name))
}

function resolveFormItemSlotNames(): string[] {
  return Object.keys(slots).filter((name) => formItemSlotNames.has(name))
}

function refresh(): Promise<void> {
  return fieldRef.value?.refresh?.() ?? Promise.resolve()
}

function resetCountdown(): void {
  fieldRef.value?.resetCountdown?.()
}

defineExpose({ refresh, resetCountdown })
</script>

<template>
  <FormItem v-if="resolveFieldMode() === 'form-item'" v-bind="resolveFormItemProps()">
    <template v-for="name in resolveFormItemSlotNames()" #[name]="slotProps">
      <slot :name="name" v-bind="slotProps ?? {}" />
    </template>

    <FieldControl
      ref="fieldRef"
      v-bind="resolveControlProps()"
      @update:model-value="emit('update:modelValue', $event)"
      @change="(...args) => emit('change', ...args)"
      @drop="emit('drop', $event)"
      @request-error="emit('requestError', $event)"
      @captcha-error="emit('captchaError', $event)"
    >
      <template v-for="name in resolveControlSlotNames()" #[name]="slotProps">
        <slot :name="name" v-bind="slotProps ?? {}" />
      </template>
    </FieldControl>
  </FormItem>

  <FieldControl
    v-else
    ref="fieldRef"
    v-bind="resolveControlProps()"
    @update:model-value="emit('update:modelValue', $event)"
    @change="(...args) => emit('change', ...args)"
    @drop="emit('drop', $event)"
    @request-error="emit('requestError', $event)"
    @captcha-error="emit('captchaError', $event)"
  >
    <template v-for="name in resolveControlSlotNames()" #[name]="slotProps">
      <slot :name="name" v-bind="slotProps ?? {}" />
    </template>
  </FieldControl>
</template>
