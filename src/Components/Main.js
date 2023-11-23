import React, { useState, useEffect, useMemo } from 'react'
import { Switch, Route } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import PropTypes from 'prop-types'
import { useApolloClient } from 'react-apollo'

import Login from './Views/Login'
import ChangePassword from './Views/ChangePassword'
import ResetPassword from './Views/ResetPassword'
import Usuarios from './Views/Usuarios/Usuarios'
import CreateCompany from './Views/Companies/CreateCompany'
import EditCompany from './Views/Companies/EditCompany'
import Companies from './Views/Companies/Companies'
import Company from './Views/Companies/Company'
import DownloadReports from './Views/Companies/DownloadReport'
import DownloadPliPReports from './Views/DownloadReport'
import CreateLocation from './Views/Locations/CreateLocation'
import EditLocation from './Views/Locations/EditLocation'
import Location from './Views/Locations/Location'
import NotFound from './Views/404'
import Confirmation from './Views/Login/Confirmation'
import ManageUsers from './Views/ManageUsers/manageUsers'
import UserAccesses from './Views/ManageUsers/accesses'
import BusinessLine from './Views/BusinessLines/BusinessLine'
import CreateBusinessLine from './Views/BusinessLines/CreateBusinessLine'
import EditBusinessLine from './Views/BusinessLines/EditBusinessLine'
import CreateCampaign from './Views/Companies/Campaigns/CreateCampaign'
import EditCampaign from './Views/Companies/Campaigns/EditCampaign'
import SaveImages from './Views/Companies/Campaigns/SaveImages'

import useSidebar from './Views/useSidebar'
import Navbar from './Views/Navbar'

import { CustomRoute, getLoggedUser, usePermissionManager } from './Common'
import { LOG_IN } from '../Redux/Actions'
import { ME_QUERY } from './Views/ManageUsers/GraphQL'

