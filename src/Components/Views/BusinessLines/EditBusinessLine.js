import React, { useContext, useState, useEffect, useRef } from 'react'
import PropTypes from 'prop-types'
import { Link } from 'react-router-dom'
import { useMutation, useQuery } from 'react-apollo'
import { useDispatch } from 'react-redux'
import moment from 'moment'

import { CustomForm, NotyfContext } from '../../Common'
import { GET_COMPANY } from '../Companies/GraphQL' 
import { GET_BUSINESS_LINE, UPDATE_BUSINESS_LINE } from './GraphQL'
import { SET_NAVBAR_PROPERTIES, SET_SIDEBAR_PROPERTIES } from '../../../Redux/Actions'
import { GeneralInformation, InvoiceInformation } from './BusinessLineSections'
import { ContactInformation } from '../Companies/CompanySections'

function EditBusinessLine({ match }) {
	const { idestablecimiento, idlineadenegocio } = match.params
	
	const notyf = useContext(NotyfContext)

	const [ loading, setLoading ] = useState(false)
	const [ tab, setTab ] = useState('generalInformation')
	const [ submitUpdate, setSubmitUpdate ] = useState(false)
	const [ companyInvoiceData, setCompanyInvoiceData ] = useState({})

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

	const { data } = useQuery(GET_BUSINESS_LINE, { variables: { id: idlineadenegocio }, skip: !idlineadenegocio })

	const { data: companyData } = useQuery(GET_COMPANY, { variables: { id: idestablecimiento }, skip: !idestablecimiento })

	useEffect(() => {
		if (data) {
			console.log(data)
			setGeneralInformation({
				name: data.BusinessLine.businessLine.name,
				image: data.BusinessLine.businessLine.logo,
			})
			setContactInformation((data.BusinessLine.businessLine.contact && data.BusinessLine.businessLine.contact.length > 0 ? data.BusinessLine.businessLine.contact : [ {} ]).map(({ __typename, ...contact }) => contact))
			setInvoiceInformation({
				companyDependant: data.BusinessLine.businessLine.invoiceMeasurements.companyDependant,
				customInvoiceData: !data.BusinessLine.businessLine.invoiceMeasurements.companyDependant ? data.BusinessLine.businessLine.invoiceMeasurements.measurements.reduce((acc, { year, __typename,  ...invoiceData }) => {
					acc[year] = invoiceData
					return acc
				}, {}) : {},
			})
		}
	}, [ data ])

	useEffect(() => {
		if (companyData) {
			setCompanyInvoiceData(companyData.Company.company.invoiceMeasurements.reduce((acc, { year, __typename,  ...invoiceData }) => {
				acc[year] = invoiceData
				return acc
			}, {}))
		}
	}, [ companyData ])

	useEffect(() => {
		if (submitUpdate) {
			setSubmitUpdate(false)
			const stepInfo = [ generalInformationStatus, invoiceInformationStatus, contactInformationStatus ]
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
	}, [ generalInformationStatus, contactInformationStatus, invoiceInformationStatus, submitUpdate ])

	const [ updateBusinessLine ] = useMutation(UPDATE_BUSINESS_LINE, {
		onCompleted: () => {
			setLoading(false)
			notyf.open({
				type: 'success',
				message: 'La línea de negocio ha sido actualizada exitosamente',
			})
		},
		onError: () => {
			setLoading(false)
			notyf.open({
				type: 'error',
				message: 'Error al actualizar línea de negocio. Intenta de nuevo más tarde',
			})
		},
	})

	const onUpdate = (e) => {
		e.preventDefault()
		setSubmitUpdate(true)
		generalInformationBtnRef.current.click()
		contactInformationBtnRef.current.click()
		invoiceInformationBtnRef.current.click()
	}

	const onSubmit = () => {
		setLoading(true)
		const selectedInvoiceData = invoiceInformation.companyDependant ? companyInvoiceData : invoiceInformation.customInvoiceData || {}
		updateBusinessLine({
			variables: {
				id: idlineadenegocio,
				businessLine: {
					...(generalInformation.image && typeof(generalInformation.image) !== 'string' ? { logo: generalInformation.image } : {}),
					name: generalInformation.name,
					invoiceMeasurements: {
						companyDependant: invoiceInformation.companyDependant,
						measurements: Object.keys(selectedInvoiceData).reduce((acc, year) => [ ...acc, { year, ...selectedInvoiceData[year] } ], []),
					},
					contact: contactInformation,
				},
			},
			context: {
				upload: generalInformation.image && typeof(generalInformation.image) !== 'string',
			},
		})
	}

	return (
		<div className="col-12 mt-2">
			<div className="row mb-3">
				<div className="col-md-6">
					<nav aria-label="breadcrumb">
						<ol className="breadcrumb">
							<li className="breadcrumb-item">Establecimiento: <Link to={`/establecimientos/${idestablecimiento}`}>{companyData && companyData.Company && companyData.Company.company.name}</Link></li>
							{<li className="breadcrumb-item">Línea de negocio: <Link to={`/establecimientos/${idestablecimiento}/lineasdenegocio/${idlineadenegocio}`}>{generalInformation.name || ''}</Link></li>}
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
						<a className={`nav-link ${tab === 'generalInformation' ? 'active' : ''}`} href="#" onClick={() => setTab('generalInformation')}>Información general</a>
					</li>
					<li className="nav-item">
						<a className={`nav-link ${tab === 'invoiceInformation' ? 'active' : ''}`} href="#" onClick={() => setTab('invoiceInformation')}>Información de la factura</a>
					</li>
					<li className="nav-item">
						<a className={`nav-link ${tab === 'contactInformation' ? 'active' : ''}`} href="#" onClick={() => setTab('contactInformation')}>Responsable de línea de negocio</a>
					</li>
				</ul>
			</div>
			<div className="cliente margins pt-0">
				<div className="px-4 py-4">
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
						<GeneralInformation ref={generalInformationRef} {...generalInformation} companyInvoiceData={companyInvoiceData} onPropertyChange= {(name, value) => setGeneralInformation({ ...generalInformation, [name]: value })} />
						<button ref={generalInformationBtnRef} className="btn btn-lg btn-primary btn-block d-none">Siguiente</button>
					</form>
					<div className={`row ${tab !== 'contactInformation' ? 'd-none' : ''}`}>
						<div className="col-12 btn-options">
							<button className="btn btn-primary float-right" onClick={() => {
								contactInformationRef.current.reset()
								setContactInformation([ ...contactInformation, {} ])
							}}>Agregar contacto</button>
						</div>
					</div>
					<form className={`col-12 ${tab !== 'invoiceInformation' ? 'd-none' : ''}`} onSubmit={(e) => {
						e.preventDefault()
						const errors = invoiceInformationRef.current.validate()
						const selectedInvoiceData = invoiceInformation.companyDependant ? companyInvoiceData : invoiceInformation.customInvoiceData || {}
						const hasOneValid = Object.keys(selectedInvoiceData).filter(year => year >= moment().get('year')).map(year => {
							const { baseMeasurement, lineMeasurement, paperType, invoicingCompany } = selectedInvoiceData[year] || {}
							return baseMeasurement && lineMeasurement && paperType && invoicingCompany
						}).find(condition => condition)
						if(Object.keys(errors).length > 0 || !hasOneValid){ 
							setInvoiceInformationStatus('error')
						}
						else {
							setInvoiceInformationStatus('completed')
						}
					}}>
						<InvoiceInformation ref={invoiceInformationRef} {...invoiceInformation} companyInvoiceData={companyInvoiceData} onPropertyChange= {(name, value) => setInvoiceInformation({ ...invoiceInformation, [name]: value })} />
						<button ref={invoiceInformationBtnRef} className="btn btn-lg btn-primary btn-block d-none">Enviar</button>
					</form>
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
				</div>
			</div>
		</div>
	)
}


EditBusinessLine.propTypes = {
	match: PropTypes.object,
}

export default EditBusinessLine

