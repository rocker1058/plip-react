import React, { useState, useEffect, useContext } from 'react'
import PropTypes from 'prop-types'
import { useDispatch } from 'react-redux'
import ContentLoader from 'react-content-loader'
import { useQuery, useMutation } from 'react-apollo'
import moment from 'moment'
import { Link } from 'react-router-dom'

import { GET_COMPANY } from '../GraphQL'
import { GET_CAMPAIGN, UPDATE_CAMPAIGN } from './GraphQL'
import { SET_NAVBAR_PROPERTIES, SET_SIDEBAR_PROPERTIES } from '../../../../Redux/Actions'
import {  CustomForm, NotyfContext, useBusinessLines } from '../../../Common'
import ConfigAdditional from './ConfigAdditional'
import GeneralInformation from './GeneralInformation'

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

function ImagesTable({ loading, campaign, company }) {
	const popup = (campaign.images && campaign.images.length > 0) ? campaign.images.filter((image) => (image.type === 'popup' && !image.deleted)) : []
	const carousel = (campaign.images && campaign.images.length > 0) ? campaign.images.filter((image) => (image.type === 'carousel' && !image.deleted)) : []
	const banner = (campaign.images && campaign.images.length > 0) ? campaign.images.filter((image) => (image.type === 'banner' && !image.deleted)) : []
	const general = (campaign.images && campaign.images.length > 0) ? campaign.images.filter((image) => (image.type === 'general' && !image.deleted)) : []
	return (
		<>
			{(!loading) &&
				<div className="custom-table">
					<div className="table-responsive">
						<table className="table mt-3">
							<thead>
								<tr>
									<th scope="col">Tipo de imagen</th>
									<th scope="col">Cantidad de imagenes</th>
									<th scope="col">Total de clicks en imagenes</th>
								</tr>
							</thead>
							<tbody>
								<tr>
									<td className="clickable"><Link to={`/establecimientos/${company}/campanas/editar/${campaign.id}/imagenes/popup`}>Pop Up</Link></td>
									<td scope="col">{popup.filter((img) => !img.deleted).length}/1</td>
									<td scope="col">{popup.length > 0 ? popup.reduce((acc, item) => acc + item.clicks, 0) : 0}</td>
								</tr>
								<tr>
									<td className="clickable"><Link to={`/establecimientos/${company}/campanas/editar/${campaign.id}/imagenes/banner`}>Banner</Link></td>
									<td scope="col">{banner.filter((img) => !img.deleted).length}/2</td>
									<td scope="col">{banner.length > 0 ? banner.reduce((acc, item) => acc + item.clicks, 0) : 0}</td>
								</tr>
								<tr>
									<td className="clickable">{banner.length > 0 ? <Link to={`/establecimientos/${company}/campanas/editar/${campaign.id}/imagenes/carousel`}>Carrusel</Link> : <><a href="#" style={{ textDecoration: 'none' }}>Carrusel</a> <span className="info-icon" tabIndex="0"  data-toggle="tooltip" data-placement="top" title="Debes tener mínimo una imágen tipo Banner para habilitar esta opción"><i className="fas fa-info-circle"></i></span></>}</td>
									<td scope="col">{carousel.filter((img) => !img.deleted).length}/3</td>
									<td scope="col">{carousel.length > 0 ? carousel.reduce((acc, item) => acc + item.clicks, 0) : 0}</td>
								</tr>
								<tr>
									<td className="clickable">{banner.length > 0 ? <Link to={`/establecimientos/${company}/campanas/editar/${campaign.id}/imagenes/general`}>General</Link> : <><a href="#" style={{ textDecoration: 'none' }}>General</a> <span className="info-icon" tabIndex="0"  data-toggle="tooltip" data-placement="top" title="Debes tener mínimo una imágen tipo Banner para habilitar esta opción"><i className="fas fa-info-circle"></i></span></>}</td>
									<td scope="col">{general.filter((img) => !img.deleted).length}/6</td>
									<td scope="col">{general.length > 0 ? general.reduce((acc, item) => acc + item.clicks, 0) : 0}</td>
								</tr>
							</tbody>
						</table>
					</div>
				</div>
			}
			{loading && <ListLoader style={{ height: '100%', width: '100%' }} />}
		</>
	)
}

ImagesTable.propTypes = {
	loading: PropTypes.bool,
	campaign: PropTypes.object,
	company: PropTypes.string,
}

