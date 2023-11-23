import { SET_TITLE } from '../Actions'

const initialState = {
	title: '',
}

export default (state = initialState, action) => {
	switch (action.type) {
	case SET_TITLE: {
		const { type, title } = action
		return {
			...state,
			title,
		}
	}
	default:
		return state
	}
}
