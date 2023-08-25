import type { V2_MetaFunction } from '@remix-run/cloudflare'

export const meta: V2_MetaFunction = () => {
	return [{ title: 'Home | Memory Remix' }]
}

export default function Index() {
	return (
		<main className="mx-auto max-w-3xl py-36">
			<div className="space-y-10">
				<header className="flex flex-col gap-5">
					<h1 className="text-3xl font-semibold">Welcome to Memory Remix!</h1>
					<p className="text-stone-600">
						This project is a simple demo to train on SOLID principles and
						Domain Driven Design.
						<br />
						Let's play a game!
					</p>
				</header>
				<div className="flex justify-end px-20">
					<a
						href="/play"
						className="py-3 px-7 rounded text-white bg-stone-950 border-stone-900 border-2 hover:bg-white hover:text-stone-900 transition duration-200"
					>
						<span className="text-xl font-bold">Play</span>
					</a>
				</div>
			</div>
		</main>
	)
}
