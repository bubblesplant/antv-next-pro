import { defineComponent, h, ref, type Component } from 'vue'

import SchemaForm from '../SchemaForm.vue'
import type { SchemaFormInstance, SchemaFormLayoutType } from '../types'
import type { FormRecord } from './utils'

function createSchemaLayout(layoutType: SchemaFormLayoutType, name: string): typeof SchemaForm {
  return defineComponent({
    name,
    inheritAttrs: false,
    setup(_props, { attrs, expose, slots }) {
      const formRef = ref<SchemaFormInstance<FormRecord>>()

      expose({
        validate: () => formRef.value?.validate() ?? Promise.resolve({}),
        reset: () => formRef.value?.reset(),
        getFieldsValue: () => formRef.value?.getFieldsValue() ?? {},
        setFieldsValue: (values: FormRecord) => formRef.value?.setFieldsValue(values),
        submit: () => formRef.value?.submit() ?? Promise.resolve({}),
        open: () => formRef.value?.open(),
        close: () => formRef.value?.close(),
        next: () => formRef.value?.next() ?? Promise.resolve(false),
        prev: () => formRef.value?.prev(),
      } satisfies SchemaFormInstance<FormRecord>)

      return () => h(SchemaForm as Component, { ...attrs, ref: formRef, layoutType }, slots)
    },
  }) as unknown as typeof SchemaForm
}

export const Form = createSchemaLayout('Form', 'AntdvNextProForm')
export const Embed = createSchemaLayout('Embed', 'AntdvNextProEmbed')
export const ModalForm = createSchemaLayout('ModalForm', 'AntdvNextProModalForm')
export const DrawerForm = createSchemaLayout('DrawerForm', 'AntdvNextProDrawerForm')
export const QueryFilter = createSchemaLayout('QueryFilter', 'AntdvNextProQueryFilter')
export const LightFilter = createSchemaLayout('LightFilter', 'AntdvNextProLightFilter')
export const StepForm = createSchemaLayout('StepForm', 'AntdvNextProStepForm')
export const StepsForm = createSchemaLayout('StepsForm', 'AntdvNextProStepsForm')
