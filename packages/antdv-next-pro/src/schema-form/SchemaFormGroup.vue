<script setup lang="ts">
import type { CompositeState, FieldProps } from './fieldTypes'
import { Row } from 'antdv-next'
import { mergeProps } from 'vue'
import VNodeContent from '../shared/VNodeContent'
import SchemaFormChildren from './SchemaFormChildren.vue'

defineOptions({ inheritAttrs: false })
defineProps<{
  context: FieldProps
  state: CompositeState
  rootAttrs: Record<string, unknown>
}>()
</script>

<template>
  <div
    v-if="state.hasContent"
    v-bind="mergeProps({ class: 'antdv-next-pro-dependency' }, rootAttrs)"
  >
    <VNodeContent :content="state.content" />
  </div>
  <fieldset
    v-else
    v-bind="
      mergeProps(
        {
          class: [
            'antdv-next-pro-schema-group',
            `antdv-next-pro-schema-${context.column.valueType ?? 'group'}`,
          ],
        },
        rootAttrs,
      )
    "
  >
    <legend v-if="context.column.title" class="antdv-next-pro-schema-group-title">
      <VNodeContent :content="state.title" />
    </legend>
    <Row v-if="context.grid" v-bind="{ gutter: 16, ...context.column.rowProps }">
      <SchemaFormChildren :columns="context.column.columns ?? []" :context="context" />
    </Row>
    <SchemaFormChildren v-else :columns="context.column.columns ?? []" :context="context" />
  </fieldset>
</template>
