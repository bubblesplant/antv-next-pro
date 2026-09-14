import type { Component } from 'vue'

import FieldControl from './FieldControl.vue'
import ProFormCaptcha from './ProFormCaptcha.vue'
import ProFormCheckbox from './ProFormCheckbox.vue'
import ProFormDatePicker from './ProFormDatePicker.vue'
import ProFormDateRangePicker from './ProFormDateRangePicker.vue'
import ProFormDateTimePicker from './ProFormDateTimePicker.vue'
import ProFormDateTimeRangePicker from './ProFormDateTimeRangePicker.vue'
import ProFormDigit from './ProFormDigit.vue'
import ProFormField from './ProFormField.vue'
import ProFormMoney from './ProFormMoney.vue'
import ProFormRadioGroup from './ProFormRadioGroup.vue'
import ProFormSegmented from './ProFormSegmented.vue'
import ProFormSelect from './ProFormSelect.vue'
import ProFormSlider from './ProFormSlider.vue'
import ProFormSwitch from './ProFormSwitch.vue'
import ProFormTextRaw from './ProFormText.vue'
import ProFormTextArea from './ProFormTextArea.vue'
import ProFormTextPassword from './ProFormTextPassword.vue'
import ProFormTreeSelect from './ProFormTreeSelect.vue'
import ProFormUploadButton from './ProFormUploadButton.vue'
import ProFormUploadDragger from './ProFormUploadDragger.vue'
import ReadonlyField from './ReadonlyField.vue'

export const ProFormText = Object.assign(ProFormTextRaw, {
  Password: ProFormTextPassword,
}) as typeof ProFormTextRaw & { readonly Password: typeof ProFormTextPassword }

export const ProFormRadio = Object.freeze({
  Group: ProFormRadioGroup,
})

export const proFormFieldComponents: Array<readonly [publicName: string, component: Component]> = [
  ['ProFormText', ProFormText],
  ['ProFormDigit', ProFormDigit],
  ['ProFormTextPassword', ProFormTextPassword],
  ['ProFormTextArea', ProFormTextArea],
  ['ProFormCaptcha', ProFormCaptcha],
  ['ProFormDatePicker', ProFormDatePicker],
  ['ProFormDateTimePicker', ProFormDateTimePicker],
  ['ProFormDateRangePicker', ProFormDateRangePicker],
  ['ProFormDateTimeRangePicker', ProFormDateTimeRangePicker],
  ['ProFormSelect', ProFormSelect],
  ['ProFormTreeSelect', ProFormTreeSelect],
  ['ProFormCheckbox', ProFormCheckbox],
  ['ProFormRadioGroup', ProFormRadioGroup],
  ['ProFormSlider', ProFormSlider],
  ['ProFormSwitch', ProFormSwitch],
  ['ProFormUploadButton', ProFormUploadButton],
  ['ProFormUploadDragger', ProFormUploadDragger],
  ['ProFormMoney', ProFormMoney],
  ['ProFormSegmented', ProFormSegmented],
]

export {
  FieldControl,
  ProFormCaptcha,
  ProFormCheckbox,
  ProFormDatePicker,
  ProFormDateRangePicker,
  ProFormDateTimePicker,
  ProFormDateTimeRangePicker,
  ProFormDigit,
  ProFormField,
  ProFormMoney,
  ProFormRadioGroup,
  ProFormSegmented,
  ProFormSelect,
  ProFormSlider,
  ProFormSwitch,
  ProFormTextArea,
  ProFormTextPassword,
  ProFormTreeSelect,
  ProFormUploadButton,
  ProFormUploadDragger,
  ReadonlyField,
}
export * from './fieldRegistry'
export * from './options'
export * from './readonly'
export type * from './types'
export * from './useFieldOptions'
