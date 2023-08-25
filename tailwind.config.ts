import { type Config } from 'tailwindcss'
import plugin from 'tailwindcss/plugin'
import defaultConfig from 'tailwindcss/defaultConfig'

export default {
	content: ['app/**/*.tsx'],
	theme: {
		extend: {},
	},
	plugins: [
		plugin(
			function ({ matchUtilities, theme, e }) {
				matchUtilities(
					{
						'rotate-y': value => {
							return {
								transform: `rotateY(${value})`,
							}
						},
					},
					{
						values: theme('rotateY'),
					},
				)
			},
			{
				theme: {
					rotateY: defaultConfig.theme?.rotate,
				},
			},
		),
		plugin(function ({ addUtilities }) {
			addUtilities({
				'.backface-visible': {
					'backface-visibility': 'visible',
					'-moz-backface-visibility': 'visible',
					'-webkit-backface-visibility': 'visible',
					'-ms-backface-visibility': 'visible',
				},
				'.backface-hidden': {
					'backface-visibility': 'hidden',
					'-moz-backface-visibility': 'hidden',
					'-webkit-backface-visibility': 'hidden',
					'-ms-backface-visibility': 'hidden',
				},
			})
		}),
	],
} satisfies Config
