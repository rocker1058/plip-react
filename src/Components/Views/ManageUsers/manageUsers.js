import React, { useState, useEffect } from 'react'
import PropTypes from 'prop-types'
import { Link } from 'react-router-dom'
import { useQuery } from 'react-apollo'
import { useDispatch } from 'react-redux'

import { usePermissionManager } from '../../Common'
import { SET_NAVBAR_PROPERTIES, SET_SIDEBAR_PROPERTIES } from '../../../Redux/Actions'
import { GET_COMPANY } from './GraphQL'
import UsersResults from './users'
import RolesResults from './roles'
import establecimientoIcon from '../../../Assets/img/desktop-icon.svg'

function ManageUsers({ match }) {
	const isPliP = match.params.id === 'PliP'
	const { hasPermissionInCompany } = usePermissionManager()
	const [ canShowUsers, setShowUsers ] = useState(false)
	const [ canShowRoles, setShowRoles ] = useState(false)
	const [ tab, setTab ] = useState('users')
	const dispatch = useDispatch()

	const evaluatePermissions = async () => {
		const showUsers = await hasPermissionInCompany({ company: match.params.id, permission: 'listUsers' })
		const showRoles = await hasPermissionInCompany({ company: match.params.id, permission: 'listRoles' })
		setShowUsers(showUsers)
		if (!showUsers) {
			setTab('roles')
		}
		setShowRoles(showRoles)
	}
	
	useEffect(() => {
		dispatch({ type: SET_NAVBAR_PROPERTIES, visibility: true })
		dispatch({ type: SET_SIDEBAR_PROPERTIES, visibility: true })
		evaluatePermissions()
	}, [])

	const { data } = useQuery(GET_COMPANY, { variables: { id: match.params.id }, skip: match.params.id == 'PliP' })

	return (
		<div className="col-12 mt-2">
			<div className="row mt-lg-4">
				<img className="pageIcon" src={establecimientoIcon} />
				<div className="col-md-6">
					{ !isPliP &&
						<nav aria-label="breadcrumb">
							<ol className="breadcrumb">
								{<li className="breadcrumb-item"><Link to={`/establecimientos/${match.params.id}`}>{data && data.Company.company.name}</Link></li>}
								<li className="breadcrumb-item">Usuarios</li>
							</ol>
						</nav>
					}
					{ isPliP && <h1>Usuarios web</h1>}
				</div>
			</div>
			<div className="row px-5 mt-3">
				<ul className="nav nav-pills">
					{ canShowUsers &&
						<li className="nav-item">
							<a className={`nav-link ${tab === 'users' ? 'active' : ''}`} href="#" onClick={() => setTab('users')}>Usuarios</a>
						</li>
					}	
					{ canShowRoles &&
						<li className="nav-item">
							<a className={`nav-link ${tab === 'roles' ? 'active' : ''}`} href="#" onClick={() => setTab('roles')}>Roles</a>
						</li>
					}
				</ul>
			</div>
			<div className="cliente margins pt-0">
				<div className="px-4">
					{tab === 'users' && canShowUsers && <UsersResults company={match.params.id}/>}
					{tab === 'roles' && canShowRoles && <RolesResults company={match.params.id}/>}
				</div>
			</div>
		</div>
	)
}

ManageUsers.propTypes = {
	dispatch: PropTypes.func,
	client: PropTypes.func,
	user: PropTypes.object,
	match: PropTypes.object,
	props: PropTypes.object,
}

export default ManageUsers
