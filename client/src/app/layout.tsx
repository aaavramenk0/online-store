import type { Metadata } from 'next'

import '@/assets/styles/globals.scss'
import { causten, coreSans } from '@/assets/fonts'

import { RootProvider } from '../components/providers'

import { cn } from '@/lib'

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
