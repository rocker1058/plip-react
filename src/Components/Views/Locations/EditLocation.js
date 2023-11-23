import React, { useContext, useState, useEffect, useRef } from 'react'
import PropTypes from 'prop-types'
import { useMutation, useQuery, useApolloClient } from 'react-apollo'
import { useDispatch } from 'react-redux'
import { Link } from 'react-router-dom'

import { CustomForm, NotyfContext, usePermissionManager } from '../../Common'
import { GET_LOCATION, UPDATE_LOCATION } from './GraphQL'
import { GET_BUSINESS_LINE } from '../BusinessLines/GraphQL'
import { SET_NAVBAR_PROPERTIES, SET_SIDEBAR_PROPERTIES } from '../../../Redux/Actions'
import { GeneralInformation, InvoiceInformation } from './LocationSections'
import { ContactInformation } from '../Companies/CompanySections'

function EditBusinessLine({ match }) {
	const { idestablecimiento, idsucursal } = match.params
	
	const notyf = useContext(NotyfContext)

	const [ loading, setLoading ] = useState(false)
	const [ tab, setTab ] = useState('generalInformation')
	const [ submitUpdate, setSubmitUpdate ] = useState(false)
	const [ lineInvoiceData, setLineInvoiceData ] = useState({})
	const [ parentCompany, setParentCompany ] = useState(null)
	const [ businessLineData, setBusinessLineData ] = useState(null)
	const { getLocationParents } = usePermissionManager()

	const dispatch = useDispatch()
	const client = useApolloClient()

	const loadParentData = async () => {
		const { company, businessLine } = await getLocationParents(idsucursal)
		setParentCompany(company)
		setBusinessLineData(businessLine)
	}

	useEffect(() => {
		dispatch({ type: SET_NAVBAR_PROPERTIES, visibility: true })
		dispatch({ type: SET_SIDEBAR_PROPERTIES, visibility: true })
		loadParentData()
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

	const { data } = useQuery(GET_LOCATION, { variables: { id: idsucursal }, skip: !idsucursal })

	useEffect(() => {
		if (data) {
			const { coordinates, __typename, ...address } = data.Location.location.address || {}
			setGeneralInformation({
				name: data.Location.location.name,
				locationDetail: data.Location.location.locationDetail,
				phone: data.Location.location.phone || '',
				phoneDetail: data.Location.location.phoneDetail || '',
				...(data.Location.location.address ? {
					address: {
						...address,
						latitude: coordinates.latitude,
						longitude: coordinates.longitude,
					},
				} : { address: null } ),
				tags: data.Location.location.tags,
				businessLine: data.Location.location.businessLine.id,
			})
			setContactInformation((data.Location.location.contact && data.Location.location.contact.length > 0 ? data.Location.location.contact : [ {} ]).map(({ __typename, ...contact }) => contact))
			setInvoiceInformation({
				lineDependant: data.Location.location.invoiceMeasurements.businessLineDependant,
				customInvoiceData: !data.Location.location.invoiceMeasurements.businessLineDependant ? data.Location.location.invoiceMeasurements.measurements.reduce((acc, { year, __typename,  ...invoiceData }) => {
					acc[year] = invoiceData
					return acc
				}, {}) : {},
			})
			if (data.Location.location.invoiceMeasurements.businessLineDependant){
				setLineInvoiceData(data.Location.location.invoiceMeasurements.measurements.reduce((acc, { year, __typename,  ...invoiceData }) => {
					acc[year] = invoiceData
					return acc
				}, {}))
			}
		}
	}, [ data ])

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

	const [ updateLocation ] = useMutation(UPDATE_LOCATION, {
		onCompleted: () => {
			setLoading(false)
			notyf.open({
				type: 'success',
				message: 'La sucursal ha sido actualizada exitosamente',
			})
		},
		onError: () => {
			setLoading(false)
			notyf.open({
				type: 'error',
				message: 'Error al actualizar la sucursal. Intenta de nuevo más tarde',
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
		const { latitude, longitude, ...address } = generalInformation.address
		const selectedInvoiceData = invoiceInformation.lineDependant ? lineInvoiceData : invoiceInformation.customInvoiceData || {}
		updateLocation({
			variables: {
				id: idsucursal,
				location: {
					name: generalInformation.name,
					phone: generalInformation.phone,
					phoneDetail: generalInformation.phoneDetail,
					address: {
						...address,
						coordinates: [ longitude, latitude ],
					},
					locationDetail: generalInformation.locationDetail,
					contact: contactInformation,
					invoiceMeasurements: {
						businessLineDependant: invoiceInformation.lineDependant,
						measurements: Object.keys(selectedInvoiceData).reduce((acc, year) => [ ...acc, { year, ...selectedInvoiceData[year] } ], []),
					},
					businessLine: generalInformation.businessLine,
					tags: generalInformation.tags,
				},
			},
		})
	}

	const setInvoiceData = async () => {
		const { data } = await client.query({
			query: GET_BUSINESS_LINE,
			variables: {
				id: generalInformation.businessLine,
			},
		})
		setLineInvoiceData(data.BusinessLine.businessLine.invoiceMeasurements.measurements.reduce((acc, { year, __typename,  ...invoiceData }) => {
			acc[year] = invoiceData
			return acc
		}, {}))
	}
	useEffect(() => {
		if (generalInformation.businessLine) {
			setInvoiceData()
		}
	}, [ generalInformation.businessLine ])

	return (
		<div className="col-12 mt-2">
			<div className="row mb-3">
				<div className="col-md-8">
					<nav aria-label="breadcrumb">
						<ol className="breadcrumb">
							{parentCompany && <li className="breadcrumb-item">Establecimiento: <Link to={`/establecimientos/${parentCompany.id}`}>{parentCompany.name}</Link></li>}
							{businessLineData && <li className="breadcrumb-item">Línea de negocio: <Link to={`/establecimientos/${parentCompany.id}/lineasdenegocio/${businessLineData.id}`}>{businessLineData.name}</Link></li>}
							<li className="breadcrumb-item">Sucursal: <Link to={`/establecimientos/${idestablecimiento}/sucursales/${idsucursal}`}>{generalInformation.name || ''}</Link></li>
							<li className="breadcrumb-item">Información general</li>
						</ol>
					</nav>
				</div>
				<div className="col-md-4">
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
						<a className={`nav-link ${tab === 'contactInformation' ? 'active' : ''}`} href="#" onClick={() => setTab('contactInformation')}>Responsable de sucursal</a>
					</li>
				</ul>
			</div>
			<div className="cliente margins pt-0">
				<div className="px-4 py-4">
					<form className={`col-12 ${tab !== 'generalInformation' ? 'd-none' : ''}`} onSubmit={(e) => {
						e.preventDefault()
						const errors = generalInformationRef.current.validate()
						if(Object.keys(errors).length > 0){ 
							setGeneralInformationStatus('error')
						}
						else {
							setGeneralInformationStatus('completed')
						}
					}}>
						<GeneralInformation ref={generalInformationRef} company={idestablecimiento} {...generalInformation } businessLine={generalInformation.businessLine} onPropertyChange= {(name, value) => setGeneralInformation({ ...generalInformation, [name]: value })}/>
						<button ref={generalInformationBtnRef} className="btn btn-lg btn-primary btn-block d-none">Siguiente</button>
					</form>
					<form className={`col-12 my-5 ${tab !== 'invoiceInformation' ? 'd-none' : ''}`} onSubmit={(e) => {
						e.preventDefault()
						const errors = invoiceInformationRef.current.validate()
						const selectedInvoiceData = invoiceInformation.lineDependant ? lineInvoiceData : invoiceInformation.customInvoiceData || {}
						const hasOneValid = Object.keys(selectedInvoiceData).map(year => {
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
						<InvoiceInformation ref={invoiceInformationRef} {...invoiceInformation} lineInvoiceData={lineInvoiceData} onPropertyChange= {(name, value) => setInvoiceInformation({ ...invoiceInformation, [name]: value })}/>
						<button ref={invoiceInformationBtnRef} className="btn btn-lg btn-primary btn-block d-none">Siguiente</button>
					</form>
					<React.Fragment>
						<div className={`row ${tab !== 'contactInformation' ? 'd-none' : ''}`}>
							<div className="col-12 btn-options">
								<button className="btn btn-primary float-right my-2" onClick={() => {
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
							<ContactInformation showNotification ref={contactInformationRef} contacts={contactInformation} onPropertyChange= {(value) => setContactInformation(value)}/>
							<button ref={contactInformationBtnRef} className="btn btn-lg btn-primary btn-block d-none">Siguiente</button>
						</form>
					</React.Fragment>
				</div>
			</div>
		</div>
	)
}


EditBusinessLine.propTypes = {
	match: PropTypes.object,
}

export default EditBusinessLine

