import React, { Component } from 'react'
import PropTypes from 'prop-types'
import gql from 'graphql-tag'
import { connect } from 'react-redux'
import moment from 'moment'
import TagReport from './TagReport'
import BranchReport from './BranchReport'
import logo from '../../../Assets/img/logo_plip_completo.png'
import homebg from '../../../Assets/img/bghome.png'
import { SET_NAVBAR_PROPERTIES, SET_SIDEBAR_PROPERTIES } from '../../../Redux/Actions'

import { CustomForm, RangeFormatter } from '../../Common'

const queryReport = gql`
	query report($token: ID!, $secret: ID!, $from: DateTime!, $to: DateTime!) {
		Invoice{
			retrieveTagsReport(token: $token, secret: $secret, from: $from, to: $to){
				type
				name
				data {
					id
					points
					paperSaved
				}
				totals {
					totalInvoices
					paperSaved
				}
			}
		}
	}
`

const branchReport = gql`
	query report($token: ID!, $secret: ID!, $from: DateTime!, $to: DateTime!) {
		Invoice {
			companyLocationReport(token: $token, secret: $secret, from: $from, to: $to) {
				id
				total
				invoices
				points
				paperSaved
			}
		}
	}
`

const validateKey = gql`
	mutation validateKey($token: ID!, $secret: ID!){
		Key {
			validateKey(token: $token, secret: $secret) {
				master
				name
			}
		}
	}
`

class ReportPage extends Component {
	constructor(props) {
		super(props)
		this.state = {
			start: null,
			end: null,
			token: null,
			secret: null,
			report: null,
			error: { show: false },
			step: 'Credentials',
			keyData: null,
		}
		this.props.dispatch({ type: SET_NAVBAR_PROPERTIES, visibility: false })
		this.props.dispatch({ type: SET_SIDEBAR_PROPERTIES, visibility: false })
	}

