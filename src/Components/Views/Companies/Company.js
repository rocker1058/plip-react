import React, { useContext, useState, useEffect } from 'react'
import PropTypes from 'prop-types'
import { useDispatch } from 'react-redux'
import { useQuery } from 'react-apollo'
import { Link } from 'react-router-dom'
import moment from 'moment'
import request from 'request-promise'

import { NotyfContext, usePermissionManager, CustomForm, getLoggedUser } from '../../Common'
import { SET_NAVBAR_PROPERTIES, SET_SIDEBAR_PROPERTIES } from '../../../Redux/Actions'
import Campaigns from './Campaigns/Campaigns'
import BusinessLines from '../BusinessLines/BusinessLines'
import { GET_COMPANY } from './GraphQL'
import ReportsByTag from './CompanyReport'
import Invoices from './Invoices'

function Company({ match, history }) {
	const minDate='2019-01-01T05:00:00.000Z'
	const maxDate=moment().add('year', 6).endOf('year')
	
	const notyf = useContext(NotyfContext)
	const [ reportsAccess, setReportsAccess ] = useState(false)

	const [ loading, setLoading ] = useState(false)
	const currentMonth = new Date().getMonth()
	const currentYear = (new Date()).getFullYear()
	const [ year, setYear ] = useState(currentYear)
	const [ month, setMonth ] = useState(currentMonth)
	const [ error, setError ] = useState(null)
	
	const [ reportType, setReportType ] = useState('')

	const isAfter = () => moment().set('month', month).set('year', year).startOf('month').isSameOrAfter(moment().endOf('month'))

	const minMomentDate = moment(minDate)
	const maxMomentDate = moment(maxDate)
	const ListMonths = [ 'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre','Diciembre' ]
	const ListYears = Array.from(new Array(maxMomentDate.diff(minMomentDate, 'year') + 1),(_, index) => index + currentYear -1)


	const urlParamTab = new URLSearchParams(window.location.search).get('tab')
	const [ tab, setTab ] = useState(urlParamTab === 'campaigns' ? 'campaigns' : 'businessLines')

	const dispatch = useDispatch()
	const { hasCategoryInCompany, hasPermissionInCompany, distinctBusinessLines } = usePermissionManager()

	const [ usersAccess, setUserAccess ] = useState(false)
	const [ editAccess, setEditAccess ] = useState(false)
	const [ downloadReportAccess, setDownloadReportAccess ] = useState(false)
	const [ businessLinesAccess, setBusinessLinesAccess ] = useState(false)
	const [ campaignAccess, setCampaignAccess ] = useState(false)
	const [ invoicesAccess, setInvoicesAccess ] = useState(false)

	const evaluatePermissions = async () => {
		const distinctLines = distinctBusinessLines(match.params.id)
		const userPermission = await hasCategoryInCompany({ company: match.params.id, category: 'access' })
		const editPermissions = await hasPermissionInCompany({ company: match.params.id, permission: 'editCompany' })
		const businessLinesPermission = await hasPermissionInCompany({ company: match.params.id, permission: 'listBusinessLines' })
		const commercialReport = await hasPermissionInCompany({ company: match.params.id, permission: 'downloadCommercialReport' })
		const environmentalReport = await hasPermissionInCompany({ company: match.params.id, permission: 'downloadEnvironmentalReport' })
		const campaignPermission = await hasPermissionInCompany({ company: match.params.id, permission: 'listCampaigns' })
		const invoicesPermission = await hasPermissionInCompany({ company: match.params.id, permission: 'viewEstablishmentInvoices' })
		setInvoicesAccess(invoicesPermission)
		setUserAccess(userPermission)
		setEditAccess(editPermissions)
		setBusinessLinesAccess(distinctLines.length > 0 || businessLinesPermission)
		setDownloadReportAccess(commercialReport || environmentalReport)
		setCampaignAccess(campaignPermission)

		const reportPermissions = await hasPermissionInCompany({ company: match.params.id, permission: 'listCompanyReport' })
		setReportsAccess(reportPermissions)
		if (commercialReport) {
			setReportType('commercial')
		}
		else if (environmentalReport) {
			setReportType('environmental')
		}
	}
	
	useEffect(() => {
		dispatch({ type: SET_NAVBAR_PROPERTIES, visibility: true })
		dispatch({ type: SET_SIDEBAR_PROPERTIES, visibility: true })
		evaluatePermissions()
	}, [])

	useEffect(() => {
		const hasError = isAfter()
		if (hasError) {
			setError('Debes ingresar una fecha con datos para reportar')
			setTimeout(() => {
				setError(null)
			}, 5000)
		}
	}, [ month, year ])

	const downloadReport = async () => {
		setLoading(true)
		const { token } = await getLoggedUser()
		const targetDate = moment().set('month', month).set('year', year)
		request({
			method: 'GET',
			uri: `${process.env.REACT_APP_GATEWAY}/reports/${match.params.id}?type=${reportType}&start=${targetDate.startOf('month').format('DD/MM/YYYY')}&end=${targetDate.endOf('month').format('DD/MM/YYYY')}`,
			encoding: null,
			headers: {
				Authorization: `Bearer ${token.jwtToken}`,
				Accept: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
			},
		})
			.then((res) => {
				setLoading(false)
				const blob = new Blob([ res ], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
				const href = window.URL.createObjectURL(blob)
				const a = document.createElement('a')
				a.download = `Reporte ${reportType === 'commercial' ? 'comercial' : 'ambiental'} ${moment().format('DD/MMM/YYYY')}.xlsx`
				a.href = href
				a.click()
				a.href = ''
				notyf.open({
					type: 'success',
					message: 'Se ha descargado tu reporte',
				})
			})
			.catch(() => {
				setLoading(false)
				notyf.open({
					type: 'error',
					message: 'No se pudo descargar tu reporte. Datos insuficientes',
				})
			})
	}

	const { loading: loadingCompany, data } = useQuery(GET_COMPANY, { variables: { id: match.params.id }, skip: match.params.id == 'PliP' })
	
	return (
		<div className="col-12 whitebg mt-4 cliente">
			<div className="row">
				<div className="col-12 whitebg">
					<div className="row px-lg-4">
						<div className="col-sm-6 row align-items-center">
							{!loadingCompany && data.Company && data.Company.company.logo &&
								<div>
									<img className="logo mr-3" src={data.Company.company.logo}/>
								</div>
							}
							<h1 className="mb-0">{!loadingCompany && data.Company && data.Company.company.name}</h1>
						</div>
						{ (usersAccess || editAccess) &&
							<div className="col-12 col-md-6">
								<div className="row justify-content-end">
									{editAccess && <Link className="col-md-3 btn btn-outline-primary mr-2" to={`/establecimientos/${match.params.id}/informacion`}>Ver Información</Link>}
									{usersAccess && <Link className="col-md-4 btn btn-outline-primary mr-2" to={`/establecimientos/${match.params.id}/usuarios`}>Gestionar Usuarios</Link>}
									{/* {downloadReportAccess && <Link className="col-md-3 btn btn-outline-primary mr-2" to={`/establecimientos/${match.params.id}/reportes`}>Descargar Reportes</Link>} */}
								</div>
							</div>
						}
					</div>
					<div className="row px-5 mt-3">
						<ul className="nav nav-pills">
							{businessLinesAccess &&
								<li className="nav-item">
									<a className={`nav-link ${tab === 'businessLines' ? 'active' : ''}`} href="#" onClick={() => setTab('businessLines')}>Líneas de negocio</a>
								</li>
							}
							{invoicesAccess && <li className="nav-item">
								<a className={`nav-link ${tab === 'invoices' ? 'active' : ''}`} href="#" onClick={() => setTab('invoices')}>Facturas</a>
							</li>}
							{campaignAccess &&
								<li className="nav-item">
									<a className={`nav-link ${tab === 'campaigns' ? 'active' : ''}`} href="#" onClick={() => setTab('campaigns')}>Campañas publicitarias</a>
								</li>
							}
							<li className="nav-item">
								<a className={`nav-link ${tab === 'reports' ? 'active' : ''}`} href="#" onClick={() => setTab('reports')}>Reportes generales</a>
							</li>
							{reportsAccess &&
								<li className="nav-item">
									<a className={`nav-link ${tab === 'reportsByTag' ? 'active' : ''}`} href="#" onClick={() => setTab('reportsByTag')}>Reporte por tags</a>
								</li>							
							}
						</ul>
					</div>
				</div>
			</div>
			{businessLinesAccess && tab === 'businessLines' && <BusinessLines company={match.params.id}></BusinessLines>}
			{campaignAccess && tab === 'campaigns' && <Campaigns history={history} company={match.params.id}></Campaigns>}
			{tab === 'reports' && <div className="mt-5">
				<div className="form-group row justify-content-center">
					<div className="col-md-6">
						<label className="col-form-label text-sm-right" htmlFor="inputName">1. Selecciona el tipo de reporte</label>
						<select
							className="form-control"
							placeholder="Tipo de reporte"
							name="reportType"
							value={reportType}
							onChange={e => setReportType(e.target.value)}
						>
							<option value={''}>Selecciona el tipo de reporte</option>
							<option value="commercial">Comercial</option>
							<option value="environmental">Ambiental</option>
						</select>
					</div>
				</div>
				<div className="form-group row justify-content-center">
					<div className="col-md-6">
						<label className="col-form-label text-sm-right" htmlFor="inputName">2. Selecciona el mes y año del reporte</label>
						<select
							className="form-control"
							placeholder="mes"
							name="month"
							value={month}
							onChange={e => setMonth(e.target.value)}
						>
							<option value={''}>Selecciona el mes del reporte</option>
							{ListMonths.map((monthMap, index) => { 
								return 	<option key={`month-${index}`} value={index}>{monthMap}</option>
							})}
						</select>
					</div>
				</div>
				<div className="form-group row justify-content-center">
					<div className="col-md-6">
						<select
							className="form-control"
							placeholder="Tipo de report"
							name="reportType"
							value={year}
							onChange={e => setYear(e.target.value)}
						>
							<option value={''}>Selecciona el año del reporte</option>
							{ListYears.map((yearMap) => { 
								return 	<option key={`year-${yearMap}`} value={yearMap}>{yearMap}</option>
							})}
						</select>
					</div>
				</div>
				<div className="form-group row justify-content-center">
					<div className="col-md-4">
						<CustomForm.LoadingButton loading={loading} onClick={downloadReport} className="btn btn-primary btn-block">Descargar Reporte</CustomForm.LoadingButton>
					</div>
				</div>
			</div>}
			{reportsAccess && tab === 'reportsByTag' && <ReportsByTag company={match.params.id}/>}
			{tab === 'invoices' && <Invoices company={match.params.id} type={'company'}/>}
		</div>
	)
}

Company.propTypes = {
	match: PropTypes.object,
	history: PropTypes.object,
}

export default Company
