import { flushPromises, mount, shallowMount } from '@vue/test-utils'
import { afterEach, describe, expect, it, vi } from 'vite-plus/test'
import { createApp, defineComponent, h, type VNodeChild } from 'vue'

import AntdvNextPro from '../src'
import SchemaForm from '../src/SchemaForm.vue'
import SchemaFormBody from '../src/schema-form/SchemaFormBody.vue'
import {
  DrawerForm,
  Embed,
  Form,
  LightFilter,
  ModalForm,
  QueryFilter,
  StepForm,
  StepsForm,
} from '../src/schema-form'
import type { SchemaFormColumn, SchemaFormInstance } from '../src/types'
import type { FormRecord } from '../src/schema-form/utils'

afterEach(() => {
  window.history.replaceState({}, '', '/')
})

describe('SchemaForm', () => {
  it('initializes, updates and submits through the public instance API', async () => {
    const amountTransform = vi.fn((value: unknown) => Number(value) * 100)
    const nameTransform = vi.fn((value: unknown) => ({
      displayName: String(value).trim(),
    }))
    const columns: SchemaFormColumn<FormRecord>[] = [
      {
        dataIndex: 'amount',
        convertValue: (value) => Number(value),
        transform: amountTransform,
      },
      {
        dataIndex: 'name',
        transform: nameTransform,
      },
    ]
    const wrapper = shallowMount(SchemaForm, {
      props: {
        columns,
        initialValues: { amount: '12.5', name: 'Ada' },
      },
    })
    await flushPromises()
    const form = wrapper.vm as unknown as SchemaFormInstance<FormRecord>

    expect(form.getFieldsValue()).toEqual({ amount: 12.5, name: 'Ada' })
    form.setFieldsValue({ name: ' Grace ' })
    expect(form.getFieldsValue()).toEqual({ amount: 12.5, name: ' Grace ' })
    await expect(form.validate()).resolves.toEqual({ amount: 12.5, name: ' Grace ' })
    expect(amountTransform).not.toHaveBeenCalled()
    expect(nameTransform).not.toHaveBeenCalled()
    await expect(form.submit()).resolves.toEqual({ amount: 1250, displayName: 'Grace' })
    expect(amountTransform).toHaveBeenCalledTimes(1)
    expect(nameTransform).toHaveBeenCalledTimes(1)
    expect(wrapper.emitted('finish')?.at(-1)?.[0]).toEqual({
      amount: 1250,
      displayName: 'Grace',
    })

    form.reset()
    expect(form.getFieldsValue()).toEqual({ amount: 12.5, name: 'Ada' })
  })

  it('accepts only the latest request result when params change', async () => {
    const resolvers = new Map<number, (values: FormRecord) => void>()
    const request = vi.fn(
      (params?: Record<string, unknown>) =>
        new Promise<FormRecord>((resolve) => {
          resolvers.set(Number(params?.id), resolve)
        }),
    )
    const wrapper = shallowMount(SchemaForm, {
      props: {
        columns: [{ dataIndex: 'name' }],
        params: { id: 1 },
        request,
      },
    })
    await flushPromises()
    await wrapper.setProps({ params: { id: 2 } })
    await flushPromises()

    resolvers.get(2)?.({ name: 'latest' })
    await flushPromises()
    resolvers.get(1)?.({ name: 'stale' })
    await flushPromises()

    const form = wrapper.vm as unknown as SchemaFormInstance<FormRecord>
    expect(form.getFieldsValue()).toEqual({ name: 'latest' })
    expect(request).toHaveBeenCalledTimes(2)
  })

  it('controls dialog visibility with Vue model events and exposed methods', async () => {
    const wrapper = shallowMount(SchemaForm, {
      props: {
        columns: [{ dataIndex: 'name' }],
        layoutType: 'ModalForm',
        open: false,
      },
    })
    await flushPromises()
    const form = wrapper.vm as unknown as SchemaFormInstance<FormRecord>

    form.open()
    expect(wrapper.emitted('update:open')?.at(-1)).toEqual([true])
    form.close()
    expect(wrapper.emitted('update:open')?.at(-1)).toEqual([false])
  })

  it.each(['ModalForm', 'DrawerForm'] as const)(
    'provides trigger, title and footer slots for %s without duplicate submitters',
    async (layoutType) => {
      const DialogStub = defineComponent({
        name: 'DialogStub',
        inheritAttrs: false,
        setup(_props, { attrs, slots }) {
          return () =>
            h('section', { 'data-open': String(attrs.open) }, [
              h('header', {}, slots.title?.()),
              slots.default?.(),
              h('footer', {}, slots.footer?.()),
            ])
        },
      })
      const trigger = vi.fn(({ open, openForm }: { open: boolean; openForm: () => void }) =>
        h('button', { 'data-testid': 'dialog-trigger', onClick: openForm }, String(open)),
      )
      const title = vi.fn(({ title }: { title: VNodeChild }) =>
        h('strong', { 'data-testid': 'dialog-title' }, [title]),
      )
      const footer = vi.fn(({ close }: { close: () => void }) =>
        h('button', { 'data-testid': 'dialog-footer', onClick: close }, 'Close'),
      )
      const wrapper = shallowMount(SchemaForm, {
        props: {
          columns: [{ dataIndex: 'name' }],
          layoutType,
          open: false,
          title: 'Account',
        },
        slots: { trigger, title, footer },
        global: {
          stubs: {
            ADrawer: DialogStub,
            AModal: DialogStub,
          },
        },
      })
      await flushPromises()

      expect(wrapper.get('[data-testid="dialog-title"]').text()).toBe('Account')
      expect(wrapper.get('[data-testid="dialog-footer"]').text()).toBe('Close')
      expect(wrapper.findComponent(SchemaFormBody).props('submitter')).toBe(false)
      expect(trigger.mock.calls[0]?.[0].open).toBe(false)

      await wrapper.get('[data-testid="dialog-trigger"]').trigger('click')
      expect(wrapper.emitted('update:open')?.at(-1)).toEqual([true])
      wrapper.unmount()
    },
  )

  it('moves between grouped steps and emits controlled current state', async () => {
    const columns: SchemaFormColumn<FormRecord>[] = [
      { title: 'Account', valueType: 'group', columns: [{ dataIndex: 'name' }] },
      { title: 'Profile', valueType: 'group', columns: [{ dataIndex: 'bio' }] },
    ]
    const wrapper = shallowMount(SchemaForm, {
      props: { columns, layoutType: 'StepsForm', current: 0 },
    })
    await flushPromises()
    const form = wrapper.vm as unknown as SchemaFormInstance<FormRecord>

    await expect(form.next()).resolves.toBe(true)
    expect(wrapper.emitted('update:current')?.at(-1)).toEqual([1])
    form.prev()
    expect(wrapper.emitted('update:current')?.at(-1)).toEqual([0])
  })

  it('coalesces concurrent next validation and advances at most one step', async () => {
    let resolveValidation!: () => void
    const validateFields = vi.fn(
      () =>
        new Promise<void>((resolve) => {
          resolveValidation = resolve
        }),
    )
    const BodyStub = defineComponent({
      name: 'SchemaFormBody',
      setup(_, { expose }) {
        expose({ validateFields })
        return () => h('div')
      },
    })
    const columns: SchemaFormColumn<FormRecord>[] = [
      { title: 'Account', valueType: 'group', columns: [{ dataIndex: 'name' }] },
      { title: 'Profile', valueType: 'group', columns: [{ dataIndex: 'bio' }] },
      { title: 'Confirm', valueType: 'group', columns: [{ dataIndex: 'accepted' }] },
    ]
    const wrapper = shallowMount(SchemaForm, {
      props: { columns, layoutType: 'StepsForm', current: 0 },
      global: { stubs: { SchemaFormBody: BodyStub } },
    })
    await flushPromises()
    const form = wrapper.vm as unknown as SchemaFormInstance<FormRecord>

    const firstNavigation = form.next()
    const secondNavigation = form.next()
    expect(validateFields).toHaveBeenCalledTimes(1)

    resolveValidation()
    await expect(Promise.all([firstNavigation, secondNavigation])).resolves.toEqual([true, true])
    expect(wrapper.emitted('update:current')).toEqual([[1]])
    expect(wrapper.emitted('currentChange')).toEqual([[1]])
  })

  it('keeps the current step when concurrent next validation fails', async () => {
    let rejectValidation!: (reason?: unknown) => void
    const validationError = new Error('validation failed')
    const validateFields = vi.fn(
      () =>
        new Promise<void>((_, reject) => {
          rejectValidation = reject
        }),
    )
    const BodyStub = defineComponent({
      name: 'SchemaFormBody',
      setup(_, { expose }) {
        expose({ validateFields })
        return () => h('div')
      },
    })
    const columns: SchemaFormColumn<FormRecord>[] = [
      { title: 'Account', valueType: 'group', columns: [{ dataIndex: 'name' }] },
      { title: 'Profile', valueType: 'group', columns: [{ dataIndex: 'bio' }] },
    ]
    const wrapper = shallowMount(SchemaForm, {
      props: { columns, layoutType: 'StepsForm', current: 0 },
      global: { stubs: { SchemaFormBody: BodyStub } },
    })
    await flushPromises()
    const form = wrapper.vm as unknown as SchemaFormInstance<FormRecord>

    const firstNavigation = form.next()
    const secondNavigation = form.next()
    expect(validateFields).toHaveBeenCalledTimes(1)

    rejectValidation(validationError)
    await expect(Promise.all([firstNavigation, secondNavigation])).resolves.toEqual([false, false])
    expect(wrapper.emitted('update:current')).toBeUndefined()
    expect(wrapper.emitted('currentChange')).toBeUndefined()
    expect(wrapper.emitted('error')).toEqual([[validationError]])
  })

  it('routes forward step clicks through next validation and allows direct backward clicks', async () => {
    const SpinStub = defineComponent({
      name: 'Spin',
      setup(_, { slots }) {
        return () => h('div', slots.default?.())
      },
    })
    const StepsStub = defineComponent({
      name: 'Steps',
      emits: ['change'],
      setup(_, { emit }) {
        return () =>
          h('div', [
            h(
              'button',
              {
                'data-testid': 'forward-step',
                onClick: () => emit('change', 2),
              },
              'Forward',
            ),
            h(
              'button',
              {
                'data-testid': 'backward-step',
                onClick: () => emit('change', 0),
              },
              'Backward',
            ),
          ])
      },
    })
    const columns: SchemaFormColumn<FormRecord>[] = [
      { title: 'Account', valueType: 'group', columns: [{ dataIndex: 'name' }] },
      { title: 'Profile', valueType: 'group', columns: [{ dataIndex: 'bio' }] },
      { title: 'Confirm', valueType: 'group', columns: [{ dataIndex: 'accepted' }] },
    ]
    const wrapper = shallowMount(SchemaFormBody, {
      props: {
        columns,
        model: {},
        layoutType: 'StepsForm',
        current: 0,
      },
      global: {
        stubs: {
          ASpin: SpinStub,
          ASteps: StepsStub,
          Spin: SpinStub,
          Steps: StepsStub,
        },
      },
    })

    await wrapper.get('[data-testid="forward-step"]').trigger('click')
    expect(wrapper.emitted('next')).toHaveLength(1)
    expect(wrapper.emitted('currentChange')).toBeUndefined()

    await wrapper.setProps({ current: 2 })
    await wrapper.get('[data-testid="backward-step"]').trigger('click')
    expect(wrapper.emitted('currentChange')?.at(-1)).toEqual([0])
  })

  it('provides step title, content and action slots with navigation context', async () => {
    Object.defineProperty(window, 'matchMedia', {
      configurable: true,
      value: vi.fn(
        (query: string) =>
          ({
            matches: false,
            media: query,
            onchange: null,
            addEventListener: vi.fn(),
            removeEventListener: vi.fn(),
            addListener: vi.fn(),
            removeListener: vi.fn(),
            dispatchEvent: vi.fn(() => false),
          }) satisfies MediaQueryList,
      ),
    })
    const columns: SchemaFormColumn<FormRecord>[] = [
      { title: 'Account', valueType: 'group', columns: [{ dataIndex: 'name' }] },
      { title: 'Profile', valueType: 'group', columns: [{ dataIndex: 'bio' }] },
    ]
    const stepTitle = vi.fn((slotProps: Record<string, unknown>) =>
      h('span', {}, `Custom ${String(slotProps.title)}`),
    )
    const stepContent = vi.fn((slotProps: Record<string, unknown>) => {
      const content = slotProps.content as () => VNodeChild
      return h('section', { 'data-testid': 'step-content' }, [content()])
    })
    const stepActions = vi.fn((slotProps: Record<string, unknown>) =>
      h(
        'button',
        {
          'data-testid': 'step-next',
          onClick: slotProps.next as () => void,
        },
        'Continue',
      ),
    )
    const wrapper = mount(SchemaFormBody, {
      props: {
        columns,
        model: { name: 'Ada' },
        layoutType: 'StepsForm',
        submitter: {},
        schemaSlots: {
          'step-title': stepTitle,
          'step-content': stepContent,
          'step-actions': stepActions,
        },
      },
    })

    expect(stepTitle).toHaveBeenCalled()
    expect(stepTitle.mock.calls[0]?.[0]).toEqual(
      expect.objectContaining({ current: 0, index: 0, title: 'Account' }),
    )
    expect(wrapper.find('[data-testid="step-content"]').exists()).toBe(true)
    expect(stepContent.mock.calls[0]?.[0]).toEqual(
      expect.objectContaining({ current: 0, values: { name: 'Ada' } }),
    )

    await wrapper.get('[data-testid="step-next"]').trigger('click')
    expect(wrapper.emitted('next')).toHaveLength(1)
    expect(stepActions.mock.calls[0]?.[0]).toEqual(
      expect.objectContaining({ current: 0, hasNext: true, hasPrevious: false }),
    )
    wrapper.unmount()
  })

  it('clears deleted query fields and all URL-owned fields on popstate', async () => {
    window.history.replaceState({}, '', '/schema-form?name=%22Ada%22&age=36')
    const wrapper = shallowMount(SchemaForm, {
      props: {
        columns: [{ dataIndex: 'name' }, { dataIndex: 'age' }],
        initialValues: { localOnly: true },
        urlSync: true,
      },
    })
    await flushPromises()
    const form = wrapper.vm as unknown as SchemaFormInstance<FormRecord>
    expect(form.getFieldsValue()).toEqual({ name: 'Ada', age: 36, localOnly: true })

    window.history.pushState({}, '', '/schema-form?name=%22Grace%22')
    window.dispatchEvent(new PopStateEvent('popstate'))
    await flushPromises()
    expect(form.getFieldsValue()).toEqual({ name: 'Grace', localOnly: true })

    window.history.pushState({}, '', '/schema-form?preserved=yes')
    window.dispatchEvent(new PopStateEvent('popstate'))
    await flushPromises()
    expect(form.getFieldsValue()).toEqual({ localOnly: true })
    wrapper.unmount()
  })

  it('clears deleted hash fields and an empty hash on hashchange', async () => {
    window.history.replaceState({}, '', '/schema-form#name=%22Ada%22&age=36')
    const wrapper = shallowMount(SchemaForm, {
      props: {
        columns: [{ dataIndex: 'name' }, { dataIndex: 'age' }],
        initialValues: { localOnly: true },
        urlSync: { mode: 'hash' },
      },
    })
    await flushPromises()
    const form = wrapper.vm as unknown as SchemaFormInstance<FormRecord>
    expect(form.getFieldsValue()).toEqual({ name: 'Ada', age: 36, localOnly: true })

    const oldUrl = window.location.href
    window.history.replaceState({}, '', '/schema-form#name=%22Grace%22')
    window.dispatchEvent(
      new HashChangeEvent('hashchange', { oldURL: oldUrl, newURL: window.location.href }),
    )
    await flushPromises()
    expect(form.getFieldsValue()).toEqual({ name: 'Grace', localOnly: true })

    const previousUrl = window.location.href
    window.history.replaceState({}, '', '/schema-form')
    window.dispatchEvent(
      new HashChangeEvent('hashchange', {
        oldURL: previousUrl,
        newURL: window.location.href,
      }),
    )
    await flushPromises()
    expect(form.getFieldsValue()).toEqual({ localOnly: true })
    wrapper.unmount()
  })

  it.each([
    [Form, 'Form'],
    [Embed, 'Embed'],
    [ModalForm, 'ModalForm'],
    [DrawerForm, 'DrawerForm'],
    [QueryFilter, 'QueryFilter'],
    [LightFilter, 'LightFilter'],
    [StepForm, 'StepForm'],
    [StepsForm, 'StepsForm'],
  ] as const)('injects the %s layout alias', (component, layoutType) => {
    const wrapper = shallowMount(component, { attrs: { columns: [] } })
    expect(wrapper.findComponent({ name: 'SchemaForm' }).props('layoutType')).toBe(layoutType)
  })

  it('registers every schema layout with its public global component name', () => {
    const app = createApp({ render: () => null })
    app.use(AntdvNextPro)

    for (const [name, component] of [
      ['Form', Form],
      ['Embed', Embed],
      ['ModalForm', ModalForm],
      ['DrawerForm', DrawerForm],
      ['QueryFilter', QueryFilter],
      ['LightFilter', LightFilter],
      ['StepForm', StepForm],
      ['StepsForm', StepsForm],
    ] as const) {
      expect(app.component(name)).toBe(component)
    }
    expect(app.component('AntdvNextProModalForm')).toBe(ModalForm)
  })
})
