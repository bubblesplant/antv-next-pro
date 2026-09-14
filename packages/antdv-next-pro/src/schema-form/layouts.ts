import type SchemaForm from '../SchemaForm.vue'
import FormLayout from './layouts/Form.vue'
import EmbedLayout from './layouts/Embed.vue'
import ModalFormLayout from './layouts/ModalForm.vue'
import DrawerFormLayout from './layouts/DrawerForm.vue'
import QueryFilterLayout from './layouts/QueryFilter.vue'
import LightFilterLayout from './layouts/LightFilter.vue'
import StepFormLayout from './layouts/StepForm.vue'
import StepsFormLayout from './layouts/StepsForm.vue'

// Preserve the existing generic props, events, slots and exposed-instance types for every alias.
export const Form = FormLayout as unknown as typeof SchemaForm
export const Embed = EmbedLayout as unknown as typeof SchemaForm
export const ModalForm = ModalFormLayout as unknown as typeof SchemaForm
export const DrawerForm = DrawerFormLayout as unknown as typeof SchemaForm
export const QueryFilter = QueryFilterLayout as unknown as typeof SchemaForm
export const LightFilter = LightFilterLayout as unknown as typeof SchemaForm
export const StepForm = StepFormLayout as unknown as typeof SchemaForm
export const StepsForm = StepsFormLayout as unknown as typeof SchemaForm
