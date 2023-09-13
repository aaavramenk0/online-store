import axios from 'axios'

import { SERVER_URL } from '@/constants'

export const instance = axios.create({
	baseURL: `${SERVER_URL}/api/v1`,
	withCredentials: true
})
