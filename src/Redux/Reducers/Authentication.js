import {
	LOG_IN, LOG_OUT,
} from '../Actions'

const initialState = {
	user: null,
}

export default (state = initialState, action) => {
	switch (action.type) {
	case LOG_IN: {
		const { user } = action
		return {
			user,
		}
	}
	case LOG_OUT: {
		return {
			user: null,
		}
	}
	default:
		return state
	}
}
