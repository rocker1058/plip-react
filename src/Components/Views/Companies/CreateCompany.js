import React, { useContext, useState, useRef, useEffect } from 'react'
import PropTypes from 'prop-types'
import { useDispatch } from 'react-redux'
import { useMutation } from 'react-apollo'
import Steps, { Step } from 'rc-steps'

import { CustomForm, NotyfContext } from '../../Common'

import { CREATE_COMPANY } from './GraphQL'
import { SET_NAVBAR_PROPERTIES, SET_SIDEBAR_PROPERTIES } from '../../../Redux/Actions'
import { GeneralInformation, ContactInformation, InvoiceInformation, CommercialInformation } from './CompanySections'

function CreateCompany({ history }) {
	const notyf = useContext(NotyfContext)

	const [ loading, setLoading ] = useState(false)
	const [ step, setStep ] = useState(0)
	const [ performValidation, setPerformValidation ] = useState(false)
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
	const [ contactInformation, setContactInformation ] = useState([ {} ])
	const [ contactInformationStatus, setContactInformationStatus ] = useState(null)

	const invoiceInformationRef = useRef()
	const invoiceInformationBtnRef = useRef()
	const [ invoiceInformation, setInvoiceInformation ] = useState({})
	const [ invoiceInformationStatus, setInvoiceInformationStatus ] = useState(null)

	const commercialInformationRef = useRef()
	const commercialInformationBtnRef = useRef()
	const [ commercialInformation, setCommercialInformation ] = useState({})
	const [ commercialInformationStatus, setCommercialInformationStatus ] = useState(null)

	const [ createCompany ] = useMutation(CREATE_COMPANY, {
		onCompleted: (data) => {
			setLoading(false)
			notyf.open({
				type: 'success',
				message: 'El establecimiento ha sido creado exitosamente',
			})
			history.push({
				pathname: `/establecimientos/${data.Company.createCompany.id}`,
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
		createCompany({
			variables: {
				company: {
					...(generalInformation.image ? { logo: generalInformation.image } : {}),
					legalName: generalInformation.legalName,
					name: generalInformation.name,
					document: {
						type: 'NIT',
						number: generalInformation.nit,
					},
					phone: generalInformation.phone,
					phoneDetail: generalInformation.phoneDetail,
					address: {
						...address,
						coordinates: [ longitude, latitude ],
					},
					addressDetail: generalInformation.addressDetail || '',
					contact: contactInformation,
					invoiceMeasurements: Object.keys(invoiceInformation).reduce((acc, year) => [ ...acc, { year, ...invoiceInformation[year] } ], []),
					commercialData: Object.keys(commercialInformation).reduce((acc, year) => [ ...acc, { year, ...commercialInformation[year] } ], []),
				},
			},
			context: {
				upload: generalInformation.image ? true : false,
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
			return commercialInformationStatus
		}
		if (step === 3) {
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
			commercialInformation.current.click()
		}
		setStep(destinationStep)
	}

	const onNextStep = (e) => {
		e.preventDefault()
		setPerformValidation(true)
		if (step === 0) {
			const errors = generalInformationRef.current.validate()
			if(Object.keys(errors).length === 0){ 
				setGeneralInformationStatus('completed')
				setStep(1)
			}
			else {
				setGeneralInformationStatus('error')
			}
		}
		if (step === 1) {
			invoiceInformationRef.current.validate()
			const hasOneValid = Object.keys(invoiceInformation).map(year => {
				const { baseMeasurement, lineMeasurement, paperType, invoicingCompany } = invoiceInformation[year]
				return baseMeasurement && lineMeasurement && paperType && invoicingCompany
			}).find(condition => condition)
			if(hasOneValid){ 
				setInvoiceInformationStatus('completed')
				setStep(2)
			}
			else {
				setInvoiceInformationStatus('error')
			}
		}
		if (step === 2) {
			commercialInformationRef.current.validate()
			const hasOneValid = Object.keys(commercialInformation).map(year => {
				const { monthlyConsumption, baseMeterPrice } = commercialInformation[year]
				return monthlyConsumption && baseMeterPrice
			}).find(condition => condition)
			if(hasOneValid){ 
				setCommercialInformationStatus('completed')
				setStep(3)
			}
			else {
				setCommercialInformationStatus('error')
			}
		}
		if (step === 3) {
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
			const stepInfo = [ generalInformationStatus, invoiceInformationStatus, commercialInformationStatus, contactInformationStatus ]
			if (stepInfo[step] === 'completed') {
				if (step !== 3) {
					setPerformValidation(false)
					setStep(step + 1)
				}
				else {
					setPerformValidation(false)
					onSubmit()
				}
			}
		}
	}, [ generalInformationStatus, contactInformationStatus, invoiceInformationStatus, commercialInformationStatus, performValidation ])

	return (
		<div className="container mt-2">
			<div className="row mb-3">
				<h1 className="col-md-4 text-left">Nuevo establecimiento</h1>
				<div className="col-md-8">
					<div className="row justify-content-end">
						<div className="col-md-3">
							<CustomForm.LoadingButton loading={loading} onClick={onNextStep} className="btn btn-primary">{step === 3 ? 'Crear establecimiento' : 'Siguiente'}</CustomForm.LoadingButton>
						</div>
					</div>
				</div>
			</div>
			<div className="row justify-content-center">
				<div className="col-sm-6">
					<Steps labelPlacement="vertical" current={step}>
						<Step title="Información general" className={ generalInformationStatus ? `step-${generalInformationStatus}` : ''} disabled={step === 0} onStepClick={() => changeStep(0)} status={getStepStatus(0)}/>
						<Step title="Información de la factura" className={ invoiceInformationStatus ? `step-${invoiceInformationStatus}` : ''} disabled={(step < 1 && !invoiceInformationStatus) || (step < 1 && getCurrentStepInformation() !== 'completed')} onStepClick={() => changeStep(1)} status={getStepStatus(1)}/>
						<Step title="Información comercial" className={ commercialInformationStatus ? `step-${commercialInformationStatus}` : ''} disabled={(step < 2 && !commercialInformationStatus) || (step < 2 && getCurrentStepInformation() !== 'completed')} onStepClick={() => changeStep(2)} status={getStepStatus(2)}/>
						<Step title="Responsable de establecimiento" className={ contactInformationStatus ? `step-${contactInformationStatus}` : ''} disabled={(step < 3 && !contactInformationStatus) || (step < 3 && getCurrentStepInformation() !== 'completed')} onStepClick={() => changeStep(3)} status={getStepStatus(3)}/>
					</Steps>
				</div>
				<form className={`col-12 ${step !== 0 ? 'd-none' : ''}`} onSubmit={(e) => {
					e.preventDefault()
				}}>
					<GeneralInformation ref={generalInformationRef} {...generalInformation} onPropertyChange= {(name, value) => setGeneralInformation({ ...generalInformation, [name]: value })}/>
					<button ref={generalInformationBtnRef} className="btn btn-lg btn-primary btn-block d-none">Siguiente</button>
				</form>
		
				<form className={`col-12 my-5 ${step !== 1 ? 'd-none' : ''}`} onSubmit={(e) => {
					e.preventDefault()
				}}>
					<InvoiceInformation ref={invoiceInformationRef} invoiceData = {invoiceInformation} onPropertyChange= {(year, name, value) => setInvoiceInformation({ ...invoiceInformation, [year]: { ...(invoiceInformation[year] || {}), [name]: value } })}/>
					<button ref={invoiceInformationBtnRef} className="btn btn-lg btn-primary btn-block d-none">Siguiente</button>
				</form>
			
				<form className={`col-12 my-5 ${step !== 2 ? 'd-none' : ''}`} onSubmit={(e) => {
					e.preventDefault()
					const hasOneValid = Object.keys(commercialInformation).map(year => {
						const { monthlyConsumption, baseMeterPrice } = commercialInformation[year]
						return monthlyConsumption && baseMeterPrice
					}).find(condition => condition)
					if (hasOneValid) {
						setCommercialInformationStatus('completed')
					}
				}}>
					<CommercialInformation ref={commercialInformationRef} invoiceData = {commercialInformation} onPropertyChange= {(year, name, value) => setCommercialInformation({ ...commercialInformation, [year]: { ...(commercialInformation[year] || {}), [name]: value } })}/>
					<button ref={commercialInformationBtnRef} className="btn btn-lg btn-primary btn-block d-none">Siguiente</button>
				</form>

				<React.Fragment>
					<div className={`row ${step !== 3 ? 'd-none' : ''}`}>
						<div className="col-12 btn-options">
							<button className="btn btn-primary float-right my-2" onClick={() => {
								contactInformationRef.current.reset()
								setContactInformation([ ...contactInformation, {} ])
							}}>Agregar contacto</button>
						</div>
					</div>
					<form className={`col-12 ${step !== 3 ? 'd-none' : ''}`} onSubmit={(e) => {
						e.preventDefault()
					}}>
						<ContactInformation className={step !== 1 ? 'd-none' : ''} ref={contactInformationRef} contacts={contactInformation} onPropertyChange= {(value) => setContactInformation(value)}/>
						<button ref={contactInformationBtnRef} className="btn btn-lg btn-primary btn-block d-none">Agregar</button>
					</form>
				</React.Fragment>
			</div>
		</div>
	)
}

CreateCompany.propTypes = {
	history: PropTypes.object,
}

export default CreateCompany
