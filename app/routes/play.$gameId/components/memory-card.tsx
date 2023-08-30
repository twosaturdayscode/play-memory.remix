interface MemoryCardProps {
	onClick(id: string): void
	isUncovered: boolean
	id: string
	image: {
		src: string
	}
	disabled: boolean
}

export function MemoryCard(props: MemoryCardProps) {
	return (
		<button
			type="button"
			className="perspective-100 h-full w-full"
			onClick={() => props.onClick(props.id)}
			disabled={props.disabled}
		>
			<div
				className={`relative aspect-[4/3] w-full transition duration-300 perspective-[2000] ${
					!props.isUncovered && !props.disabled && 'hover:rotate-y-[30deg]'
				}`}
			>
				<div
					className={`absolute left-0 top-0 h-full w-full rounded-md border-2 border-stone-900 transition-all duration-300 ${
						props.isUncovered && 'rotate-y-180'
					}`}
					style={{
						transformStyle: 'preserve-3d',
					}}
				>
					{/* Front of the *covered* card */}
					<div className="absolute h-full w-full rounded-md bg-stone-50 backface-hidden">
						<div className="h-full w-full bg-stone-300"></div>
					</div>
					{/* Back of the *covered* card */}
					<div className="absolute h-full w-full bg-red-300 rotate-y-180 backface-hidden">
						<div
							className="h-full w-full rounded-md bg-cover bg-clip-content bg-center bg-no-repeat"
							style={{ backgroundImage: `url(${props.image.src})` }}
						></div>
					</div>
				</div>
			</div>
		</button>
	)
}
