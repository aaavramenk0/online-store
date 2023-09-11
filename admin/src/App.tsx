

import '@/styles/globals.scss'
import { ThemeProvider } from './components'


function App() {
	return (
		<ThemeProvider storageKey='euphoria-admin:theme'>
			<></>
		</ThemeProvider>
	)
}

export default App
