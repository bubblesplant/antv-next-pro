<script setup lang="ts">
import type { PropType } from 'vue'

import { getCurrentInstance } from 'vue'

import FieldControl from '../pro-form-fields/FieldControl.vue'
import { hasExplicitProp, type ProFormControlType } from '../pro-form-fields/fieldRegistry'
import type { ProColumns } from '../types'
import type { ProFieldOption } from './ValueTypeControl'

defineOptions({ name: 'AntdvNextProValueTypeControl', inheritAttrs: false })

const props = defineProps({
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
})

const emit = defineEmits({
  'update:value': (_value: unknown) => true,
})

const instance = getCurrentInstance()

function resolveColumn(): ProColumns<Record<string, unknown>> {
  return props.column as ProColumns<Record<string, unknown>>
}

function resolveFieldType(): ProFormControlType {
  const valueType = resolveColumn().valueType
  if (valueType !== undefined) return valueType
  return props.options.length > 0 || resolveColumn().valueEnum !== undefined ? 'select' : 'text'
}

function resolveControlProps(): Record<string, unknown> {
  const column = resolveColumn()
  const result: Record<string, unknown> = {
    fieldType: resolveFieldType(),
    modelValue: props.value,
    fieldProps: props.fieldProps,
    loading: props.loading,
  }

  const hasResolvedOptions =
    props.options.length > 0 ||
    column.request !== undefined ||
    column.valueEnum !== undefined ||
    Array.isArray(props.fieldProps.options) ||
    Array.isArray(props.fieldProps.treeData)

  if (hasExplicitProp(instance?.vnode.props, 'options') && hasResolvedOptions) {
    result.options = props.options
  } else if (column.valueEnum !== undefined) {
    result.valueEnum = column.valueEnum
  }

  return result
}
</script>

<template>
  <FieldControl
    v-bind="{ ...resolveControlProps(), ...$attrs }"
    @update:model-value="emit('update:value', $event)"
  >
    <template v-for="(_, name) in $slots" #[name]="slotProps">
      <slot :name="name" v-bind="slotProps ?? {}" />
    </template>
  </FieldControl>
</template>