function EditInformation({ tab, company, generalInformation, onGeneralInformation, onConfigAdditionalInformation, configAdditionalInformation }){

	return(
		<>
			{tab === 'generalInformation' &&
				<div className="mt-5">
					<GeneralInformation generalInformation={generalInformation} onGeneralInformation={onGeneralInformation} />
				</div>
			}
			{tab === 'specsInformation' &&
				<div className="mt-5">
					<ConfigAdditional companyId={company} onConfigAdditionalInformation={onConfigAdditionalInformation} configAdditionalInformation={configAdditionalInformation} isEdit={true}/>
				</div>
			}
		</>
	)
}

EditInformation.propTypes = {
	tab: PropTypes.string,
	company: PropTypes.string,
	generalInformation: PropTypes.object,
	configAdditionalInformation: PropTypes.array,
	onGeneralInformation: PropTypes.func,
	onConfigAdditionalInformation: PropTypes.func,
}

function EditCampaign({ history, match }) {
	const idCompany = match.params.idestablecimiento
	const idCampaign = match.params.idcampaign
	const notyf = useContext(NotyfContext)

	const [ editConfig, setEditConfig ] = useState(false)
	const [ tab, setTab ] = useState('generalInformation')
	const [ loading, setLoading ] = useState(false)
	const [ company, setCompany ] = useState({})
	const [ campaign, setCampaign ] = useState({})
	const [ campaignConditions, setCampaignConditions ] = useState([])

	const [ status, setStatus ] = useState({ edit: false, type: null })
	const [ generalInformation, setGeneralInformation ] = useState({ name: '', start: new Date(), end: moment(new Date()).add(1, 'M') })
	const [ configAdditionalInformation, setConfigAdditionalInformation ] = useState([ { businessLine: '*', country: '*', region: '*', city: '*' } ])
	const businessLinesData = useBusinessLines(idCompany)

	const dispatch = useDispatch()

	useEffect(() => {
		dispatch({ type: SET_NAVBAR_PROPERTIES, visibility: true })
		dispatch({ type: SET_SIDEBAR_PROPERTIES, visibility: true })
	}, [])

	const { data: companyInfo } = useQuery(GET_COMPANY, { variables: { id: idCompany }, skip: !idCompany })
	const { data: campaignInfo, loading: loadingCampaign } = useQuery(GET_CAMPAIGN, { variables: { id: idCampaign }, fetchPolicy: editConfig ? 'network-only' : 'no-cache' })
	
	useEffect(() => {
		if (companyInfo && companyInfo.Company && companyInfo.Company.company) {
			setCompany(companyInfo.Company.company)
		}
	}, [ companyInfo ])
	
	useEffect(() => {
		if (campaignInfo && campaignInfo.Campaign && campaignInfo.Campaign.campaign) {
			setCampaign(campaignInfo.Campaign.campaign)
		}
	}, [ campaignInfo ])
	
	useEffect(() => {
		if(Object.entries(campaign).length > 0){
			setStatus({ edit: false, type: campaign.status })
			setGeneralInformation({ name: campaign.name, start: campaign.start ? campaign.start : new Date(), end: campaign.end ? campaign.end : moment(new Date()).add(1, 'M') })
			setConfigAdditionalInformation(campaign.conditions)
			loadConditions()
		}
	}, [ campaign ])

	const [ updateCampaign ] = useMutation(UPDATE_CAMPAIGN, {
		onCompleted: () => {
			setLoading(false)
			setEditConfig(false)
			notyf.open({
				type: 'success',
				message: 'La campaña ha sido actualizada exitosamente',
			})
		},
		onError: () => {
			setLoading(false)
			notyf.open({
				type: 'error',
				message: 'Error al actualizar campaña. Intenta de nuevo más tarde',
			})
		},
	})

	const onSubmit = () => {
		setLoading(true)
		const conditions = configAdditionalInformation.map((item) => {
			delete item.__typename
			return item
		})
		updateCampaign({
			variables: {
				id: idCampaign,
				campaign:{
					name: generalInformation.name,
					start: generalInformation.start,
					end: generalInformation.end,
					status: status.type,
					conditions,
				},
			},
		})
	}

	useEffect(() => {
		if(status.edit){
			onSubmit()
		}
	}, [ status ])
	
	const loadConditions = async () => {
		if (campaign && campaign.conditions) {
			const conditions = await Promise.all(campaign.conditions.map(async condition => {
				if (condition.businessLine === '*') {
					if (condition.country === '*') {
						return 'Todas las sucursales'
					}
					else if (condition.region === '*') {
						return `Todas las sucursales en ${condition.country}`
					}
					else if (condition.city === '*') {
						return `Todas las sucursales en ${condition.region}, ${condition.country}`
					}
					else {
						return `Todas las sucursales en ${condition.city}, ${condition.region}, ${condition.country}`
					}
				}
				else {
					const businessLineData = businessLinesData.find(bl => bl.id === condition.businessLine)
					if (businessLineData) {
						if (condition.country === '*') {
							return `Todas las sucursales de ${businessLineData.name}`
						}
						else if (condition.region === '*') {
							return `Todas las sucursales de ${businessLineData.name} en ${condition.country}`
						}
						else if (condition.city === '*') {
							return `Todas las sucursales de ${businessLineData.name} en ${condition.region}, ${condition.country}`
						}
						else {
							return `Todas las sucursales de ${businessLineData.name} en ${condition.city}, ${condition.region}, ${condition.country}`
						}
					}
					return ''
				}
			}))
			setCampaignConditions(conditions.filter(condition => condition))
		}
		else {
			setCampaignConditions([])
		}
	}

	return (
		<div className="col-12 whitebg mt-4 cliente">
			<div className="row">
				<div className="col-12 whitebg">
					<div className="row mb-3 justify-content-between">
						<div className="col-12 col-md-8">
							<nav aria-label="breadcrumb">
								<ol className="breadcrumb">
									{<li className="breadcrumb-item">Establecimiento: <Link to={`/establecimientos/${company.id}?tab=campaigns`}>{company === 'PliP' ? 'PliP' : company.name}</Link></li>}
									<li className="breadcrumb-item">Campaña: {campaign.name}</li>
									{editConfig && <li className="breadcrumb-item">Editar campaña</li>}
								</ol>
							</nav>
						</div>
						<div className="col-12 col-md-4">
							<div className="row justify-content-end">
								<CustomForm.LoadingButton
									loading={loading}
									onClick={() => {
										if(editConfig){
											onSubmit()
										}
										else{
											setEditConfig(true)
										}
									}} 
									className="btn btn-primary  mr-2">
									{editConfig ? 'Guardar cambios' : 'Editar configuración de publicidad'}
								</CustomForm.LoadingButton>
							</div>
						</div>
					</div>
					{(!editConfig && !loadingCampaign) &&
						<div className="row mb-3 justify-content-between">
							<div className="col-12 col-md-6">
								<h5>Impresiones de campaña: {campaign.impressions}</h5>
							</div>
							<div className="col-12 col-md-6">
								{moment(campaign.end).isAfter(moment()) &&
									<div className="row justify-content-end">
										<p className="mr-2">{`Campaña ${status.type === 'active' ? 'activa' : 'inactiva'}`}</p>
										<div className="mr-2">
											<label className="customSwitch">
												<input 
													type="checkbox" 
													checked={status.type === 'active' ? true : false} 
													onChange={() => {
														setStatus({ edit: true, type: status.type === 'active' ? 'inactive' : 'active' })
													}} 
													className="customSwitch-input"
												/>
												<span className="customSwitch-label" data-on="On" data-off="Off"></span>
												<span className="customSwitch-handle"></span>
											</label>
										</div>
									</div>
								}
								{!moment(campaign.end).isAfter(moment()) &&
									<p className="float-right"><strong>Campaña finalizada</strong></p>
								}
							</div>
							<div className="col-12">
								<strong>Empieza:</strong> {moment(campaign.start).format('DD/MMM/YYYY - hh:mm a')} / <strong>Termina:</strong> {moment(campaign.end).format('DD/MMM/YYYY - hh:mm a')}
							</div>
							<div className="col-12">
								<strong>Activa en:</strong>
								<ul>
									{campaignConditions.map((condition, i) => <li key={`condition${i}`}>{condition}</li>)}
								</ul>
							</div>
						</div>
					}
					{editConfig &&
						<div className="row px-5 mt-3">
							<ul className="nav nav-pills">
								<li className="nav-item">
									<a className={`nav-link ${tab === 'generalInformation' ? 'active' : ''}`} href="#" onClick={() => setTab('generalInformation')}>Información general</a>
								</li>
								<li className="nav-item">
									<a className={`nav-link ${tab === 'specsInformation' ? 'active' : ''}`} href="#" onClick={() => setTab('specsInformation')}>Configuración adicional</a>
								</li>							
							</ul>
						</div>
					}
				</div>
			</div>
			{!editConfig &&
				<ImagesTable loading={loadingCampaign} campaign={campaign} history={history} company={idCompany}/>
			}
			{editConfig &&
				<EditInformation tab={tab} generalInformation={generalInformation} onGeneralInformation={setGeneralInformation} company={idCompany} onConfigAdditionalInformation={setConfigAdditionalInformation} configAdditionalInformation={configAdditionalInformation}/>
			}
		</div>
	)
}

EditCampaign.propTypes = {
	match: PropTypes.object,
	history: PropTypes.object,
}

export default EditCampaign
