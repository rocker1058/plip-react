import React, { useContext, useState, useRef, useEffect } from 'react'
import PropTypes from 'prop-types'
import { useDispatch } from 'react-redux'
import { useMutation, useApolloClient } from 'react-apollo'
import { Link } from 'react-router-dom'
import Steps, { Step } from 'rc-steps'

import { CustomForm, NotyfContext, usePermissionManager } from '../../Common'

import { CREATE_LOCATION } from './GraphQL'
import { GET_BUSINESS_LINE } from '../BusinessLines/GraphQL'
import { SET_NAVBAR_PROPERTIES, SET_SIDEBAR_PROPERTIES } from '../../../Redux/Actions'
import { ContactInformation } from '../Companies/CompanySections'
import { GeneralInformation, InvoiceInformation } from './LocationSections'

function CreateLocation({ match, history }) {
	const notyf = useContext(NotyfContext)
	const { idestablecimiento, idlineadenegocio } = match.params
	const [ loading, setLoading ] = useState(false)
	const [ step, setStep ] = useState(0)
	const [ performValidation, setPerformValidation ] = useState(false)
	const [ lineInvoiceData, setLineInvoiceData ] = useState({})
	const [ parentCompany, setParentCompany ] = useState(null)
	const [ businessLineData, setBusinessLineData ] = useState(null)
	const { getBusinessLineParents } = usePermissionManager()
	const dispatch = useDispatch()
	const client = useApolloClient()

	const loadParentData = async () => {
		const { company, businessLine } = await getBusinessLineParents(idlineadenegocio)
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
	const [ generalInformation, setGeneralInformation ] = useState({ businessLine: idlineadenegocio })
	const [ generalInformationStatus, setGeneralInformationStatus ] = useState(null)

	const contactInformationRef = useRef()
	const contactInformationBtnRef = useRef()
	const [ contactInformation, setContactInformation ] = useState([ {} ])
	const [ contactInformationStatus, setContactInformationStatus ] = useState(null)

	const invoiceInformationRef = useRef()
	const invoiceInformationBtnRef = useRef()
	const [ invoiceInformation, setInvoiceInformation ] = useState({ lineDependant: true })
	const [ invoiceInformationStatus, setInvoiceInformationStatus ] = useState(null)

	const [ createLocation ] = useMutation(CREATE_LOCATION, {
		onCompleted: (data) => {
			setLoading(false)
			notyf.open({
				type: 'success',
				message: 'La sucursal ha sido creada exitosamente',
			})
			history.push({
				pathname: `/establecimientos/${idestablecimiento}/sucursales/${data.Location.createLocation.id}`,
			})
		},
		onError: () => {
			setLoading(false)
			notyf.open({
				type: 'error',
				message: 'Error al crear nuevo establecimiento. Intenta de nuevo más tarde',
			})
		},
	})

	const onSubmit = () => {
		setLoading(true)
		const { latitude, longitude, ...address } = generalInformation.address
		const selectedInvoiceData = invoiceInformation.lineDependant ? lineInvoiceData : invoiceInformation.customInvoiceData || {}
		createLocation({
			variables: {
				company: idestablecimiento,
				location: {
					name: generalInformation.name,
					phone: generalInformation.phone,
					phoneDetail: GeneralInformation.phoneDetail,
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
					businessLine: idlineadenegocio,
					tags: generalInformation.tags,
				},
			},
		})
	}

	const getCurrentStepInformation = () => {
		if (step === 0) {
			return generalInformationStatus
		}
		if (step === 1) {
			return invoiceInformationStatus
		}
		if (step === 2) {
			return contactInformationStatus
		}
		return 'error'
	}

	const getStepStatus = targetStep => {
		if (step === targetStep) {
			return 'process'
		}
		return 'wait'
	}

	const changeStep = destinationStep => {
		if (destinationStep >= 0) {
			generalInformationBtnRef.current.click()
		}
		if (destinationStep >= 1) {
			invoiceInformationBtnRef.current.click()
			
		}
		if (destinationStep >= 2) {
			contactInformationBtnRef.current.click()
		}
		setStep(destinationStep)
	}

	const onNextStep = (e) => {
		e.preventDefault()
		setPerformValidation(true)
		if (step === 0) {
			const errors = generalInformationRef.current.validate()
			if(Object.keys(errors).length > 0){ 
				setGeneralInformationStatus('error')
			}
			else {
				setGeneralInformationStatus('completed')
				setStep(1)
			}
		}
		if (step === 1) {
			const errors = invoiceInformationRef.current.validate()
			const selectedInvoiceData = invoiceInformation.lineDependant ? lineInvoiceData : invoiceInformation.customInvoiceData || {}
			const hasOneValid = Object.keys(selectedInvoiceData).map(year => {
				const { baseMeasurement, lineMeasurement, paperType, invoicingCompany } = selectedInvoiceData[year] || {}
				return baseMeasurement && lineMeasurement && paperType && invoicingCompany
			}).find(condition => condition)
			if(errors.length > 0 || !hasOneValid){ 
				setInvoiceInformationStatus('error')
			}
			else {
				setInvoiceInformationStatus('completed')
				setStep(2)
			}
		}
		if (step === 2) {
			const errors = contactInformationRef.current.validate()
			if(Object.values(errors).reduce((acc,item) => [ ...acc, ...item ], []).length === 0 && contactInformation.find(c => c.name && c.position && c.email && c.phone)){ 
				setContactInformationStatus('completed')
			}
			else {
				setContactInformationStatus('error')
			}
		}
	}

	useEffect(() => {
		if (performValidation) {
			const stepInfo = [ generalInformationStatus, invoiceInformationStatus, contactInformationStatus ]
			if (stepInfo[step] === 'completed') {
				if (step !== 2) {
					setPerformValidation(false)
					setStep(step + 1)
				}
				else {
					setPerformValidation(false)
					onSubmit()
				}
			}
		}
	}, [ generalInformationStatus, contactInformationStatus, invoiceInformationStatus, performValidation ])

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
		<div className="container mt-2">
			<div className="row mb-3">
				<div className="col-md-8">
					<nav aria-label="breadcrumb">
						<ol className="breadcrumb">
							{<li className="breadcrumb-item">Establecimiento: <Link to={`/establecimientos/${idestablecimiento}`}>{parentCompany && parentCompany.name}</Link></li>}
							{<li className="breadcrumb-item">Línea de negocio: <Link to={`/establecimientos/${idestablecimiento}/lineasdenegocio/${idlineadenegocio}`}>{businessLineData && businessLineData.name}</Link></li>}
							<li className="breadcrumb-item">Nueva sucursal</li>
						</ol>
					</nav>
				</div>
				<div className="col-md-4">
					<div className="row justify-content-end">
						<div className="col-md-3">
							<CustomForm.LoadingButton loading={loading} onClick={onNextStep} className="btn btn-primary">{step === 2 ? 'Crear sucursal' : 'Siguiente'}</CustomForm.LoadingButton>
						</div>
					</div>
				</div>
			</div>
			<div className="row justify-content-center">
				<div className="col-sm-6">
					<Steps labelPlacement="vertical" current={step}>
						<Step title="Información general" className={ generalInformationStatus ? `step-${generalInformationStatus}` : ''} disabled={step === 0} onStepClick={() => changeStep(0)} status={getStepStatus(0)}/>
						<Step title="Información de la factura" className={ invoiceInformationStatus ? `step-${invoiceInformationStatus}` : ''} disabled={(step < 1 && !invoiceInformationStatus) || (step < 1 && getCurrentStepInformation() !== 'completed')} onStepClick={() => changeStep(1)} status={getStepStatus(1)}/>
						<Step title="Encargado de sucursal" className={ contactInformationStatus ? `step-${contactInformationStatus}` : ''} disabled={(step < 2 && !contactInformationStatus) || (step < 2 && getCurrentStepInformation() !== 'completed')} onStepClick={() => changeStep(2)} status={getStepStatus(2)}/>
					</Steps>
				</div>
				<div className="col-sm-12">
					<form className={`col-12 ${step !== 0 ? 'd-none' : ''}`} onSubmit={(e) => {
						e.preventDefault()
					}}>
						<GeneralInformation ref={generalInformationRef} company={idestablecimiento} {...generalInformation } disabledBusinessLine onPropertyChange= {(name, value) => setGeneralInformation({ ...generalInformation, [name]: value })}/>
						<button ref={generalInformationBtnRef} className="btn btn-lg btn-primary btn-block d-none">Siguiente</button>
					</form>
					<form className={`col-12 my-5 ${step !== 1 ? 'd-none' : ''}`} onSubmit={(e) => {
						e.preventDefault()
					}}>
						<InvoiceInformation ref={invoiceInformationRef} {...invoiceInformation} lineInvoiceData={lineInvoiceData} onPropertyChange= {(name, value) => setInvoiceInformation({ ...invoiceInformation, [name]: value })}/>
						<button ref={invoiceInformationBtnRef} className="btn btn-lg btn-primary btn-block d-none">Siguiente</button>
					</form>
					<React.Fragment>
						<div className={`row ${step !== 2 ? 'd-none' : ''}`}>
							<div className="col-12 btn-options">
								<button className="btn btn-primary float-right my-2" onClick={() => {
									contactInformationRef.current.reset()
									setContactInformation([ ...contactInformation, {} ])
								}}>Agregar contacto</button>
							</div>
						</div>
						<form className={`col-12 ${step !== 2 ? 'd-none' : ''}`} onSubmit={(e) => {
							e.preventDefault()
						}}>
							<ContactInformation className={step !== 1 ? 'd-none' : ''} ref={contactInformationRef} contacts={contactInformation} onPropertyChange= {(value) => setContactInformation(value)}/>
							<button ref={contactInformationBtnRef} className="btn btn-lg btn-primary btn-block d-none">Siguiente</button>
						</form>
					</React.Fragment>
				</div>
			</div>
		</div>
	)
}

CreateLocation.propTypes = {
	match: PropTypes.object,
	history: PropTypes.object,
}

export default CreateLocation
