import { cn } from '@/lib/utils'
import { RootProvider } from '@/providers'
import type { Metadata } from 'next'

import '@/styles/globals.scss'
import { causten, coreSans } from '@/utils'



export const metadata: Metadata = {
	title: 'Euphoria'
}

export default function RootLayout({
	children
}: {
	children: React.ReactNode
}) {
	return (
		<html lang="en">
			<body
				className={cn(
					causten.variable,
					causten.className,
					coreSans.variable,
					coreSans.className
				)}
			>
				<RootProvider>{children}</RootProvider>
			</body>
		</html>
	)
}
