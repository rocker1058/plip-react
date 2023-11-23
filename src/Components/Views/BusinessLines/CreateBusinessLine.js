import React, { useContext, useState, useEffect, useRef } from 'react'
import PropTypes from 'prop-types'
import { Link } from 'react-router-dom'
import { useMutation, useQuery } from 'react-apollo'
import Steps, { Step } from 'rc-steps'
import { useDispatch } from 'react-redux'

import { SET_NAVBAR_PROPERTIES, SET_SIDEBAR_PROPERTIES } from '../../../Redux/Actions'

import { GeneralInformation, InvoiceInformation } from './BusinessLineSections'

import { ContactInformation } from '../Companies/CompanySections'

import { CustomForm, NotyfContext } from '../../Common'

import { GET_COMPANY } from '../Companies/GraphQL' 

import { CREATE_BUSINESS_LINE } from './GraphQL'

function CreateBusinessLine({ history, match }) {
	const company = match.params.idestablecimiento
	const notyf = useContext(NotyfContext)

	const dispatch = useDispatch()

	useEffect(() => {
		dispatch({ type: SET_NAVBAR_PROPERTIES, visibility: true })
		dispatch({ type: SET_SIDEBAR_PROPERTIES, visibility: true })
	}, [])

	const [ loading, setLoading ] = useState(false)
	const [ step, setStep ] = useState(0)
	const [ performValidation, setPerformValidation ] = useState(false)
	const [ companyInvoiceData, setCompanyInvoiceData ] = useState({})

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
	const [ invoiceInformation, setInvoiceInformation ] = useState({ companyDependant: true })
	const [ invoiceInformationStatus, setInvoiceInformationStatus ] = useState(null)

	const { data } = useQuery(GET_COMPANY, { variables: { id: company }, skip: !company })

	const [ createBusinessLine ] = useMutation(CREATE_BUSINESS_LINE, {
		onCompleted: () => {
			setLoading(false)
			notyf.open({
				type: 'success',
				message: 'La línea de negocio ha sido creada exitosamente',
			})
			history.push({
				pathname: `/establecimientos/${company}`,
			})
		},
		onError: () => {
			setLoading(false)
			notyf.open({
				type: 'error',
				message: 'Error al crear nueva línea de negocio. Intenta de nuevo más tarde',
			})
		},
	})

	const getCurrentStepInformation = () => {
		if (step === 0) {
			return generalInformationStatus
		}
		if (step === 1) {
			return contactInformationStatus 
		}
		if (step === 2) {
			return invoiceInformationStatus
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
			const errors = invoiceInformationRef.current.validate()
			const selectedInvoiceData = invoiceInformation.companyDependant ? companyInvoiceData : invoiceInformation.customInvoiceData || {}
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


	const onSubmit = () => {
		setLoading(true)
		const selectedInvoiceData = invoiceInformation.companyDependant ? companyInvoiceData : invoiceInformation.customInvoiceData || {}
		createBusinessLine({
			variables: {
				company,
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
				upload: generalInformation.image ? true: false,
			},
		})
	}

	useEffect(() => {
		if (data) {
			setCompanyInvoiceData(data.Company.company.invoiceMeasurements.reduce((acc, { year, __typename,  ...invoiceData }) => {
				acc[year] = invoiceData
				return acc
			}, {}))
		}
	}, [ data ])

	return (
		<div className="container mt-2">
			<div className="row mb-3">
				<div className="col-md-6">
					<nav aria-label="breadcrumb">
						<ol className="breadcrumb">
							{<li className="breadcrumb-item">Establecimiento: <Link to={`/establecimientos/${company}`}>{company === 'PliP' ? 'PliP' : (data && data.Company.company.name)}</Link></li>}
							<li className="breadcrumb-item">Nueva línea de negocio</li>
						</ol>
					</nav>
				</div>
				<div className="col-md-6">
					<div className="row justify-content-end">
						<div className="col-md-3">
							<CustomForm.LoadingButton loading={loading} onClick={onNextStep} className="btn btn-primary">{step === 2 ? 'Crear línea de negocio' : 'Siguiente'}</CustomForm.LoadingButton>
						</div>
					</div>
				</div>
			</div>
			<div className="row justify-content-center">
				<div className="col-sm-4">
					<Steps labelPlacement="vertical" current={step}>
						<Step title="Información general" className={ generalInformationStatus ? `step-${generalInformationStatus}` : ''} disabled={step === 0} onStepClick={() => changeStep(0)} status={getStepStatus(0)}/>
						<Step title="Información de factura" className={ invoiceInformationStatus ? `step-${invoiceInformationStatus}` : ''} disabled={(step < 1 && !invoiceInformationStatus) || (step < 1 && getCurrentStepInformation() !== 'completed')} onStepClick={() => changeStep(1)} status={getStepStatus(1)}/>
						<Step title="Responsable de línea de negocio" className={ contactInformationStatus ? `step-${contactInformationStatus}` : ''} disabled={(step < 2 && !contactInformationStatus) || (step < 2 && getCurrentStepInformation() !== 'completed')} onStepClick={() => changeStep(2)} status={getStepStatus(2)}/>
					</Steps>
				</div>
				<form className={`col-12 ${step !== 0 ? 'd-none' : ''}`} onSubmit={(e) => {
					e.preventDefault()
				}}>
					<GeneralInformation ref={generalInformationRef} {...generalInformation} companyInvoiceData={companyInvoiceData} onPropertyChange= {(name, value) => setGeneralInformation({ ...generalInformation, [name]: value })}/>
					<button ref={generalInformationBtnRef} className="btn btn-lg btn-primary btn-block d-none">Siguiente</button>
				</form>
				<form className={`col-12 ${step !== 1 ? 'd-none' : ''}`} onSubmit={(e) => {
					e.preventDefault()
				}}>
					<InvoiceInformation ref={invoiceInformationRef} {...invoiceInformation} companyInvoiceData={companyInvoiceData} onPropertyChange= {(name, value) => setInvoiceInformation({ ...invoiceInformation, [name]: value })} />
					<button ref={invoiceInformationBtnRef} className="btn btn-lg btn-primary btn-block d-none">Siguiente</button>
				</form>
				<React.Fragment>
					<div className={`col-12 ${step !== 2 ? 'd-none' : ''}`}>
						<div className="row btn-options justify-content-end">
							<button className="btn btn-primary float-right my-2" onClick={() => {
								setContactInformation([ ...contactInformation, {} ])
							}}>Agregar contacto</button>
						</div>
					</div>
					<form className={`col-12 ${step !== 2 ? 'd-none' : ''}`} onSubmit={(e) => {
						e.preventDefault()
					}}>
						<ContactInformation className={step !== 1 ? 'd-none' : ''} ref={contactInformationRef} contacts={contactInformation} onPropertyChange= {(value) => setContactInformation(value)}/>
						<button ref={contactInformationBtnRef} className="btn btn-lg btn-primary btn-block d-none">Enviar</button>
					</form>
				</React.Fragment>
			</div>
		</div>
	)
}


CreateBusinessLine.propTypes = {
	match: PropTypes.object,
	history: PropTypes.object,
}

export default CreateBusinessLine
