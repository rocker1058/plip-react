import React, { useContext, useState, useEffect } from 'react'
import moment from 'moment'
import PropTypes from 'prop-types'
import { useDispatch } from 'react-redux'
import request from 'request-promise'

import { NotyfContext, usePermissionManager, CustomForm, getLoggedUser } from '../Common'

import { SET_NAVBAR_PROPERTIES, SET_SIDEBAR_PROPERTIES } from '../../Redux/Actions'

function DownloadReport() {
	const minDate='2019-01-01T05:00:00.000Z'
	const maxDate=moment().add('year', 6).endOf('year')

	const notyf = useContext(NotyfContext)
	const dispatch = useDispatch()

	const [ loading, setLoading ] = useState(false)
	const currentMonth = new Date().getMonth()
	const currentYear = (new Date()).getFullYear()
	const [ year, setYear ] = useState(currentYear)
	const [ month, setMonth ] = useState(currentMonth)
	const [ error, setError ] = useState(null)
	
	const { hasPliPPermission } = usePermissionManager()
	const [ reportType, setReportType ] = useState('')

	const isAfter = () => moment().set('month', month).set('year', year).startOf('month').isSameOrAfter(moment().endOf('month'))

	
	const minMomentDate = moment(minDate)
	const maxMomentDate = moment(maxDate)
	const ListMonths = [ 'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre','Diciembre' ]
	const ListYears = Array.from(new Array(maxMomentDate.diff(minMomentDate, 'year') + 1),(_, index) => index + currentYear -1)

	useEffect(() => {
		const hasError = isAfter()
		if (hasError) {
			setError('Debes ingresar una fecha con datos para reportar')
			setTimeout(() => {
				setError(null)
			}, 5000)
		}
	}, [ month, year ])

	const evaluatePermissions = async () => {
		const commercialReport = await hasPliPPermission({ permission: 'downloadPliPCommercialReport' })
		const environmentalReport = await hasPliPPermission({ permission: 'downloadPliPEnvironmentalReport' })
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

	const downloadReport = async () => {
		setLoading(true)
		const { token } = await getLoggedUser()
		const targetDate = moment().set('month', month).set('year', year)
		request({
			method: 'GET',
			uri: `${process.env.REACT_APP_GATEWAY}/reports?type=${reportType}&start=${targetDate.startOf('month').format('DD/MM/YYYY')}&end=${targetDate.endOf('month').format('DD/MM/YYYY')}`,
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

	return (
		<div className="col-12 whitebg cliente">
			<nav aria-label="col-12 breadcrumb px-2">
				<ol className="breadcrumb">
					<li className="breadcrumb-item">PliP</li>
					<li className="breadcrumb-item">Reportes de administrador</li>
				</ol>
			</nav>
			<div className="form-group row justify-content-center">
				<div className="col-md-5">
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
				<div className="col-md-5">
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
				<div className="col-md-5">
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
				<CustomForm.LoadingButton loading={loading} onClick={downloadReport} className="btn btn-primary">Descargar Reporte</CustomForm.LoadingButton>
			</div>
		</div>
	)
}


DownloadReport.propTypes = {
	match: PropTypes.object,
}

export default DownloadReport

