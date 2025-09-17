import { omit } from 'lodash-es'
import * as v from 'valibot'

export const UdtdSchema = ({ from, to }) =>
  v.pipe(
    v.object({
      id: v.optional(v.number()),
      date: v.pipe(v.date('Please select date'), v.minValue(from), v.maxValue(to)),
      desc: v.pipe(v.optional(v.string()), v.maxLength(300)),
      groupById: v.pipe(v.number(), v.minValue(1)),
      name: v.pipe(v.string(), v.nonEmpty('Please enter your "Name"'), v.minLength(3), v.maxLength(64)),
      type: v.union([v.string('downstream'), v.string('upstream')]),
      metadata: v.object({
        distance: v.pipe(v.number(), v.minValue(0)),
        addressFrom: v.pipe(
          v.string(),
          v.nonEmpty('Please enter your "address"'),
          v.maxLength(150, 'Your "address" is too long.'),
        ),
        addressTo: v.pipe(
          v.string(),
          v.nonEmpty('Please enter your "Office Address"'),
          v.maxLength(150, 'Your "Office Address" is too long.'),
        ),
        fuelType: v.pipe(v.string(), v.nonEmpty('Please enter your "fuel type"')), // not stored in DB
        EF_MobileCombustionDistanceId: v.pipe(v.string(), v.nonEmpty('Please enter your "vehicle type"')),
      }),

      // not needed in BE
      createAnother: v.optional(v.boolean(), false),
    }),

    v.transform(({ createAnother, metadata, ...payload }) => ({
      ...payload,
      metadata: omit(metadata, 'fuelType'),
    })),
  )
