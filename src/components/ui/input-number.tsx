import RcInputNumber from 'rc-input-number'
import { InputNumberProps } from 'rc-input-number/es/InputNumber'
import './input-number.scss'

const InputNumber = forwardRef<HTMLInputElement, InputNumberProps>((props, ref) => (
  <RcInputNumber {...props} ref={ref} />
))
InputNumber.displayName = 'InputNumber'

export { InputNumber }
