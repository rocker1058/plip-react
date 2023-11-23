import React, { useState, useEffect, useContext } from 'react'
import PropTypes from 'prop-types'
import { useDispatch } from 'react-redux'
import ContentLoader from 'react-content-loader'
import { useQuery, useMutation } from 'react-apollo'
import moment from 'moment'
import { Link } from 'react-router-dom'
import swal from 'sweetalert'

import { GET_CAMPAIGNS, DELETE_CAMPAIGN, UPDATE_CAMPAIGN } from './GraphQL'
import { SET_NAVBAR_PROPERTIES, SET_SIDEBAR_PROPERTIES } from '../../../../Redux/Actions'
import {  CustomForm, NotyfContext, usePermissionManager } from '../../../Common'

const ListLoader = props => (
	<ContentLoader
		speed={2}
		primaryColor="#f3f3f3"
		secondaryColor="#ecebeb"
		className="col-12 mt-5 ContentLoader"
		{...props}>
		<rect x="0" y="0" rx="0" ry="0" width="100%" height="50" />
		<rect x="0" y="55" rx="0" ry="0" width="100%" height="50" />
		<rect x="0" y="110" rx="0" ry="0" width="100%" height="50" />
		<rect x="0" y="165" rx="0" ry="0" width="100%" height="50" />
		<rect x="0" y="220" rx="0" ry="0" width="100%" height="50" />
		<rect x="0" y="275" rx="0" ry="0" width="100%" height="50" />
		<rect x="0" y="300" rx="0" ry="0" width="100%" height="50" />
		<rect x="0" y="355" rx="0" ry="0" width="100%" height="50" />
		<rect x="0" y="410" rx="0" ry="0" width="100%" height="50" />
		<rect x="0" y="465" rx="0" ry="0" width="100%" height="50" />
		<rect x="0" y="520" rx="0" ry="0" width="100%" height="50" />
		<rect x="0" y="575" rx="0" ry="0" width="100%" height="50" />
	</ContentLoader>
)

function EmptyContent() {
	return (
		<div className="col-12 emptytable">
			<div className="justify-content-center align-self-center">
				<div className="d-flex justify-content-center">
					<p className="icon">+</p>
				</div>
				<h5 className="text-center">No has creado ninguna campaña aún</h5>
			</div>
		</div>
	)
}

function CampaignsTable({ token, limit, campaigns, callbacks }) {
	return (
		<>
			<div className="custom-table">
				<div className="table-responsive">
					<table className="table">
						<thead>
							<tr>
								<th scope="col">Nombre de la campaña</th>
								<th scope="col">Fechas de campaña</th>
								<th scope="col">Impresiones</th>
								<th scope="col">Estado</th>
								<th scope="col">Creada en</th>
								<th scope="col">...</th>
							</tr>
						</thead>
						<tbody>
							{campaigns.map((campaign, index) => <CampaignItem key={index} campaign={campaign} callbacks={callbacks}/>)}
						</tbody>
					</table>
				</div>
			</div>
			{ token && campaigns.length >= limit &&
				<div className="row justify-content-center more">
					<div className="col-12 text-center">
						<button onClick={() => callbacks.fetchMore(token)} className="btn btn-lightblue">Mostrar más</button>
					</div>
				</div>
			}
		</>
	)
}

CampaignsTable.propTypes = {
	campaigns: PropTypes.array,
	callbacks: PropTypes.object,
	limit: PropTypes.number,
	token: PropTypes.string,
}

