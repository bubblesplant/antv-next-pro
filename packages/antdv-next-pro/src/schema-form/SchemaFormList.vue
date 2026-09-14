<script setup lang="ts">
import type { FieldProps, FormListState } from './fieldTypes'
import { Button, Row } from 'antdv-next'
import { mergeProps } from 'vue'
import VNodeContent from '../shared/VNodeContent'
import SchemaFormChildren from './SchemaFormChildren.vue'
import { toDisplayText } from './fieldUtils'
import { cloneValue } from './utils'

defineOptions({ inheritAttrs: false })
const props = defineProps<{
  context: FieldProps
  state: FormListState
  rootAttrs: Record<string, unknown>
}>()

function removeRow(rowIndex: number): void {
  const next = props.state.rows.map((row) => cloneValue(row))
  next.splice(rowIndex, 1)
  props.context.onValueChange(props.state.path, next)
}

function addRow(): void {
  const next = props.state.rows.map((row) => cloneValue(row))
  const initial = props.state.fieldProps.initialValue
  next.push(
    Object.prototype.toString.call(initial) === '[object Object]' ? cloneValue(initial) : {},
  )
  props.context.onValueChange(props.state.path, next)
}
</script>

<template>
  <section v-bind="mergeProps({ class: 'antdv-next-pro-form-list' }, rootAttrs)">
    <div v-if="context.column.title" class="antdv-next-pro-form-list-title">
      <VNodeContent :content="state.title" />
    </div>
    <div
      v-for="(_row, rowIndex) in state.rows"
      :key="rowIndex"
      class="antdv-next-pro-form-list-row"
    >
      <component
        :is="context.grid ? Row : 'div'"
        v-bind="context.grid ? { gutter: 16 } : {}"
        class="antdv-next-pro-form-list-fields"
      >
        <SchemaFormChildren
          :columns="context.column.columns ?? []"
          :context="context"
          :prefix="[...state.path, rowIndex]"
        />
      </component>
      <Button v-if="!context.readonly" danger size="small" type="text" @click="removeRow(rowIndex)">
        {{ toDisplayText(state.fieldProps.removeText ?? 'Remove') }}
      </Button>
    </div>
    <Button v-if="!context.readonly" block type="dashed" @click="addRow">
      {{ state.creatorText }}
    </Button>
  </section>
</template>
