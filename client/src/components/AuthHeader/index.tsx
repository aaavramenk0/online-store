import Image from 'next/image'

import { logo } from '@/assets/images'
import { cn } from '@/lib'

import {SearchBar} from './components'
import styles from './AuthHeader.module.scss'

const AuthHeader = () => {
	return <header>
		<div className={cn('__container', styles.container)}>
			<Image src={logo} alt='logo' className={styles.logo} />
			<SearchBar />
		</div>
	</header>
}

export default AuthHeader
