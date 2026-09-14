import type {
  ButtonProps,
  CheckboxGroupProps,
  CheckboxProps,
  DatePickerProps,
  FormItemProps,
  InputNumberProps,
  InputPasswordProps,
  InputProps,
  RangePickerProps,
  RadioGroupProps,
  SegmentedProps,
  SelectProps,
  SliderProps,
  SwitchProps,
  TextAreaProps,
  TreeSelectProps,
  UploadDraggerProps,
  UploadFile,
  UploadProps,
} from 'antdv-next'
import type { VNodeChild } from 'vue'

import type { ProDataIndex, ProValueEnumItem, ProValueType } from '../types'

export type ProFormFieldMode = 'form-item' | 'field'
export type ProFormFieldName = ProDataIndex
export type ProFormFieldValue = unknown

export type ProFormOptionValue<ModelValue> = ModelValue extends null | undefined
  ? never
  : ModelValue extends readonly (infer OptionValue)[]
    ? OptionValue
    : ModelValue

export interface ProFormFieldOption<Value = unknown> {
  label: VNodeChild
  value: Value
  disabled?: boolean
  [key: string]: unknown
}

export interface ProFormValueEnumItem<Value = unknown> extends ProValueEnumItem<Value> {
  value?: Value
}

export type ProFormValueEnum<Value = unknown> =
  | Record<string | number, string | ProFormValueEnumItem<Value>>
  | ReadonlyMap<Value, string | ProFormValueEnumItem<Value>>

export type ProFormFieldRequest<
  OptionValue = unknown,
  Params extends Record<string, unknown> = Record<string, unknown>,
> = (
  params?: Params,
) => Promise<Array<ProFormFieldOption<OptionValue> | Record<string, unknown> | OptionValue>>

export interface ProFormBaseFieldProps<
  Value = unknown,
  FieldProps extends object = Record<string, unknown>,
> {
  modelValue?: Value
  name?: ProFormFieldName
  label?: VNodeChild
  rules?: FormItemProps['rules']
  fieldMode?: ProFormFieldMode
  fieldProps?: Partial<FieldProps>
  formItemProps?: Partial<FormItemProps>
  disabled?: boolean
  readonly?: boolean
  emptyText?: VNodeChild
  readonlyRender?: (value: Value) => VNodeChild
}

export interface ProFormOptionFieldProps<
  OptionValue = unknown,
  Params extends Record<string, unknown> = Record<string, unknown>,
> {
  options?: Array<ProFormFieldOption<OptionValue>>
  valueEnum?: ProFormValueEnum<OptionValue>
  request?: ProFormFieldRequest<OptionValue, Params>
  params?: Params
}

export interface ProFormFieldProps<
  ModelValue = unknown,
  OptionValue = ProFormOptionValue<ModelValue>,
  FieldProps extends object = Record<string, unknown>,
  Params extends Record<string, unknown> = Record<string, unknown>,
>
  extends
    ProFormBaseFieldProps<ModelValue, FieldProps>,
    ProFormOptionFieldProps<OptionValue, Params> {
  valueType?: ProValueType
}

export type ProFormTextProps = ProFormBaseFieldProps<string | undefined, InputProps>

export type ProFormTextPasswordProps = ProFormBaseFieldProps<string | undefined, InputPasswordProps>

export type ProFormTextAreaProps = ProFormBaseFieldProps<string | undefined, TextAreaProps>

export interface ProFormDigitProps extends ProFormBaseFieldProps<
  number | string | null,
  InputNumberProps
> {
  precision?: InputNumberProps['precision'] | false
  min?: InputNumberProps['min'] | false
}

export interface ProFormMoneyProps extends ProFormBaseFieldProps<
  number | string | null,
  InputNumberProps
> {
  prefix?: InputNumberProps['prefix'] | false
}

export type ProFormDateValue = DatePickerProps['value']
export type ProFormDateRangeValue = RangePickerProps['value']

export type ProFormDatePickerProps = ProFormBaseFieldProps<ProFormDateValue, DatePickerProps>

export interface ProFormDateTimePickerProps extends ProFormBaseFieldProps<
  ProFormDateValue,
  DatePickerProps
> {
  showTime?: DatePickerProps['showTime']
}

export type ProFormDateRangePickerProps = ProFormBaseFieldProps<
  ProFormDateRangeValue,
  RangePickerProps
>

export interface ProFormDateTimeRangePickerProps extends ProFormBaseFieldProps<
  ProFormDateRangeValue,
  RangePickerProps
> {
  showTime?: RangePickerProps['showTime']
}

export interface ProFormSelectProps<
  ModelValue = SelectProps['value'],
  OptionValue = ProFormOptionValue<ModelValue>,
  Params extends Record<string, unknown> = Record<string, unknown>,
>
  extends
    ProFormBaseFieldProps<ModelValue, SelectProps>,
    ProFormOptionFieldProps<OptionValue, Params> {}

export interface ProFormTreeSelectProps<
  ModelValue = TreeSelectProps['value'],
  OptionValue = ProFormOptionValue<ModelValue>,
  Params extends Record<string, unknown> = Record<string, unknown>,
>
  extends
    ProFormBaseFieldProps<ModelValue, TreeSelectProps>,
    ProFormOptionFieldProps<OptionValue, Params> {}

export type ProFormCheckboxValue = CheckboxProps['checked'] | CheckboxGroupProps['value']

export interface ProFormCheckboxProps<
  ModelValue = ProFormCheckboxValue,
  OptionValue = ProFormOptionValue<ModelValue>,
  Params extends Record<string, unknown> = Record<string, unknown>,
>
  extends
    ProFormBaseFieldProps<ModelValue, CheckboxProps | CheckboxGroupProps>,
    ProFormOptionFieldProps<OptionValue, Params> {
  layout?: 'horizontal' | 'vertical'
}

export interface ProFormRadioGroupProps<
  ModelValue = RadioGroupProps['value'],
  OptionValue = ProFormOptionValue<ModelValue>,
  Params extends Record<string, unknown> = Record<string, unknown>,
>
  extends
    ProFormBaseFieldProps<ModelValue, RadioGroupProps>,
    ProFormOptionFieldProps<OptionValue, Params> {}

export type ProFormSliderProps = ProFormBaseFieldProps<number | number[] | undefined, SliderProps>

export type ProFormSwitchProps = ProFormBaseFieldProps<SwitchProps['checked'], SwitchProps>

export type ProFormUploadButtonProps = ProFormBaseFieldProps<UploadFile[], UploadProps>

export type ProFormUploadDraggerProps = ProFormBaseFieldProps<UploadFile[], UploadDraggerProps>

export interface ProFormSegmentedProps<
  ModelValue = SegmentedProps['value'],
  OptionValue = ProFormOptionValue<ModelValue>,
  Params extends Record<string, unknown> = Record<string, unknown>,
>
  extends
    ProFormBaseFieldProps<ModelValue, SegmentedProps>,
    ProFormOptionFieldProps<OptionValue, Params> {}

export interface ProFormCaptchaProps extends ProFormBaseFieldProps<string | undefined, InputProps> {
  onGetCaptcha: () => void | boolean | Promise<void | boolean>
  countDown?: number
  captchaText?: VNodeChild
  countDownText?: (seconds: number) => VNodeChild
  buttonProps?: Partial<ButtonProps>
}

export interface ProFormCaptchaInstance {
  resetCountdown: () => void
}