function CampaignItem({ campaign, callbacks }) {
	const [ canEnableDisable, setCanEnableDisable ] = useState(false)
	const [ canDelete, setCanDelete ] = useState(false)
	const [ canEdit, setCanEdit ] = useState(false)
	const [ permissions, setPermissions ] = useState([])

	const evaluatePermissions = async () => {
		const editable = await callbacks.canExecuteAction('createEditCampaign')
		const deleteable = await callbacks.canExecuteAction('deleteCampaign')
		const enableDisable =  await callbacks.canExecuteAction('enableDisableCampaign')
		setCanEdit(editable)
		setCanDelete(deleteable)
		setCanEnableDisable(enableDisable)
		setPermissions([ enableDisable, deleteable ])
	}
	useEffect(() => {
		evaluatePermissions()
	}, [])
	return (
		<tr>
			<td className="clickable">{canEdit ? <Link to={`/establecimientos/${campaign.company}/campanas/editar/${campaign.id}`}>{campaign.name}</Link> : <span>{campaign.name}</span>}</td>
			<td scope="col">{moment(campaign.start).format('DD/MMM/YYYY - hh:mm a')} - {moment(campaign.end).format('DD/MMM/YYYY - hh:mm a')}</td>
			<td scope="col">{campaign.impressions}</td>
			<td scope="col">
				<div className="mt-2">
					<div className={`status ${moment(campaign.end).isAfter(moment()) ? campaign.status === 'active' ? 'enabled ': 'canceled' : 'finished'}`}></div>
					<p className="mt-2">{moment(campaign.end).isAfter(moment()) ? campaign.status === 'active' ? 'Activa ': 'Inactiva' : 'Finalizada'}</p>
				</div>
			</td>
			<td scope="col">{moment(campaign.createdAt).format('DD/MMM/YYYY')}</td>
			<td scope="col">
				{permissions.some(permission => permission === true) && 
					<div className="dropdown">
						<button className="btn btn-white dropdown-toggle" type="button" id="dropdownMenuButton" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
								···
						</button>
						<div className="dropdown-menu" aria-labelledby="dropdownMenuButton">
							{(canEnableDisable && moment(campaign.end).isAfter(moment())) && <a className="dropdown-item" onClick={() => callbacks.onCompanyEdit(campaign)}>{campaign.status === 'active' ? 'Deshabilitar' : 'Habilitar'}</a>}
							{canDelete && <a className="dropdown-item warning" onClick={() => callbacks.onCompanyDelete(campaign)}>Eliminar</a>}
						</div>
					</div>
				}
			</td>
		</tr>
	)
}

CampaignItem.propTypes = {
	campaign: PropTypes.object,
	callbacks: PropTypes.object,
}

function CampaignsResults({ company, loading, campaigns, callbacks, limit, token }) {
	
	return (
		<>
			{(!loading && campaigns.length > 0) &&
				<CampaignsTable company={company} campaigns={campaigns} callbacks={callbacks} limit={limit} token={token}/>
			}
			{loading &&
				<div className="row">
					<div className="col-12">
						<ListLoader style={{ height: '100%', width: '100%' }} />
					</div>
				</div>
			}
			{(!loading && campaigns.length < 1) &&
				<div className="row px-3 mt-3 mt-lg-0">
					<EmptyContent />
				</div>
			}
		</>
	)
}

CampaignsResults.propTypes = {
	company: PropTypes.string,
	campaigns: PropTypes.array,
	loading: PropTypes.bool,
	callbacks: PropTypes.object,
	limit: PropTypes.number,
	token: PropTypes.string,
}

