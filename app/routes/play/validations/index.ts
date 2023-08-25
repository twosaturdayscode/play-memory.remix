import { z } from 'zod'

const CardFormSchema = z.discriminatedUnion('_action', [
	z.object({
		_action: z.literal('select-card'),
		cardId: z.coerce.number(),
	}),
	z.object({
		_action: z.literal('check-selection'),
	}),
])

// type ValidCardFormData = z.infer<typeof CardFormSchema>

export const validateFormData = (f: any) => CardFormSchema.parse(f)
