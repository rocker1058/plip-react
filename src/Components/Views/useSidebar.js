import React, { useState, useEffect } from 'react'
import { useSelector } from 'react-redux'
import { Link } from 'react-router-dom'

import { usePermissionManager } from '../Common'

function useSidebar(location) {
	const { sidebar } = useSelector(state => ({
		sidebar: state.navbars.sidebar,
	}))
	const { distinctCompanies, hasPliPPermission, hasSomePermissionInCompany } = usePermissionManager()
	const user = useSelector(state => state.authentication.user)
	const [ userAccess, setUserAccess ] = useState(false)
	const [ plipUserAccess, setPlipUserAccess ] = useState(false)
	const [ reportAccess, setReportAccess ] = useState(false)
	const [ establishmentsAccess, setEstablishmentAccess ] = useState(false)
	const [ options, setOptions ] = useState([])
	
	const evaluatePermissions = async () => {
		const allEstablishments = await hasSomePermissionInCompany({ company: '*' })
		const establishmentsPermission = distinctCompanies.length > 1 || allEstablishments
		const userPermission = await hasPliPPermission({ permission: 'listPliPUsers' })
		const plipUserPermission = await hasPliPPermission({ permission: 'managePliPUsers' })
		const plipCommercialPermission = await hasPliPPermission({ permission: 'downloadPliPCommercialReport' })
		const plipEnvironmentalPermission = await hasPliPPermission({ permission: 'downloadPliPEnvironmentalReport' })
		setUserAccess(userPermission)
		setEstablishmentAccess(establishmentsPermission)
		setPlipUserAccess(plipUserPermission)
		setReportAccess(plipCommercialPermission || plipEnvironmentalPermission)
		setOptions([ establishmentsPermission, userPermission, plipUserPermission,plipCommercialPermission || plipEnvironmentalPermission ])
	}

	useEffect(() => {
		evaluatePermissions()
	}, [ user ])

	const Sidebar = function() {
		return <div className="col-12">
			<div className="row justify-content-center">
				<ul className="nav col-12 px-0">
					{ establishmentsAccess &&
						<li className={`nav-item col-12 ${location.pathname.includes('/establecimientos') && !location.pathname.includes('/PliP') ? 'active' : ''}`}>
							<Link className="nav-link" to="/establecimientos">
								<span className="plip-icon establecimientos"></span>
								<span>Establecimientos</span>
							</Link>
						</li>
					}
					{plipUserAccess &&
						<li className={`nav-item col-12 ${location.pathname.includes('/establecimientos/PliP/usuarios') ? 'active' : ''}`}>
							<Link className="nav-link" to="/establecimientos/PliP/usuarios">
								<span className="plip-icon usuarios"></span>
								<span>Usuarios plataforma PliP</span>
							</Link>
						</li>
					}
					{userAccess &&
						<li className={`nav-item col-12 ${location.pathname === '/usuarios' ? 'active' : ''}`}>
							<Link className="nav-link" to="/usuarios">
								<span className="plip-icon usuarios"></span>
								<span>Usuarios Aplicación PliP</span>
							</Link>
						</li>
					}
					{reportAccess &&
						<li className={`nav-item col-12 ${location.pathname === '/plip/reportes' ? 'active' : ''}`}>
							<Link className="nav-link" to="/plip/reportes">
								<span className="plip-icon usuarios"></span>
								<span>Reportes PliP</span>
							</Link>
						</li>
					}
				</ul>
			</div>
		</div>
	}
	return {
		Sidebar,
		show: sidebar.visibility && options.some(option => option === true),
	}
	
}

export default useSidebar