function Campaigns({ company }) {
	const { hasPermissionInCompany } = usePermissionManager()
	const [ dateStart, setDateStart ] = useState()
	const [ dateEnd, setDateEnd ] = useState()
	const [ searchTimeout, setSearchTimeout ] = useState(null)
	const [ inputSearch, setInputSearch ] = useState('')
	const [ search, setSearch ] = useState(null)
	const [ selectedCampaign, setSelectedCampaign ] = useState(null)
	const [ campaigns, setCampaigns ] = useState([])
	const [ token, setToken ] = useState(null)
	const [ loading, setLoading ] = useState(true)
	const [ filter, setFilter ] = useState({})
	const [ createEditCampaignAccess, setCreateEditCampaignAccess ] = useState(false)
	const limit = 30

	const dispatch = useDispatch()
	const notyf = useContext(NotyfContext)
	
	const evaluatePermissions = async () => {
		const campaignPermission = await hasPermissionInCompany({ company, permission: 'createEditCampaign' })
		setCreateEditCampaignAccess(campaignPermission)
	}

	useEffect(() => {
		dispatch({ type: SET_NAVBAR_PROPERTIES, visibility: true })
		dispatch({ type: SET_SIDEBAR_PROPERTIES, visibility: true })
		evaluatePermissions()
		
	}, [])
	const { data, fetchMore } = useQuery(GET_CAMPAIGNS, { variables: { limit, company, sortBy: 'createdAt', order: 'Descending', filter } })
	useEffect(() => {
		if(data && data.Campaign && data.Campaign.campaigns && data.Campaign.campaigns.results){
			setLoading(false)
			setCampaigns(data.Campaign.campaigns.results)
			setToken(data.Campaign.campaigns.token)
		}
	}, [ data ])

	useEffect(() => {
		setFilter({ search, start: dateStart, end: dateEnd })
	}, [ search, dateStart, dateEnd ])

	const [ deleteCampaign ] = useMutation(DELETE_CAMPAIGN, {
		onCompleted: () => {
			setCampaigns(campaigns.filter(campaign => campaign.id !== selectedCampaign))
			notyf.open({
				type: 'success',
				message: 'La campaña ha sido eliminada exitosamente',
			})
		},
		onError: () => {
			notyf.open({
				type: 'error',
				message: 'Se presentó un problema eliminando la campaña. Intenta de nuevo más tarde',
			})			
		},
	})
	
	const [ updateCampaign ] = useMutation(UPDATE_CAMPAIGN, {
		onCompleted: () => {
			notyf.open({
				type: 'success',
				message: 'La campaña ha sido actualizada exitosamente',
			})
		},
		onError: () => {
			notyf.open({
				type: 'error',
				message: 'Error al actualizar campaña. Intenta de nuevo más tarde',
			})
		},
	})

	const callbacks = {
		onCompanyEdit: (campaign) => {
			updateCampaign({
				variables: {
					id: campaign.id,
					campaign:{
						status: campaign.status === 'active' ? 'inactive' : 'active',
					},
				},
			})
		},
		onCompanyDelete: async (campaign) => {
			const value = await swal({
				text: `¿Seguro que deseas eliminar la campaña ${campaign.name}?`,
				dangerMode: true,
				buttons: {
					confirm: 'Si',
					cancel: 'No',
				},
			})	
			if (value) {
				setSelectedCampaign(campaign.id)
				deleteCampaign({ variables: { id: campaign.id } })
			}
		},
		canExecuteAction: (permission) => hasPermissionInCompany({ company, permission }),
		fetchMore: (token) => {
			fetchMore({
				query: GET_CAMPAIGNS,
				variables: { company, token },
				updateQuery: (previousResult, { fetchMoreResult }) => {
					return {
						Campaign: {
							...previousResult.Campaign,
							campaigns: {
								...previousResult.Campaign.campaigns,
								token: fetchMoreResult.Campaign.campaigns.token,
								results: [
									...previousResult.Campaign.campaigns.results,
									...fetchMoreResult.Campaign.campaigns.results,
								],
							},
						},
					}
				},
			})
		},
	}

	return (
		<div className="col-12 mt-3">
			<div className="row justify-content-between">
				<div className="col-4 form-group">
					<label htmlFor="inputEmail"></label>
					<input className="form-control" placeholder="Ingresa tu criterio de búsqueda" value={inputSearch} onChange={e => {
						const text = e.target.value
						setInputSearch(text)
						if(searchTimeout) {
							clearTimeout(searchTimeout)
						}
						setSearchTimeout(setTimeout(() => {
							setSearch(text)
						}, 1000))
					}}/>
				</div>
				<div className="col-4 form-group">
					<label htmlFor="inputEmail">Desde</label>
					<CustomForm.CustomInput
						name="start"
						className="form-control"
						type="date"
						defaultValue={dateStart}
						placeholder="Fecha de inicio"
						onChange={(_, value) => setDateStart(value)}/>
				</div>
				<div className="col-4 form-group">
					<label htmlFor="inputEmail">Hasta</label>
					<CustomForm.CustomInput
						dateProps={{
							calendarProps: {
								minDate: moment(dateStart).toDate(),
							},
						}}
						name="end"
						className="form-control"
						type="date"
						defaultValue={dateEnd}
						placeholder="Fecha de fin"
						onChange={(_, value) => setDateEnd(value)}/>
				</div>
				<div className="col-12">
					<div className="row align-items-center justify-content-end">
						<div className="col-11">
							{dateStart && dateEnd && 
								<div className="row align-items-center justify-content-start">
									<h4>Campañas creadas entre {moment(dateStart).format('DD/MMM/YYYY')} y {moment(dateEnd).format('DD/MMM/YYYY')}</h4>
									<button className="ml-5 btn btn-danger" onClick={() => {
										setDateStart(null)
										setDateEnd(null)
									}}>Eliminar filtro</button>
								</div>
							}
						</div>
						{createEditCampaignAccess && <Link className="btn btn-primary float-right" to={`/establecimientos/${company}/campanas/crear`}>Crear campaña</Link>}
					</div>
				
				</div>
			</div>

			{(!loading && campaigns.length > 0) &&
				<CampaignsTable company={company} campaigns={campaigns} callbacks={callbacks} limit={limit} token={token}/>
			}
			{loading &&
				<div className="row">
					<div className="col-12">
						<ListLoader style={{ height: '100%', width: '100%' }} />
					</div>
				</div>
			}
			{(!loading && campaigns.length < 1) &&
				<div className="row px-3 mt-3 mt-lg-0">
					<EmptyContent />
				</div>
			}
		</div>
	)
}

Campaigns.propTypes = {
	company: PropTypes.string,
	history: PropTypes.object,
}

export default Campaigns
