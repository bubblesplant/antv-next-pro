import { flushPromises, shallowMount } from '@vue/test-utils'
import {
  Checkbox,
  CheckboxGroup,
  DatePicker,
  DateRangePicker,
  Input,
  InputNumber,
  InputPassword,
  RadioGroup,
  Select,
  Switch,
  TextArea,
  TimePicker,
  TimeRangePicker,
} from 'antdv-next'
import { describe, expect, it, vi } from 'vite-plus/test'
import { type Component } from 'vue'

import ProTable from '../src/ProTable.vue'
import type { ProValueType } from '../src/types'
import {
  formatProValue,
  ValueTypeControl,
  type ProFieldOption,
} from '../src/table/ValueTypeControl'

describe('table value type controls', () => {
  it('maps all public table field value types to Antdv Next controls', () => {
    const options: ProFieldOption[] = [
      { label: 'Enabled', value: 'enabled' },
      { label: 'Disabled', value: 'disabled' },
    ]
    const cases: Array<{
      type: ProValueType | undefined
      component: Component
      options?: ProFieldOption[]
    }> = [
      { type: undefined, component: Input },
      { type: 'text', component: Input },
      { type: 'textarea', component: TextArea },
      { type: 'password', component: InputPassword },
      { type: 'digit', component: InputNumber },
      { type: 'money', component: InputNumber },
      { type: 'percent', component: InputNumber },
      { type: 'select', component: Select, options },
      { type: 'radio', component: RadioGroup, options },
      { type: 'checkbox', component: Checkbox },
      { type: 'checkbox', component: CheckboxGroup, options },
      { type: 'switch', component: Switch },
      { type: 'date', component: DatePicker },
      { type: 'dateTime', component: DatePicker },
      { type: 'dateRange', component: DateRangePicker },
      { type: 'dateTimeRange', component: DateRangePicker },
      { type: 'time', component: TimePicker },
      { type: 'timeRange', component: TimeRangePicker },
    ]

    for (const item of cases) {
      const wrapper = shallowMount(ValueTypeControl, {
        props: {
          column: { dataIndex: 'value', valueType: item.type },
          value: item.type === 'checkbox' || item.type === 'switch' ? false : undefined,
          options: item.options ?? [],
        },
      })
      expect(wrapper.findComponent(item.component).exists(), item.type ?? 'default').toBe(true)
      wrapper.unmount()
    }
  })

  it('emits model updates and applies money and percent affordances', () => {
    const money = shallowMount(ValueTypeControl, {
      props: { column: { valueType: 'money' }, value: 12 },
    })
    const moneyInput = money.findComponent(InputNumber)
    moneyInput.vm.$emit('update:value', 20)
    expect(money.emitted('update:value')).toEqual([[20]])
    expect(moneyInput.props('prefix')).toBe('¥')

    const percent = shallowMount(ValueTypeControl, {
      props: { column: { valueType: 'percent' }, value: 12 },
    })
    expect(percent.findComponent(InputNumber).props('addonAfter')).toBe('%')
  })

  it('formats readonly enum, ranges, password, money, percent and date-like values', () => {
    const options = [{ label: 'Enabled', value: 'enabled' }]
    const dateLike = { format: vi.fn(() => '2026-08-23') }

    expect(formatProValue('enabled', options, 'select')).toBe('Enabled')
    expect(formatProValue(['enabled', 'missing'], options, 'checkbox')).toBe('Enabled, missing')
    expect(formatProValue(['start', 'end'], [], 'dateRange')).toBe('start ~ end')
    expect(formatProValue('secret', [], 'password')).toBe('••••••')
    expect(formatProValue(12, [], 'money')).toBe('¥12')
    expect(formatProValue(80, [], 'percent')).toBe('80%')
    expect(formatProValue(dateLike, [], 'date')).toBe('2026-08-23')
    expect(formatProValue({ nested: true }, [], 'text')).toBe('-')
    expect(
      formatProValue('complex', [{ label: { unsafe: true }, value: 'complex' }], 'select'),
    ).toBe('complex')
    expect(dateLike.format).toHaveBeenCalledWith('YYYY-MM-DD')
  })

  it('loads column request options for the shared search and edit control', async () => {
    const request = vi.fn(async () => [
      { label: 'Enabled', value: 'enabled' },
      { text: 'Disabled', key: 'disabled', disabled: true },
    ])
    const wrapper = shallowMount(ProTable, {
      props: {
        columns: [
          {
            dataIndex: 'status',
            title: 'Status',
            valueType: 'select',
            params: { scope: 'active' },
            request,
          },
        ],
        dataSource: [{ id: 1, status: 'enabled' }],
        editable: { type: 'multiple' },
        pagination: false,
      },
    })
    await vi.waitFor(() => expect(request).toHaveBeenCalledWith({ scope: 'active' }))
    await flushPromises()

    const control = wrapper.findComponent(ValueTypeControl)
    expect(control.props('options')).toEqual([
      { label: 'Enabled', value: 'enabled', disabled: false },
      { label: 'Disabled', value: 'disabled', disabled: true },
    ])
    expect(control.props('loading')).toBe(false)
  })
})
