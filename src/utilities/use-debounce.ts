import { debounce } from 'lodash-es'
import { UseFormReturn } from 'react-hook-form'

export function useReactHookDebounceFormValue<T>({ form, ms }: { ms?: number; form: UseFormReturn<T> }) {
  const [payload, setPayload] = useState<T>(undefined)

  useEffect(() => {
    const debouncedCb = debounce((formValue) => setPayload(formValue), ms ?? 500)
    const subscription = form.watch(debouncedCb)
    return () => subscription.unsubscribe()
  }, [form.watch])

  return payload
}
