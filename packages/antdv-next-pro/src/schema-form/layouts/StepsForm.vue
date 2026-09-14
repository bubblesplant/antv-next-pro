<script setup lang="ts">
import type { Component } from 'vue'
import SchemaForm from '../../SchemaForm.vue'
import { useSchemaFormRef } from '../useSchemaFormRef'

defineOptions({ name: 'AntdvNextProStepsForm', inheritAttrs: false })
const BaseSchemaForm = SchemaForm as Component
const { formRef, formApi } = useSchemaFormRef()
defineExpose(formApi)
</script>

<template>
  <BaseSchemaForm ref="formRef" v-bind="$attrs" layout-type="StepsForm">
    <template v-for="(_, name) in $slots" #[name]="slotProps">
      <slot :name="name" v-bind="slotProps ?? {}" />
    </template>
  </BaseSchemaForm>
</template>
