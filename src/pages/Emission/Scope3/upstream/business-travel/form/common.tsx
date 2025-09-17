import { defineStepper } from '@stepperize/react'
import * as v from 'valibot'

export const filterParams = {
  params: {
    filter: {
      include: [
        {
          relation: 'travelers',
          scope: {
            fields: ['id', 'businessTravelId', 'employeeRegistryId', 'logs'],
            include: [{ relation: 'employeeRegistry', scope: { fields: ['id', 'name'] } }],
          },
        },
      ],
    },
  },
}

export const BusinessTravelSchema = v.object({
  date: v.date('Please select date'),
  desc: v.pipe(v.string(), v.nonEmpty('Please enter you "description"'), v.maxLength(300)),
  groupById: v.pipe(v.number(), v.minValue(1)),
  id: v.optional(v.number()),
  purpose: v.pipe(v.string(), v.nonEmpty('Please enter your "Travel purpose"'), v.minLength(3), v.maxLength(64)),
  travelers: v.pipe(
    v.array(
      v.object({
        // this should be number, but RHF generate uuid on create
        id: v.optional(v.union([v.number(), v.pipe(v.string(), v.transform(() => undefined))])), //  prettier-ignore
        employeeRegistryId: v.number('Please select any employee'),
        employeeRegistry: v.optional(v.object({ id: v.number(), name: v.string() })),
        businessTravelId: v.optional(v.number()),
        logs: v.pipe(
          v.array(
            v.object({
              addressFrom: v.pipe(v.string(), v.nonEmpty('Please enter your "address from"')),
              addressTo: v.pipe(v.string(), v.nonEmpty('Please enter your "address to"')),
              type: v.union([v.literal('distance'), v.literal('litre')]),
              input: v.pipe(v.number(), v.minValue(0)),
              EF_MobileCombustionDistanceId: v.pipe(v.string(), v.nonEmpty('Please enter your "vehicle id"')),
              fuelType: v.optional(v.string()),
            }),
          ),
          v.minLength(1, 'Please add logs for this employee'),
        ),
      }),
    ),
    v.minLength(1, 'Please add travelers to proceed'),
  ),

  // not needed in BE
  createAnother: v.optional(v.boolean(), false),
})
export type TBusinessTravelSchema = v.InferInput<typeof BusinessTravelSchema>

export const payloadSchema = v.pipe(
  BusinessTravelSchema,

  // @ts-ignore
  v.rawCheck(({ dataset, addIssue }) => {
    if (dataset.typed) {
      const travelers = dataset.value.travelers

      const _addIssue = (index: number, message: string) =>
        addIssue({ message, path: [{ input: travelers[index], key: `travelers.${index}.employeeRegistryId`, origin: 'value', type: 'unknown', value: travelers[index].employeeRegistryId }] }) // prettier-ignore

      for (let i = 0; i <= travelers.length - 1; i++) {
        for (let k = 0; k <= travelers.length - 1; k++) {
          if (i === k) continue

          if (travelers[i].employeeRegistryId === travelers[k].employeeRegistryId) {
            _addIssue(i, 'Duplicate!')
            _addIssue(k, 'Duplicate!')
          }
        }
      }
    }
  }),

  v.transform(({ createAnother, travelers, ...payload }: TBusinessTravelSchema) => ({
    ...payload,
    travelers: travelers.map(({ employeeRegistry, ...rest }) => rest),
  })),
)

export const { useStepper, steps, utils } = defineStepper(
  {
    id: 'general-info',
    title: 'General Info',
    description: 'Travelling purpose, date, desc, etc...',
    schema: v.omit(BusinessTravelSchema, ['travelers']),
  },
  {
    id: 'travellers',
    title: 'Travellers Info',
    description: 'Each travel information, vehicle, from, to, and input value till destination',
    schema: BusinessTravelSchema.entries.travelers,
  },
)
