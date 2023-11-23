import React from 'react'
import PropTypes from 'prop-types'
import moment from 'moment'
import ReactHTMLTableToExcel from 'react-html-table-to-excel'

class TagReport extends React.Component {
	constructor(props) {
		super(props)
		this.downloadExcel.bind(this)
	}

	render() {
		return (
			<div className="d-none">
				<ReactHTMLTableToExcel
					ref={ref => this.download = ref}
					id="test-table-xls-button"
					className="download-table-xls-button"
					table="table-to-xls"
					filename={this.props.fileName}
					sheet="Resumen"
					buttonText="Descargar reporte por tags" />
				<table id="table-to-xls">
					<tr>
						<th>{this.props.report.name}</th>
					</tr>
					<tr>
					</tr>
					<tr>
						<th>Desde</th>
						<th style={{ fontWeight: 'normal' }}>{moment(this.props.report.start).format('DD/MMM/YYYY')}</th>
					</tr>
					<tr>
						<th>Hasta</th>
						<th style={{ fontWeight: 'normal' }}>{moment(this.props.report.end).format('DD/MMM/YYYY')}</th>
					</tr>
					<tr>
					</tr>
					<tr>
						<th>Sucursal</th>
						<th>Total</th>
						<th>#Facturas</th>
						<th>Puntos PliP</th>
						<th>Papel Ahorrado</th>
						<th>Unidad</th>
					</tr>))
					{this.props.report.data.map((row, i) => (
						<tr key={i}>
							<th style={{ fontWeight: 'normal' }}>{row[0]}</th>
							<th style={{ fontWeight: 'normal' }}>{row[1]}</th>
							<th style={{ fontWeight: 'normal' }}>{row[2]}</th>
							<th style={{ fontWeight: 'normal' }}>{row[3]}</th>
							<th style={{ fontWeight: 'normal' }}>{row[4]}</th>
							<th style={{ fontWeight: 'normal' }}>{row[5]}</th>
						</tr>))
					}
					<tr>
					</tr>
				</table>
			</div>
		)
	}

	downloadExcel() {
		this.download.handleDownload()
	}
}

export default TagReport
