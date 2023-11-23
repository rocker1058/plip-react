import React, { useState, useEffect } from 'react'
import PropTypes from 'prop-types'
import { useDispatch } from 'react-redux'
import { useQuery } from 'react-apollo'
import { Link } from 'react-router-dom'

import { usePermissionManager } from '../../Common'
import { SET_NAVBAR_PROPERTIES, SET_SIDEBAR_PROPERTIES } from '../../../Redux/Actions'
import Reports from './LocationReport'
import Keys from './Keys'
import Invoices from '../Companies/Invoices'
import { GET_LOCATION } from './GraphQL'

function Location({ match }) {
	const company = match.params.idestablecimiento
	const location = match.params.idsucursal
	const [ tab, setTab ] = useState('keys')
	const [ parentCompany, setParentCompany ] = useState(null)
	const [ businessLineData, setBusinessLineData ] = useState(null)
	const [ invoicesAccess, setInvoicesAccess ] = useState(false)

	const dispatch = useDispatch()
	const { hasPermissionInLocation, getLocationParents, hasPermissionInCompany, hasPermissionInBusinessLine } = usePermissionManager()

	const [ keysAccess, setKeysAccess ] = useState(false)
	const [ locationReportAccess, setLocationReportAccess ] = useState(false)
	const [ editAccess, setEditAccess ] = useState(false)


	const loadParentData = async () => {
		const { company, businessLine } = await getLocationParents(location)
		setParentCompany(company)
		setBusinessLineData(businessLine)
	}

	const evaluatePermissions = async () => {
		const keysPermission = await hasPermissionInLocation({ location, permission: 'listKeys' })
		const locationReportPermission = await hasPermissionInLocation({ location, permission: 'listLocationReport' })
		const editPermissions = await hasPermissionInLocation({ location, permission: 'editLocation' })
		const invoicesPermissionCompany = await hasPermissionInCompany({ company, permission: 'viewEstablishmentInvoices' })
		const invoicesPermissionBusiness = await hasPermissionInBusinessLine({ businessLine: businessLineData && businessLineData.id, permission: 'viewBusinessLineInvoices' })
		const invoicesPermissionLocation = await hasPermissionInLocation({ location, permission: 'viewLocationInvoices' })
		setInvoicesAccess(invoicesPermissionCompany || invoicesPermissionBusiness || invoicesPermissionLocation ? true : false)

		setEditAccess(editPermissions)
		setKeysAccess(keysPermission)
		setLocationReportAccess(locationReportPermission)
		if (keysPermission && !locationReportPermission) {
			setTab('keys')
		}
		else if (!keysPermission && locationReportPermission) {
			setTab('reports')
		}
	}
	
	useEffect(() => {
		dispatch({ type: SET_NAVBAR_PROPERTIES, visibility: true })
		dispatch({ type: SET_SIDEBAR_PROPERTIES, visibility: true })
		evaluatePermissions()
		loadParentData()
	}, [])

	const { loading, data } = useQuery(GET_LOCATION, { variables: { id: location }, skip: !location })
	
	return (
		<div className="col-12 whitebg cliente">
			<div className="row">
				<div className="col-12 whitebg cliente-top">
					<div className="row">
						{!loading && data.Location &&
							<div className="col-12 px-4 cliente-info">
								<div className="row justify-content-between">
									<div className="col-md-10">
										<nav aria-label="breadcrumb">
											<ol className="breadcrumb">
												{parentCompany && <li className="breadcrumb-item">Establecimiento: <Link to={`/establecimientos/${parentCompany.id}`}>{parentCompany.name}</Link></li>}
												{businessLineData && <li className="breadcrumb-item">Línea de negocio: <Link to={`/establecimientos/${parentCompany.id}/lineasdenegocio/${businessLineData.id}`}>{businessLineData.name}</Link></li>}
												<li className="breadcrumb-item">Sucursal: {data.Location.location.name}</li>
											</ol>
										</nav>
									</div>
									{ editAccess &&
									<div className="col-12 col-md-2">
										<div className="row">
											{editAccess && parentCompany && <Link className="col-md-10 btn btn-primary" to={`/establecimientos/${company}/sucursales/${location}/informacion`}> Ver información</Link>}
										</div>
									</div>
									}
								</div>
								<div className="row">
									<div className="col-12 col-md-auto">
										<div className="form-group">
											<label>Dirección</label>
											<p>{data.Location.location.address.address}</p>
										</div>
									</div>
									<div className="col-12 col-md-auto">
										<div className="form-group">
											<label>Tags</label>
											<p>{data.Location.location.tags.join(', ')}</p>
										</div>
									</div>
								</div>
							</div>
						}
					</div>
					<div className="row px-5 mt-3">
						<ul className="nav nav-pills">
							{keysAccess &&
								<li className="nav-item">
									<a className={`nav-link ${tab === 'keys' ? 'active' : ''}`} href="#" onClick={() => setTab('keys')}>Credenciales</a>
								</li>
							}
							{locationReportAccess &&
								<li className="nav-item">
									<a className={`nav-link ${tab === 'reports' ? 'active' : ''}`} href="#" onClick={() => setTab('reports')}>Reporte por tags</a>
								</li>
							}
							<li className="nav-item">
								<a className={`nav-link ${tab === 'invoices' ? 'active' : ''}`} href="#" onClick={() => setTab('invoices')}>Facturas</a>
							</li>
						</ul>
					</div>
				</div>
			</div>
			{keysAccess && tab === 'keys' && <Keys location={location} company={company}></Keys>}
			{locationReportAccess && tab === 'reports' && <Reports location={location}></Reports>}
			{invoicesAccess && tab === 'invoices' && <Invoices company={company} location={location} businessLine={businessLineData ? businessLineData.id : '*'} type={'location'}/>}
		</div>
	)
}

Location.propTypes = {
	match: PropTypes.object,
}

export default Location
