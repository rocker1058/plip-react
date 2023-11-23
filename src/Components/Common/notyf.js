import React from 'react'
import { Notyf } from 'notyf'

export default React.createContext(
	new Notyf({
		duration: 5000,
		types: [
			{
				type: 'success',
				backgroundColor: '#0BA93C',
			},
			{
				type: 'error',
				backgroundColor: 'indianred',
				duration: 10000,
			},
		],
	}),
)