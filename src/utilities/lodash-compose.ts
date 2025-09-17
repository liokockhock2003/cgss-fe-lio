import { omit, over, pick } from 'lodash-es'

export const splitProps = over([pick, omit])
