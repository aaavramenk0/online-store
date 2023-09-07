import { ReactNode } from 'react'
import QueryProvider from './QueryProvider'

interface IRootProviderProps {
	children: ReactNode
}

export const RootProvider = ({ children }: IRootProviderProps) => {
	return <QueryProvider>{children}</QueryProvider>
}
