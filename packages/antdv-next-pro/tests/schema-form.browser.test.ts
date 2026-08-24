import { flushPromises, mount, type VueWrapper } from '@vue/test-utils'
import { afterEach, describe, expect, it } from 'vite-plus/test'
import { h, nextTick } from 'vue'

import SchemaForm from '../src/SchemaForm.vue'
import type { SchemaFormColumn, SchemaFormInstance } from '../src/types'
import type { FormRecord } from '../src/schema-form/utils'

let wrapper: VueWrapper | undefined

afterEach(() => {
  wrapper?.unmount()
  wrapper = undefined
  document.body.innerHTML = ''
})

describe('SchemaForm browser interactions', () => {
  it('binds a real Antdv Next input and reactively renders dependencies', async () => {
    const columns: SchemaFormColumn<FormRecord>[] = [
      {
        title: 'Kind',
        dataIndex: 'kind',
        fieldProps: { 'data-testid': 'kind-input' },
        transform: (value) => ({ normalizedKind: String(value).toUpperCase() }),
      },
      {
        valueType: 'dependency',
        dependencies: ['kind'],
        renderFormItem: (_column, context) =>
          h(
            'output',
            { 'data-testid': 'kind-output' },
            typeof context.record.kind === 'string' ? context.record.kind : '',
          ),
      },
    ]
    wrapper = mount(SchemaForm, {
      attachTo: document.body,
      props: {
        columns,
        layoutType: 'Embed',
        initialValues: { kind: 'basic' },
        submitter: false,
      },
    })
    await flushPromises()

    const input = wrapper.get('[data-testid="kind-input"]')
    expect(input.element).toBeInstanceOf(HTMLInputElement)
    expect(wrapper.get('[data-testid="kind-output"]').text()).toBe('basic')

    await input.setValue('advanced')
    await nextTick()
    expect(wrapper.get('[data-testid="kind-output"]').text()).toBe('advanced')

    const form = wrapper.vm as unknown as SchemaFormInstance<FormRecord>
    expect(form.getFieldsValue()).toEqual({ kind: 'advanced' })
    await expect(form.submit()).resolves.toEqual({ normalizedKind: 'ADVANCED' })
  })
})
