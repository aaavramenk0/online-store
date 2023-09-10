import '@/styles/globals.scss'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

const queryClient = new QueryClient({
	defaultOptions: {
		queries: {
			refetchOnWindowFocus: false
		}
	}
})

function App() {
	return <QueryClientProvider client={queryClient}></QueryClientProvider>
}

export default App
