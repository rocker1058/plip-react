import React, { useState, useEffect } from 'react'
import PropTypes from 'prop-types'
import { useDispatch } from 'react-redux'
import ContentLoader from 'react-content-loader'
import { useApolloClient } from 'react-apollo'
import moment from 'moment'

import { GET_COMPANY_TAG_REPORT } from './GraphQL'
import { SET_NAVBAR_PROPERTIES, SET_SIDEBAR_PROPERTIES } from '../../../Redux/Actions'
import emptyImage from '../../../Assets/img/noResultIcon.svg'
import { RangeFormatter, CustomForm } from '../../Common'
import numeral from 'numeral'

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
		<div className="col-12 card emptytable">
			<div className="row justify-content-center">
				<div className="col-4 text-center">
					<img className="img-fluid" style={{ width: 100 }} src={emptyImage} />
				</div>
				<div className="w-100 d-block"></div>
				<div className="col-10 col-sm-6 col-md-4">
					<h5 className="text-center">No encontramos resultados</h5>
					<p className="text-center">Procura realizar el filtro con las fechas correctas.</p>
				</div>
			</div>
		</div>
	)
}

function ReportsTable({ totals, reports, callbacks = {} }) {
	const total = RangeFormatter.formatLength(totals.paperSaved)
	return (
		<div className="col-12 custom-table">
			<div className="table-responsive">
				<div className="row mx-0">
					<div className="col-12 col-lg-4 pl-0">
						<h4>Resumen del periodo</h4>
						<div className="card p-3 mt-4 p-0 border-0">
							<table className="table border-0">
								<tbody>
									<tr>
										<td className="border-0"><h6>Papel ahorrado</h6></td>
										<td className="border-0"><h6>Total de facturas</h6></td>
									</tr>
									<tr>
										<td className="border-0"><h6 className="quantityPaperSaved">{total.number}{total.unit}</h6></td>
										<td className="border-0"><h6 className="quantityPaperSaved">{totals.totalInvoices}</h6></td>
									</tr>
								</tbody>
							</table>
						</div>
					</div>
					<div className="col-12 col-lg-8 pr-0">
						<h4 className="">Ahorro por tag</h4>
						<table className="table mt-4">
							<thead className="header-table">
								<tr>
									<th scope="col">Tag</th>
									<th scope="col">Papel ahorrado</th>
									<th scope="col">Total facturas</th>
								</tr>
							</thead>
							<tbody>
								{reports.map(report => <ReportItem key={report.id} report={report} {...callbacks}/>)}
							</tbody>
						</table>
						<span><b>Nota</b>: Solo se visualizan aquellos tags que cuentan con facturas creadas en el periodo seleccionado</span>
					</div>
				</div>
			</div>
		</div>
	)
}

ReportsTable.propTypes = {
	reports: PropTypes.array,
	callbacks: PropTypes.object,
	totals: PropTypes.object,
}

function ReportItem({ report }) {
	const formattedReport = RangeFormatter.formatLength(report.paperSaved)
	return (
		<tr>
			<td><div className="badge badge-secondary">{report.id}</div></td>
			<td>{formattedReport.number} {formattedReport.unit}</td>
			<td>{numeral(report.totalInvoices).format('0,0')}</td>
		</tr>
	)
}

ReportItem.propTypes = {
	report: PropTypes.object,
}

function ReportResults({ loading, reports }) {

	return (
		<div className="col-12 px-0">
			{
				loading &&
					<div className="row">
						<div className="col-12">
							<ListLoader style={{ height: '100%', width: '100%' }} />
						</div>
					</div>
			}
			{
				!loading && (!reports || reports.data.length === 0) &&
					<div className="row px-3 mt-3 mt-lg-0">
						<EmptyContent />
					</div>
			}
			{
				!loading && reports && reports.data.length > 0 &&
					<div className="row">
						<ReportsTable reports={reports.data} totals={reports.totals}/>
					</div>
			}
		</div>
	)
}

ReportResults.propTypes = {
	reports: PropTypes.object,
	loading: PropTypes.bool,
}

function Reports({ company }) {
	const [ start, setStart ] = useState(moment().startOf('month'))
	const [ end, setEnd ] = useState(moment().endOf('month'))
	const [ reports, setReports ] = useState(null)
	const [ loading, setLoading ] = useState(false)
	const dispatch = useDispatch()
	const client = useApolloClient()
	
	useEffect(() => {
		dispatch({ type: SET_NAVBAR_PROPERTIES, visibility: true })
		dispatch({ type: SET_SIDEBAR_PROPERTIES, visibility: true })
	}, [])

	const getReport = async () => {
		setLoading(true)
		try {
			const { data } = await client.query({
				query: GET_COMPANY_TAG_REPORT,
				variables: { company, from: start, to: end },
				fetchPolicy: 'network-only',
			})
			if(data && data.Invoice && data.Invoice.companyReport){
				setReports(data.Invoice.companyReport)
			}
		} catch(e){
			console.log(e)
		}
		setLoading(false)
	}
	
	return (
		<div className="col-12 mt-5">
			<h4>Reportes por tags</h4>
			<p>Filtra tus reportes por medio de los tags usados</p>
			<div className="row mx-0 justify-content-start align-items-center body-filters mb-5">
				<div className="col-12 col-lg-5 form-group">
					<label htmlFor="inputEmail">Fecha de inicio</label>
					<CustomForm.CustomInput
						name="start"
						className="form-control"
						type="date"
						defaultValue={start}
						placeholder="Fecha de inicio"
						onChange={(_, value) => setStart(value)}/>
				</div>
				<div className="col-12 col-lg-5 form-group">
					<label htmlFor="inputEmail">Fecha de fin</label>
					<CustomForm.CustomInput
						name="end"
						className="form-control"
						type="date"
						defaultValue={end}
						placeholder="Fecha de fin"
						onChange={(_, value) => setEnd(value)}/>
				</div>
				<div className="col-12 col-lg-2 mt-1">
					<CustomForm.LoadingButton onClick={getReport} className="btn btn-primary btn-block">Filtrar</CustomForm.LoadingButton>
				</div>
			</div>
			<ReportResults reports={reports} loading={loading}/>
		</div>
	)
}

Reports.propTypes = {
	company: PropTypes.string,
}

export default Reports
