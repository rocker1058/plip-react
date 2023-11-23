import React from 'react'
import PropTypes from 'prop-types'
import { Link, useHistory } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'

import { SET_SIDEBAR_PROPERTIES, LOG_OUT } from '../../Redux/Actions'
import { signOut } from '../Common'
import logo from '../../Assets/img/logo_plip_completo.png'
import { useApolloClient } from 'react-apollo'

function Navbar({ open }) {
	const history = useHistory()
	const dispatch = useDispatch()
	const client = useApolloClient()
	const { user } = useSelector(state => ({
		user: state.authentication.user,
	}))

	const logout = async (e) => {
		e.preventDefault()
		await signOut()
		client.resetStore()
		dispatch({ type: LOG_OUT })
		history.replace({
			pathname: '/',
		})
	}

	const toggleSidebar = () => dispatch({ type: SET_SIDEBAR_PROPERTIES, open: !open })

	return (
		<nav className="navbar fixed-top navbar-expand-xl navbar-light">
			<a href="#" onClick={toggleSidebar} className={`burger ${open ? 'clicked' : ''}`} >
				<span></span>
			</a>
			<div className="navbar-brand logo"><img className="img-fluid" src={logo} alt="PliP" /></div>
			{user && <ul className="list-inline ml-auto nav-options">
				<li className="list-inline-item dropdown settings d-lg-inline-block">
					<a className="nav-link dropdown-toggle" href="#" id="navbarDropdown" role="button" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
						<span className="fullname">{user.name} {user.lastName}</span>
					</a>
					<div className="dropdown-menu menu-navbar" aria-labelledby="dropdownMenuLink">
						<Link className="dropdown-item" to="/cambio-contrasenia">Cambiar contraseña</Link>
						<div className="dropdown-divider"></div>
						<Link className="dropdown-item" onClick={logout} to="/">Salir</Link>
					</div>
				</li>
			</ul>}
		</nav>
	)
}

Navbar.propTypes = {
	open: PropTypes.bool,
}

export default Navbar
