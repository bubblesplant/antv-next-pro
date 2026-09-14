import {
  computed,
  onScopeDispose,
  readonly,
  ref,
  shallowRef,
  unref,
  watch,
  type ComputedRef,
  type MaybeRef,
  type Ref,
} from 'vue'

import {
  resolveLocalFieldOptions,
  stableSerialize,
  type ResolvableProFormValueEnum,
} from './options'
import type { ProFormFieldOption, ProFormFieldRequest } from './types'

export interface UseFieldOptionsInput<
  OptionValue = unknown,
  Params extends Record<string, unknown> = Record<string, unknown>,
> {
  options?: MaybeRef<readonly unknown[] | undefined>
  fieldOptions?: MaybeRef<readonly unknown[] | undefined>
  valueEnum?: MaybeRef<ResolvableProFormValueEnum<OptionValue> | undefined>
  request?: MaybeRef<ProFormFieldRequest<OptionValue, Params> | undefined>
  params?: MaybeRef<Params | undefined>
  onRequestError?: (error: unknown) => void
}

export interface UseFieldOptionsReturn<OptionValue = unknown> {
  options: ComputedRef<Array<ProFormFieldOption<OptionValue>>>
  loading: Readonly<Ref<boolean>>
  error: Readonly<Ref<unknown>>
  refresh: () => Promise<void>
}

export function useFieldOptions<
  OptionValue = unknown,
  Params extends Record<string, unknown> = Record<string, unknown>,
>(source: UseFieldOptionsInput<OptionValue, Params>): UseFieldOptionsReturn<OptionValue> {
  const remoteOptions = shallowRef<Array<ProFormFieldOption<OptionValue>>>([])
  const hasRemoteResult = ref(false)
  const loading = ref(false)
  const error = shallowRef<unknown>()
  let active = true
  let sequence = 0

  const localOptions = computed(() =>
    resolveLocalFieldOptions<OptionValue>({
      options: unref(source.options),
      fieldOptions: unref(source.fieldOptions),
      valueEnum: unref(source.valueEnum),
    }),
  )

  const options = computed(() => {
    const request = unref(source.request)
    return request && hasRemoteResult.value ? remoteOptions.value : localOptions.value
  })

  async function refresh(): Promise<void> {
    if (!active) return

    const request = unref(source.request)
    const currentSequence = ++sequence

    if (!request) {
      hasRemoteResult.value = false
      remoteOptions.value = []
      error.value = undefined
      loading.value = false
      return
    }

    loading.value = true
    error.value = undefined
    try {
      const result = await request(unref(source.params))
      if (!active || currentSequence !== sequence) return

      remoteOptions.value = resolveLocalFieldOptions<OptionValue>({ options: result })
      hasRemoteResult.value = true
      error.value = undefined
    } catch (requestError) {
      if (!active || currentSequence !== sequence) return

      error.value = requestError
      source.onRequestError?.(requestError)
    } finally {
      if (active && currentSequence === sequence) loading.value = false
    }
  }

  watch(
    [() => unref(source.request), () => stableSerialize(unref(source.params))],
    () => {
      void refresh()
    },
    { immediate: true },
  )

  onScopeDispose(() => {
    active = false
    sequence += 1
  })

  return {
    options,
    loading: readonly(loading),
    error: readonly(error),
    refresh,
  }
}
