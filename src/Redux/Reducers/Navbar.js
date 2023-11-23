import { SET_NAVBAR_PROPERTIES, SET_SIDEBAR_PROPERTIES, LOG_OUT } from '../Actions'

const initialState = {
	navbar: {
		visibility: false,
	},
	sidebar: {
		show: false,
		open: false,
	},
}

export default (state = initialState, action) => {
	switch (action.type) {
	case SET_NAVBAR_PROPERTIES: {
		const { type, ...properties } = action
		return {
			...state,
			navbar: {
				...state.navbar,
				...properties,
			},
		}
	}
	case SET_SIDEBAR_PROPERTIES: {
		const { type, ...properties } = action
		return {
			...state,
			sidebar: {
				...state.sidebar,
				...properties,
			},
		}
	}
	case LOG_OUT: {
		return initialState
	}
	default:
		return state
	}
}

