import React, { useContext, useState, useEffect, useRef } from 'react'
import PropTypes from 'prop-types'
import { Link } from 'react-router-dom'
import { useMutation, useQuery } from 'react-apollo'
import { useDispatch } from 'react-redux'
import moment from 'moment'

import { CustomForm, NotyfContext } from '../../Common'
import { UPDATE_COMPANY, GET_COMPANY } from './GraphQL'
import { SET_NAVBAR_PROPERTIES, SET_SIDEBAR_PROPERTIES } from '../../../Redux/Actions'
import { GeneralInformation, ContactInformation, InvoiceInformation, CommercialInformation } from './CompanySections'
import PliPInformation from './CompanySections/PliPInformation'

function EditCompany({ match }) {
	const id = match.params.id
	const notyf = useContext(NotyfContext)

	const [ loading, setLoading ] = useState(false)
	const [ tab, setTab ] = useState('generalInformation')
	const [ submitUpdate, setSubmitUpdate ] = useState(false)
	const dispatch = useDispatch()

	useEffect(() => {
		dispatch({ type: SET_NAVBAR_PROPERTIES, visibility: true })
		dispatch({ type: SET_SIDEBAR_PROPERTIES, visibility: true })
	}, [])

	const generalInformationRef = useRef()
	const generalInformationBtnRef = useRef()
	const [ generalInformation, setGeneralInformation ] = useState({})
	const [ generalInformationStatus, setGeneralInformationStatus ] = useState(null)

	const contactInformationRef = useRef()
	const contactInformationBtnRef = useRef()
	const [ contactInformation, setContactInformation ] = useState([])
	const [ contactInformationStatus, setContactInformationStatus ] = useState(null)

	const invoiceInformationRef = useRef()
	const invoiceInformationBtnRef = useRef()
	const [ invoiceInformation, setInvoiceInformation ] = useState({})
	const [ invoiceInformationStatus, setInvoiceInformationStatus ] = useState(null)

	const commercialInformationRef = useRef()
	const commercialInformationBtnRef = useRef()
	const [ commercialInformation, setCommercialInformation ] = useState({})
	const [ commercialInformationStatus, setCommercialInformationStatus ] = useState(null)

	const { data } = useQuery(GET_COMPANY, { variables: { id }, skip: !id })

	useEffect(() => {
		if (data) {
			const { coordinates, __typename, ...address } = data.Company.company.address || {}
			setGeneralInformation({
				image: data.Company.company.logo,
				legalName: data.Company.company.legalName || '',
				name: data.Company.company.name,
				nit: data.Company.company.document.number,
				phone: data.Company.company.phone || '',
				phoneDetail: data.Company.company.phoneDetail || '',
				...(data.Company.company.address ? {
					address: {
						...address,
						latitude: coordinates.latitude,
						longitude: coordinates.longitude,
					},
				} : { address: null } ),
				addressDetail: data.Company.company.addressDetail || '',
			})
			setContactInformation((data.Company.company.contact && data.Company.company.contact.length > 0 ? data.Company.company.contact : [ {} ]).map(({ __typename, ...contact }) => contact))
			setInvoiceInformation(data.Company.company.invoiceMeasurements.reduce((acc, { year, __typename,  ...invoiceData }) => {
				acc[year] = invoiceData
				return acc
			}, {}))
			setCommercialInformation(data.Company.company.commercialData.reduce((acc, { year, __typename, ...commercialData }) => {
				acc[year] = commercialData
				return acc
			}, {}))
		}
	}, [ data ])

	useEffect(() => {
		if (submitUpdate) {
			setSubmitUpdate(false)
			const stepInfo = [ generalInformationStatus, invoiceInformationStatus, commercialInformationStatus, contactInformationStatus ]
			if (stepInfo.every(step => step === 'completed')) {
				onSubmit()
			}
			else {
				notyf.open({
					type: 'error',
					message: 'Verifica que todos los campos sean correctos',
				})
			}
		}
	}, [ generalInformationStatus, contactInformationStatus, invoiceInformationStatus, commercialInformationStatus, submitUpdate ])

	const [ updateCompany ] = useMutation(UPDATE_COMPANY, {
		onCompleted: () => {
			setLoading(false)
			notyf.open({
				type: 'success',
				message: 'El establecimiento ha sido actualizado exitosamente',
			})
		},
		onError: () => {
			setLoading(false)
			notyf.open({
				type: 'error',
				message: 'Error al actualizar establecimiento. Intenta de nuevo más tarde',
			})
		},
	})

	const onUpdate = (e) => {
		e.preventDefault()
		setSubmitUpdate(true)
		generalInformationBtnRef.current.click()
		invoiceInformationBtnRef.current.click()
		commercialInformationBtnRef.current.click()
		contactInformationBtnRef.current.click()
	}

	const onSubmit = () => {
		setLoading(true)
		const invoiceMeasurements = Object.keys(invoiceInformation).map(item => {
			return {
				baseMeasurement: invoiceInformation[item].baseMeasurement || 10,
				bigHeadMeasurement: invoiceInformation[item].bigHeadMeasurement || 0,
				invoicingCompany:  invoiceInformation[item].invoicingCompany || '',
				lineMeasurement: invoiceInformation[item].lineMeasurement || 0.5,
				paperType: invoiceInformation[item].paperType || '',
				dataInvoiceMeasurement: invoiceInformation[item].dataInvoiceMeasurement || 0,
				productMeasurement: invoiceInformation[item].productMeasurement || 0,
				wayPayMeasurement: invoiceInformation[item].wayPayMeasurement || 0,
				additionalInformationMeasurement: invoiceInformation[item].additionalInformationMeasurement || 0,
				codeQrMeasurement: invoiceInformation[item].codeQrMeasurement || 0,
				codeBarsMeasurement: invoiceInformation[item].codeBarsMeasurement || 0,
				footerMeasurement: invoiceInformation[item].footerMeasurement || 0,
				year: String(item),
			}
		})

		const { latitude, longitude, ...address } = generalInformation.address
		updateCompany({
			variables: {
				id,
				company: {
					...(generalInformation.image && typeof(generalInformation.image) !== 'string' ? { logo: generalInformation.image } : {}),
					legalName: generalInformation.legalName,
					name: generalInformation.name,
					document: {
						type: 'NIT',
						number: generalInformation.nit,
					},
					phone: generalInformation.phone,
					phoneDetail: generalInformation.phoneDetail || '',
					address: {
						...address,
						coordinates: [ longitude, latitude ],
					},
					addressDetail: generalInformation.addressDetail || '',
					contact: contactInformation,
					invoiceMeasurements: invoiceMeasurements,
					commercialData: Object.keys(commercialInformation).reduce((acc, year) => [ ...acc, { year, ...commercialInformation[year] } ], []),
				},
			},
			context: {
				upload: generalInformation.image && typeof(generalInformation.image) !== 'string',
			},
		})
	}
	return (
		<div className="col-12 mt-2">
			<div className="row">
				<div className="col-md-6">
					<nav aria-label="breadcrumb">
						<ol className="breadcrumb">
							{<li className="breadcrumb-item">Establecimiento: <Link to={`/establecimientos/${id}`}>{generalInformation.name || ''}</Link></li>}
							<li className="breadcrumb-item">Información general</li>
						</ol>
					</nav>
				</div>
				<div className="col-md-6">
					<div className="row justify-content-end">
						<div className="col-md-4">
							<CustomForm.LoadingButton loading={loading} onClick={onUpdate} className="btn btn-primary">Guardar cambios</CustomForm.LoadingButton>
						</div>
					</div>
				</div>
			</div>
			<div className="row px-5 mt-3">
				<ul className="nav nav-pills">
					<li className="nav-item">
						<a className={`nav-link ${tab === 'generalInformation' ? 'active' : ''}`} href="#" onClick={() => setTab('generalInformation')}>{generalInformationStatus === 'error' && <i style={{ color: 'red' }} className="fas fa-exclamation"></i>} Información general</a>
					</li>
					<li className="nav-item">
						<a className={`nav-link ${tab === 'invoiceInformation' ? 'active' : ''}`} href="#" onClick={() => setTab('invoiceInformation')}>{invoiceInformationStatus === 'error' && <i style={{ color: 'red' }} className="fas fa-exclamation"></i>} Información de la factura</a>
					</li>
					<li className="nav-item">
						<a className={`nav-link ${tab === 'commercialInformation' ? 'active' : ''}`} href="#" onClick={() => setTab('commercialInformation')}>{commercialInformationStatus === 'error' && <i style={{ color: 'red' }} className="fas fa-exclamation"></i>} Información comercial</a>
					</li>
					<li className="nav-item">
						<a className={`nav-link ${tab === 'contactInformation' ? 'active' : ''}`} href="#" onClick={() => setTab('contactInformation')}>{contactInformationStatus === 'error' && <i style={{ color: 'red' }} className="fas fa-exclamation"></i>} Información de contacto</a>
					</li>
					<li className="nav-item">
						<a className={`nav-link ${tab === 'plipInformation' ? 'active' : ''}`} href="#" onClick={() => setTab('plipInformation')}>Contacto PliP</a>
					</li>
				</ul>
			</div>
			<div className="cliente margins pt-0">
				<div className="px-4 py-4">
					<React.Fragment>
						<form className={`col-12 ${tab !== 'generalInformation' ? 'd-none' : ''}`} onSubmit={(e) => {
							e.preventDefault()
							const errors = generalInformationRef.current.validate()
							if(Object.keys(errors).length === 0){ 
								setGeneralInformationStatus('completed')
							}
							else {
								setGeneralInformationStatus('error')
							}
						}}>
							<GeneralInformation ref={generalInformationRef} {...generalInformation} onPropertyChange= {(name, value) => setGeneralInformation({ ...generalInformation, [name]: value })} />
							<button ref={generalInformationBtnRef} className="btn btn-lg btn-primary btn-block d-none">Siguiente</button>	
						</form>
					</React.Fragment>
					<React.Fragment>
						<form className={`col-12 ${tab !== 'invoiceInformation' ? 'd-none' : ''}`} onSubmit={(e) => {
							e.preventDefault()
							invoiceInformationRef.current.validate()
							const hasOneValid = Object.keys(invoiceInformation).filter(year => year >= moment().get('year')).map(year => {
								const { baseMeasurement, lineMeasurement, paperType, invoicingCompany } = invoiceInformation[year]
								return baseMeasurement && lineMeasurement && paperType && invoicingCompany
							}).find(condition => condition)
							if(hasOneValid){ 
								setInvoiceInformationStatus('completed')
							}
							else {
								setInvoiceInformationStatus('error')
							}
						}}>
							<InvoiceInformation ref={invoiceInformationRef} invoiceData = {invoiceInformation} onPropertyChange= {(year, name, value) => setInvoiceInformation({ ...invoiceInformation, [year]: { ...(invoiceInformation[year] || {}), [name]: value } })} />
							<button ref={invoiceInformationBtnRef} className="btn btn-lg btn-primary btn-block d-none">Siguiente</button>
						</form>
					</React.Fragment>
					<React.Fragment>
						<form className={`col-12 ${tab !== 'commercialInformation' ? 'd-none' : ''}`} onSubmit={(e) => {
							e.preventDefault()
							const hasOneValid = Object.keys(commercialInformation).filter(year => year >= moment().get('year')).map(year => {
								const { monthlyConsumption, baseMeterPrice } = commercialInformation[year]
								return monthlyConsumption && baseMeterPrice
							}).find(condition => condition)
							if (hasOneValid) {
								setCommercialInformationStatus('completed')
							}
							else {
								setCommercialInformationStatus('error')
							}
						}}>
							<CommercialInformation ref={commercialInformationRef} invoiceData = {commercialInformation} onPropertyChange= {(year, name, value) => setCommercialInformation({ ...commercialInformation, [year]: { ...(commercialInformation[year] || {}), [name]: value } })}/>
							<button ref={commercialInformationBtnRef} className="btn btn-lg btn-primary btn-block d-none">Siguiente</button>
						</form>
					</React.Fragment>
					<React.Fragment>
						<div className={`row ${tab !== 'contactInformation' ? 'd-none' : ''}`}>
							<div className="col-12 btn-options">
								<button className="btn btn-primary float-right" onClick={() => {
									contactInformationRef.current.reset()
									setContactInformation([ ...contactInformation, {} ])
								}}>Agregar contacto</button>
							</div>
						</div>
						<form className={`col-12 ${tab !== 'contactInformation' ? 'd-none' : ''}`} onSubmit={(e) => {
							e.preventDefault()
							const errors = contactInformationRef.current.validate()
							if(Object.values(errors).reduce((acc,item) => [ ...acc, ...item ], []).length === 0 && contactInformation.find(c => c.name && c.position && c.email && c.phone)){ 
								setContactInformationStatus('completed')
							}
							else {
								setContactInformationStatus('error')
							}
						}}>
							<ContactInformation ref={contactInformationRef} contacts={contactInformation} onPropertyChange= {(value) => setContactInformation(value)}/>
							<button ref={contactInformationBtnRef} className="btn btn-lg btn-primary btn-block d-none">Siguiente</button>
						</form>
					</React.Fragment>
					<div className={`col-12 ${tab !== 'plipInformation' ? 'd-none' : ''}`} >
						<PliPInformation company={id} />
					</div>
				</div>
			</div>
		</div>
	)
}


EditCompany.propTypes = {
	match: PropTypes.object,
}

export default EditCompany

