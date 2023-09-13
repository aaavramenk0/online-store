import {QueryClient, QueryClientProvider} from '@tanstack/react-query'
import { ReactNode } from 'react'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false
    }
  }
})

interface IQueryProviderProps {
  children: ReactNode
}

const QueryProvider =  ({children}:IQueryProviderProps) => {
  return <QueryClientProvider client={queryClient}>
    {children}
  </QueryClientProvider>
}

export default QueryProvider