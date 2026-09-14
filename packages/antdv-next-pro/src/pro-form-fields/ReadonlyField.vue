<script setup lang="ts">
import type { VNodeChild } from 'vue'

import VNodeContent from '../shared/VNodeContent'
import { formatReadonlyValue, type ProReadonlyValueType } from './readonly'
import type { ProFormFieldOption } from './types'

defineOptions({ name: 'AntdvNextProReadonlyField', inheritAttrs: false })

const props = withDefaults(
  defineProps<{
    value?: unknown
    options?: ProFormFieldOption[]
    type?: ProReadonlyValueType
    emptyText?: VNodeChild
    moneyPrefix?: VNodeChild | false
    readonlyRender?: (value: unknown) => VNodeChild
  }>(),
  {
    options: () => [],
    emptyText: '-',
  },
)

function resolveContent(): VNodeChild {
  const custom = props.readonlyRender?.(props.value)
  if (custom !== undefined && custom !== null) return custom
  return formatReadonlyValue(props.value, {
    options: props.options,
    type: props.type,
    emptyText: props.emptyText,
    moneyPrefix: props.moneyPrefix,
  })
}
</script>

<template>
  <span class="antdv-next-pro-readonly-field" v-bind="$attrs">
    <VNodeContent :content="resolveContent()" />
  </span>
</template>
