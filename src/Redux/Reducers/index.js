import { combineReducers } from 'redux'
import MainReducer from './Main'
import NavbarReducer from './Navbar'
import AuthenticationReducer from './Authentication'

export default combineReducers({
	authentication: AuthenticationReducer,
	main: MainReducer,
	navbars: NavbarReducer,
})
