import React, { useEffect } from 'react'
import { useDispatch } from 'react-redux'

import { SET_NAVBAR_PROPERTIES, SET_SIDEBAR_PROPERTIES } from '../../Redux/Actions'
import logo from '../../Assets/img/logo_plip_completo.png'
import homebg from '../../Assets/img/bghome.png'

function NotFound() {
	const dispatch = useDispatch()
	useEffect(() => {
		dispatch({ type: SET_NAVBAR_PROPERTIES, visibility: false })
		dispatch({ type: SET_SIDEBAR_PROPERTIES, visibility: false })
	}, [])
	return (
		<div className="col-12 full-height login">
			<div className="row justify-content-start">
				<div className="loginForm col-12 col-lg-6">
					<div className="row justify-content-center justify-content-lg-start">
						<div className="col-6 offset-lg-2 mt-5">
							<img className="img-fluid" src={logo} alt="Trazabilidad" />
						</div>
					</div>
					<div className="row justify-content-center">
						<div className="col-12 col-lg-8">
							<h1 className="text-center">404</h1>
							<p className="text-center">Lo sentimos, esta página no existe o no se encuentra disponible.</p>
						</div>
					</div>
					<div className="row mt-5">
						<div className="col-12 text-center">
							<a className="forgot-password text-center" href="/">Regresar a PliP</a>
						</div>
					</div>
				</div>
				<div className="homebg col-12 col-lg-6 px-0 d-none d-lg-block">
					<img className="img-fluid" src={homebg} alt="homebg plip" />
				</div>
			</div>
		</div>
	)
}

export default NotFound