	render() {
		return (
			<div className="col-12 full-height login">
				<div className="row justify-content-start">
					<div className="loginForm col-12 col-lg-6">
						<div className="row justify-content-center justify-content-lg-start">
							<div className="col-6 offset-lg-2 mt-5">
								<img className="img-fluid" src={logo} alt="PliP" />
							</div>
						</div>
						<div className="row justify-content-center">
							{this.state.step === 'Credentials' &&
								<React.Fragment>
									<div className="col-12 col-sm-10 col-md-8 mt-3">
										{this.state.error.show && this.state.error.type === 'InvalidKeys' &&
											<div className="alert alert-danger" role="alert">Credenciales inválidas</div>
										}
										{this.state.error.show && this.state.error.type === 'IncompleteData' &&
											<div className="alert alert-danger" role="alert">Debes llenar todos los datos</div>
										}
										{this.state.error.show && this.state.error.type === 'Unknown' &&
											<div className="alert alert-danger" role="alert">Se presentó un error, intentalo de nuevo más tarde</div>
										}
									</div>
									<form className="col-12 col-lg-8">
										<h1 className="text-center">Descarga tus reportes de PliP</h1>
										<div className="form-group">
											<label htmlFor="inputEmail">Token</label>
											<CustomForm.CustomInput
												name="token"
												className="form-control"
												type="password"
												placeholder="Token"
												defaultValue={this.state.token}
												validator={CustomForm.NotEmptyValidator}
												onChange={(_, value) => this.setState({ token: value })}/>
										</div>
										<div className="form-group">
											<label htmlFor="inputPassword">Secret</label>
											<CustomForm.CustomInput
												name="secret"
												className="form-control"
												type="password"
												placeholder="Secret"
												defaultValue={this.state.secret}
												validator={CustomForm.NotEmptyValidator}
												onChange={(_, value) => this.setState({ secret: value })}/>
										</div>
										<div className="form-group">
											<label htmlFor="inputEmail">Fecha de inicio</label>
											<CustomForm.CustomInput
												name="start"
												className="form-control"
												type="date"
												defaultValue={this.state.start}
												placeholder="Fecha de inicio"
												onChange={(_, value) => this.setState({ start: value })}/>
										</div>
										<div className="form-group">
											<label htmlFor="inputEmail">Fecha de fin</label>
											<CustomForm.CustomInput
												name="end"
												className="form-control"
												type="date"
												defaultValue={this.state.end}
												placeholder="Fecha de fin"
												onChange={(_, value) => this.setState({ end: value })}/>
										</div>
										<CustomForm.LoadingButton loading={this.state.downloading} onClick={this.onValidateKey.bind(this)} className="btn btn-lg btn-block btn-primary">Descargar reporte</CustomForm.LoadingButton>
									</form>
								</React.Fragment>
							}
							{this.state.step === 'CompanyReport' &&
								<React.Fragment>
									<button onClick={() => this.setState({ step: 'Credentials' })}>Atrás</button>
									<h1>{this.state.keyData.name}</h1>
									<button onClick={this.onDownloadTagReport.bind(this)}>Descargar reporte por tags</button>
									<button onClick={this.onDownloadBranchReport.bind(this)}>Descargar reporte por sucursales</button>
									{this.state.report &&
										<TagReport
											ref={ref => this.tagReport = ref}
											fileName={`Reporte ${this.state.report.type === 'Location' ? 'Sucursal' : ''} ${this.state.report.name} ${moment(this.state.report.start).format('DD/MMM/YYYY')} - ${moment(this.state.report.end).format('DD/MMM/YYYY')}`}
											report={this.state.report}/>
									}
									{this.state.branchReport &&
										<BranchReport
											ref={ref => this.branchReport = ref}
											fileName={`Reporte Establecimiento ${moment(this.state.branchReport.start).format('DD/MMM/YYYY')} - ${moment(this.state.branchReport.end).format('DD/MMM/YYYY')}`}
											report={this.state.branchReport}/>
									}
								</React.Fragment>
							}
							{this.state.step === 'LocationReport' &&
								<React.Fragment>
									<button onClick={() => this.setState({ step: 'Credentials' })}>Atrás</button>
									<h1>{this.state.keyData.name}</h1>
									<button onClick={this.onDownloadTagReport.bind(this)}>Descargar reporte por tags</button>
									{this.state.report &&
										<TagReport
											ref={ref => this.tagReport = ref}
											fileName={`Reporte ${this.state.report.type === 'Location' ? 'Sucursal' : ''} ${this.state.report.name} ${moment(this.state.report.start).format('DD/MMM/YYYY')} - ${moment(this.state.report.end).format('DD/MMM/YYYY')}`}
											report={this.state.report}/>
									}
								</React.Fragment>
							}
						</div>
					</div>
					<div className="homebg col-12 col-lg-6 px-0 d-none d-lg-block">
						<img className="img-fluid" src={homebg} alt="homebg" />
					</div>
				</div>
			</div>
		)
	}

	onValidateKey(e) {
		e.preventDefault()
		this.setState({ ...this.state, downloading: true })
		if (this.state.secret && this.state.token) {
			this.props.client.mutate({
				mutation: validateKey,
				variables: {
					secret: this.state.secret,
					token: this.state.token,
				},
			})
				.then(({ data }) => {
					this.setState({
						keyData: data.Key.validateKey,
						step: data.Key.validateKey.master ? 'CompanyReport' : 'LocationReport',
					},
					() => {
						this.setState({ ...this.state, downloading: false })
						// this.download.handleDownload()
					})
				})
				.catch((err) => {
					if (err && err.code === 'Unauthorized') {
						this.setState({ ...this.state, error: { show: true, type: 'InvalidKeys' } }, () => {
							setTimeout(() => {
								this.setState({ ...this.state, error: { show: false } })
							}, 5000)
						})
					}
					else {
						this.setState({ ...this.state, error: { show: true, type: 'Unknown' } }, () => {
							setTimeout(() => {
								this.setState({ ...this.state, error: { show: false } })
							}, 5000)
						})
					}
					this.setState({ ...this.state, downloading: false })
				})
		}
		else {
			this.setState({ ...this.state, downloading: false, error: { show: true, type: 'IncompleteData' } }, () => {
				setTimeout(() => {
					this.setState({ ...this.state, error: { show: false } })
				}, 5000)
			})
		}
	}

