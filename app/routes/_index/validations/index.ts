import { z } from 'zod'

const NewGameFormSchema = z.object({
	_action: z.literal('new-game'),
})

export const validateFormData = (f: any) => NewGameFormSchema.parse(f)