function Main({ location }) {
	const [ isRetrieving, setIsRetrieving ] = useState(true)
	const dispatch = useDispatch()
	const client = useApolloClient()
	const { Sidebar, show } = useSidebar(location)
	const { distinctCompanies, hasSomePermissionInLocation, hasPermissionInCompany, hasPermissionInLocation, hasPermissionInBusinessLine, hasSomePermissionInCompany, hasCategoryInCompany, hasPliPPermission, hasSomePermissionInBusinessLine } = usePermissionManager()
	const { user, sidebar, navbar } = useSelector(state => ({
		user: state.authentication.user,
		title: state.main.title,
		navbar: state.navbars.navbar,
		sidebar: state.navbars.sidebar,
	}))
	const verifyUserStatus = async () => {
		setIsRetrieving(true)
		const loggedUser = await getLoggedUser()
		if (loggedUser) {
			const { data } = await client.query({
				query: ME_QUERY,
			})
			dispatch({ type: LOG_IN, user: data.User.me })
		}
		setIsRetrieving(false)
	}

	useEffect(() => {
		verifyUserStatus()
	}, [])

	useMemo(() => {
		verifyUserStatus()
	}, [ user ])

	return (
		<div className="container-fluid full-height">
			{navbar.visibility &&
				<Navbar open={sidebar.open}/>
			}
			{!isRetrieving &&
				<div className={'row full-height'}>
					{show && user &&
						<div className={`col-12 col-md-2 p-0 sidebar full-height ${show ? 'open' : ''}`} >
							<Sidebar/>
						</div>
					}
					<div className={`${show ? 'col-12 content' : 'col-12'}`}>
						<div className="row justify-content-center pt-5">
							<Switch>
								<CustomRoute path='/usuarios' component={Usuarios} authorization={() => hasPliPPermission({ permission: 'listPliPUsers' })} />
								<CustomRoute path="/establecimientos/:idestablecimiento/sucursales/:idsucursal/informacion" component={EditLocation} authorization={({ idsucursal }) => hasPermissionInLocation({ location: idsucursal, permission: 'editLocation' }) } />
								<CustomRoute path="/establecimientos/:idestablecimiento/sucursales/:idsucursal" component={Location} authorization={({ idsucursal }) => hasSomePermissionInLocation({ location: idsucursal }) } />
								<CustomRoute path="/establecimientos/:idestablecimiento/campanas/editar/:idcampaign/imagenes/:type" component={SaveImages} authorization={({ idestablecimiento }) => hasPermissionInCompany({ company: idestablecimiento, permission: 'createEditCampaign' }) } />
								<CustomRoute path="/establecimientos/:idestablecimiento/campanas/crear" component={CreateCampaign} authorization={({ idestablecimiento }) => hasPermissionInCompany({ company: idestablecimiento, permission: 'createEditCampaign' }) } />
								<CustomRoute path="/establecimientos/:idestablecimiento/campanas/editar/:idcampaign" component={EditCampaign} authorization={({ idestablecimiento }) => hasPermissionInCompany({ company: idestablecimiento, permission: 'createEditCampaign' }) } />
								<CustomRoute path="/establecimientos/:idestablecimiento/lineasdenegocio/registro" component={CreateBusinessLine} authorization={({ idestablecimiento }) => hasPermissionInCompany({ company: idestablecimiento, permission: 'createBusinessLine' }) } />
								<CustomRoute path="/establecimientos/:idestablecimiento/lineasdenegocio/:idlineadenegocio/sucursales/registro" component={CreateLocation} authorization={({ idestablecimiento }) => hasPermissionInCompany({ company: idestablecimiento, permission: 'createLocation' }) } />
								<CustomRoute path="/establecimientos/:idestablecimiento/lineasdenegocio/:idlineadenegocio/informacion" component={EditBusinessLine} authorization={({ idlineadenegocio }) => hasPermissionInBusinessLine({ businessLine: idlineadenegocio, permission: 'editBusinessLine' }) } />
								<CustomRoute path="/establecimientos/:idestablecimiento/lineasdenegocio/:idlineadenegocio" component={BusinessLine} authorization={({ idlineadenegocio }) => hasSomePermissionInBusinessLine({ businessLine: idlineadenegocio })} />
								<CustomRoute path='/establecimientos/:id/reportes' component={DownloadReports} authorization={async ({ id }) => {
									const commercialReport = await hasPermissionInCompany({ company: id, permission: 'downloadCommercialReport' })
									const environmentalReport = await hasPermissionInCompany({ company: id, permission: 'downloadEnvironmentalReport' })
									return commercialReport && environmentalReport
								} }/>
								<CustomRoute path='/establecimientos/:id/informacion' component={EditCompany} authorization={({ id }) => hasPermissionInCompany({ company: id, permission: 'editCompany' }) }/>
								<CustomRoute path='/establecimientos/:id/usuarios/:userId' component={UserAccesses} authorization={({ id }) => {
									return hasPermissionInCompany({ company: id, permission: 'editAccess' })
								}}/>
								<CustomRoute path='/establecimientos/:id/usuarios' component={ManageUsers} authorization={({ id }) => {
									if (id !== 'PliP') {
										return hasCategoryInCompany({ company: id, category: 'access' })
									}
									return hasPliPPermission({ permission: 'managePliPUsers' })
								}}/>
								<CustomRoute path='/establecimientos/registro' component={CreateCompany} authorization={() => hasPermissionInCompany({ company: 'PliP', permission: 'createCompany' })} />
								<CustomRoute path="/establecimientos/:id" component={Company} authorization={({ id }) => hasSomePermissionInCompany({ company: id })} />
								<CustomRoute path='/establecimientos' component={Companies} authorization={async () => {
									const hasAccessToAllCompanies = await hasSomePermissionInCompany({ company: '*' })
									return distinctCompanies.length > 1 || hasAccessToAllCompanies 
								}} />
								<CustomRoute path='/plip/reportes' component={DownloadPliPReports} authorization={async ({ id }) => {
									const commercialReport = await hasPliPPermission({ company: id, permission: 'downloadPliPCommercialReport' })
									const environmentalReport = await hasPliPPermission({ company: id, permission: 'downloadPliPEnvironmentalReport' })
									return commercialReport && environmentalReport
								} }/>
								<CustomRoute path='/asignar-contrasenia' component={ResetPassword} authorization={() => !user}/>
								<CustomRoute path='/cambio-contrasenia' component={ChangePassword} authorization={() => user !== null}/>
								<Route path='/confirm' component={Confirmation} />
								<CustomRoute exact path='/' component={Login} />
								<CustomRoute path='*' component={NotFound} />
							</Switch>
						</div>
					</div>
				</div>
			}
		</div>
	)
}

Main.propTypes = {
	location: PropTypes.object,
}

export default Main