	onDownloadTagReport(e) {
		e.preventDefault()
		this.setState({ ...this.state, downloading: true })
		if (this.state.secret && this.state.token && this.state.start && this.state.end) {
			this.props.client.query({
				query: queryReport,
				variables: {
					secret: this.state.secret,
					token: this.state.token,
					from: this.state.start,
					to: this.state.end,
				},
			})
				.then(({ data }) => {
					const rows = data.Invoice.retrieveTagsReport.data.map((tag) => {
						const report = RangeFormatter.formatLength(tag.paperSaved)
						return [
							tag.id,
							report.number,
							report.unit,
						]
					})
					const formattedTotal = RangeFormatter.formatLength(data.Invoice.retrieveTagsReport.totals.paperSaved)
					this.setState({
						report: {
							type: data.Invoice.retrieveTagsReport.type,
							start: this.state.start,
							end: this.state.end,
							name: data.Invoice.retrieveTagsReport.name,
							data: rows,
							totals: {
								totalInvoices: data.Invoice.retrieveTagsReport.totals.totalInvoices,
								formattedTotal,
							},
						},
					},
					() => {
						this.setState({ ...this.state, downloading: false })
						this.tagReport.downloadExcel()
					})
				})
				.catch((err) => {
					if (err && err.code === 'Unauthorized') {
						this.setState({ ...this.state, error: { show: true, type: 'InvalidKeys' } }, () => {
							setTimeout(() => {
								this.setState({ ...this.state, error: { show: false } })
							}, 5000)
						})
					}
					else {
						this.setState({ ...this.state, error: { show: true, type: 'Unknown' } }, () => {
							setTimeout(() => {
								this.setState({ ...this.state, error: { show: false } })
							}, 5000)
						})
					}
					this.setState({ ...this.state, downloading: false })
				})
		}
		else {
			this.setState({ ...this.state, downloading: false, error: { show: true, type: 'IncompleteData' } }, () => {
				setTimeout(() => {
					this.setState({ ...this.state, error: { show: false } })
				}, 5000)
			})
		}
	}

	onDownloadBranchReport(e) {
		e.preventDefault()
		this.setState({ ...this.state, downloading: true })
		if (this.state.secret && this.state.token && this.state.start && this.state.end) {
			this.props.client.query({
				query: branchReport,
				variables: {
					secret: this.state.secret,
					token: this.state.token,
					from: this.state.start,
					to: this.state.end,
				},
			})
				.then(({ data }) => {
					const rows = data.Invoice.companyLocationReport.map((tag) => {
						const report = RangeFormatter.formatLength(tag.paperSaved)
						return [
							tag.id,
							tag.total,
							tag.invoices,
							tag.points,
							report.number,
							report.unit,
						]
					})
					this.setState({
						branchReport: {
							start: this.state.start,
							end: this.state.end,
							name: this.state.keyData.name,
							data: rows,
						},
					},
					() => {
						this.setState({ ...this.state, downloading: false })
						this.branchReport.downloadExcel()
					})
				})
				.catch((err) => {
					if (err && err.code === 'Unauthorized') {
						this.setState({ ...this.state, error: { show: true, type: 'InvalidKeys' } }, () => {
							setTimeout(() => {
								this.setState({ ...this.state, error: { show: false } })
							}, 5000)
						})
					}
					else {
						this.setState({ ...this.state, error: { show: true, type: 'Unknown' } }, () => {
							setTimeout(() => {
								this.setState({ ...this.state, error: { show: false } })
							}, 5000)
						})
					}
					this.setState({ ...this.state, downloading: false })
				})
		}
		else {
			this.setState({ ...this.state, downloading: false, error: { show: true, type: 'IncompleteData' } }, () => {
				setTimeout(() => {
					this.setState({ ...this.state, error: { show: false } })
				}, 5000)
			})
		}
	}

	showForgotPasswordModal(e) {
		e.preventDefault()
		this.forgotPasswordModal.wrappedInstance.show()
	}
}

ReportPage.propTypes = {
	client: PropTypes.object,
	connector: PropTypes.object,
	dispatch: PropTypes.func,
}

const mapStateToProps = state => ({
	client: state.client,
	connector: state.connector,
})

export default connect(mapStateToProps)(ReportPage)
