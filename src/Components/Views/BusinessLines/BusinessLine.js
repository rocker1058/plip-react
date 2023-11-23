import React, { useState, useEffect } from 'react'
import PropTypes from 'prop-types'
import { useDispatch } from 'react-redux'
import { useQuery } from 'react-apollo'
import { Link } from 'react-router-dom'

import { usePermissionManager } from '../../Common'
import { SET_NAVBAR_PROPERTIES, SET_SIDEBAR_PROPERTIES } from '../../../Redux/Actions'
import Locations from '../Locations/Locations'
import { GET_BUSINESS_LINE } from './GraphQL'
import Invoices from '../Companies/Invoices'

function BusinessLine({ match }) {
	const id = match.params.idlineadenegocio
	const company = match.params.idestablecimiento

	const dispatch = useDispatch()
	const { getBusinessLineParents, hasPermissionInCompany, hasPermissionInBusinessLine } = usePermissionManager()
	const [ tab, setTab ] = useState('locations')

	const [ editAccess, setEditAccess ] = useState(false)
	const [ invoicesAccess, setInvoicesAccess ] = useState(false)

	const [ parentCompany, setParentCompany ] = useState(null)

	const evaluatePermissions = async () => {
		const editPermissions = await hasPermissionInCompany({ company: match.params.idestablecimiento, permission: 'editBusinessLine' })
		const invoicesPermissionCompany = await hasPermissionInCompany({ company, permission: 'viewEstablishmentInvoices' })
		const invoicesPermissionBusiness = await hasPermissionInBusinessLine({ businessLine: id, permission: 'viewBusinessLineInvoices' })
		setInvoicesAccess(invoicesPermissionCompany || invoicesPermissionBusiness ? true : false)
		setEditAccess(editPermissions)
	}
	
	const loadParentData = async () => {
		const { company } = await getBusinessLineParents(id)
		setParentCompany(company)
	}

	useEffect(() => {
		dispatch({ type: SET_NAVBAR_PROPERTIES, visibility: true })
		dispatch({ type: SET_SIDEBAR_PROPERTIES, visibility: true })
		evaluatePermissions()
		loadParentData()
	}, [])

	const { loading, data } = useQuery(GET_BUSINESS_LINE, { variables: { id } })
	
	return (
		<div className="col-12 whitebg mt-4 cliente">
			<div className="row">
				<div className="col-12 whitebg">
					<div className="row">
						<div className="col-md-10">
							<nav aria-label="breadcrumb">
								<ol className="breadcrumb">
									{parentCompany && <li className="breadcrumb-item">Establecimiento: <Link to={`/establecimientos/${parentCompany.id}`}>{parentCompany.name}</Link></li>}
									<li className="breadcrumb-item">Línea de negocio: {!loading && data.BusinessLine && data.BusinessLine.businessLine.name}</li>
									<li className="breadcrumb-item">Sucursales</li>
								</ol>
							</nav>
						</div>
						{ editAccess &&
							<div className="col-12 col-md-2">
								<div className="row">
									{editAccess && parentCompany && <Link className="col-md-10 btn btn-outline-primary" to={`/establecimientos/${parentCompany.id}/lineasdenegocio/${id}/informacion`}> Ver información</Link>}
								</div>
							</div>
						}
					</div>
					<div className="row px-5 mt-3">
						<ul className="nav nav-pills">
							
							<li className="nav-item">
								<a className={`nav-link ${tab === 'locations' ? 'active' : ''}`} href="#" onClick={() => setTab('locations')}>Sucursales</a>
							</li>
							<li className="nav-item">
								<a className={`nav-link ${tab === 'invoices' ? 'active' : ''}`} href="#" onClick={() => setTab('invoices')}>Facturas</a>
							</li>
						</ul>
					</div>
				</div>
			</div>
			{tab === 'locations' && <Locations company={parentCompany && parentCompany.id} businessLine={id}></Locations>}
			{(tab === 'invoices' && invoicesAccess) && <Invoices company={company} businessLine={id} type={'businessLine'}/>}
		</div>
	)
}

BusinessLine.propTypes = {
	match: PropTypes.object,
}

export default BusinessLine
