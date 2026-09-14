import { ref } from 'vue'
import type { SchemaFormInstance } from '../types'
import type { FormRecord } from './utils'

// Layout aliases share only imperative API forwarding; their views remain ordinary SFC templates.
export function useSchemaFormRef() {
  const formRef = ref<SchemaFormInstance<FormRecord>>()
  const formApi: SchemaFormInstance<FormRecord> = {
    validate: () => formRef.value?.validate() ?? Promise.resolve({}),
    reset: () => formRef.value?.reset(),
    getFieldsValue: () => formRef.value?.getFieldsValue() ?? {},
    setFieldsValue: (values) => formRef.value?.setFieldsValue(values),
    submit: () => formRef.value?.submit() ?? Promise.resolve({}),
    open: () => formRef.value?.open(),
    close: () => formRef.value?.close(),
    next: () => formRef.value?.next() ?? Promise.resolve(false),
    prev: () => formRef.value?.prev(),
  }
  return { formRef, formApi }
}
