import React, { useContext, useState, useRef, useEffect } from 'react'
import PropTypes from 'prop-types'
import { useDispatch } from 'react-redux'
import Steps, { Step } from 'rc-steps'
import { Link } from 'react-router-dom'
import { useMutation, useQuery } from 'react-apollo'
import moment from 'moment'

import { CustomForm, NotyfContext  } from '../../../Common'
import { GET_COMPANY } from '../GraphQL' 
import { CREATE_CAMPAIGN } from './GraphQL' 
import { SET_NAVBAR_PROPERTIES, SET_SIDEBAR_PROPERTIES } from '../../../../Redux/Actions'
import ConfigAdditional from './ConfigAdditional'
import GeneralInformation from './GeneralInformation'

function CreateCampaign({ history, match }) {
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
	const [ companyData, setCompanyData ] = useState({})
	
	const generalInformationBtnRef = useRef()
	const [ generalInformation, setGeneralInformation ] = useState({ name: '', start: new Date(), end: moment(new Date()).add(1, 'M') })
	const [ generalInformationStatus, setGeneralInformationStatus ] = useState(null)
	
	const configAdditionalInformationBtnRef = useRef()
	const [ configAdditionalInformation, setConfigAdditionalInformation ] = useState([ { businessLine: '*', country: '*', region: '*', city: '*' } ])
	const [ configAdditionalInformationStatus, setConfigAdditionalInformationStatus ] = useState(null)

	const { data } = useQuery(GET_COMPANY, { variables: { id: company }, skip: !company })
	
	useEffect(() => {
		if (data && data.Company && data.Company.company) {
			setCompanyData(data.Company.company)
		}
	}, [ data ])

	const [ createCampaign ] = useMutation(CREATE_CAMPAIGN, {
		onCompleted: (data) => {
			setLoading(false)
			notyf.open({
				type: 'success',
				message: 'La campaña ha sido creada exitosamente',
			})
			history.push({
				pathname: `/establecimientos/${company}/campanas/editar/${data.Campaign.createCampaign.id}`,
			})
		},
		onError: () => {
			setLoading(false)
			notyf.open({
				type: 'error',
				message: 'Error al crear nueva campaña. Intenta de nuevo más tarde',
			})
		},
	})

	const getCurrentStepInformation = () => {
		if (step === 0) {
			return generalInformationStatus
		}
		if (step === 1) {
			return configAdditionalInformationStatus
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
			configAdditionalInformationBtnRef.current.click()
		}
		setStep(destinationStep)
	}

	const onNextStep = (e) => {
		e.preventDefault()
		setPerformValidation(true)
		if (step === 0) {
			generalInformationBtnRef.current.click()
		}
		if (step === 1) {
			configAdditionalInformationBtnRef.current.click()
		}
	}

	useEffect(() => {
		if (performValidation) {
			const stepInfo = [ generalInformationStatus, configAdditionalInformationStatus ]
			if (stepInfo[step] === 'completed') {
				if (step !== 1) {
					setPerformValidation(false)
					setStep(step + 1)
				}
				else {
					setPerformValidation(false)
					onSubmit()
				}
			}
		}
	}, [ generalInformationStatus, configAdditionalInformationStatus, performValidation ])

	const onSubmit = () => {
		
		setLoading(true)
		createCampaign({
			variables: {
				campaign:{
					company,
					name: generalInformation.name,
					start: generalInformation.start,
					end: generalInformation.end,
					conditions: configAdditionalInformation,
				},
			},
		})
	}

	return (
		<div className="container mt-2">
			<div className="row mb-3">
				<div className="col-md-6">
					<nav aria-label="breadcrumb">
						<ol className="breadcrumb">
							{<li className="breadcrumb-item"><Link to={`/establecimientos/${company}`}>{company === 'PliP' ? 'PliP' : companyData.name}</Link></li>}
							{<li className="breadcrumb-item"><Link to={`/establecimientos/${company}?tab=campaigns`}>Campañas</Link></li>}
							<li className="breadcrumb-item">Nueva campaña</li>
						</ol>
					</nav>
				</div>
				<div className="col-md-6">
					<div className="row justify-content-end">
						<div className="mr-2">
							<CustomForm.LoadingButton loading={loading} onClick={onNextStep} className="btn btn-primary">{step === 1 ? 'Crear nueva campaña' : 'Siguiente'}</CustomForm.LoadingButton>
						</div>
					</div>
				</div>
			</div>
			<div className="row justify-content-center">
				<div className="col-sm-4 mb-5">
					<Steps labelPlacement="vertical" current={step}>
						<Step title="Información general" className={ generalInformationStatus ? `step-${generalInformationStatus}` : ''} disabled={step === 0} onStepClick={() => changeStep(0)} status={getStepStatus(0)}/>
						<Step title="Configuración adicional" className={ configAdditionalInformationStatus ? `step-${configAdditionalInformationStatus}` : ''} disabled={(step < 1 && !configAdditionalInformationStatus) || (step < 1 && getCurrentStepInformation() !== 'completed')} onStepClick={() => changeStep(1)} status={getStepStatus(1)}/>
					</Steps>
				</div>
				<form className={`col-12 ${step !== 0 ? 'd-none' : ''}`} onSubmit={(e) => {
					e.preventDefault()
					setGeneralInformationStatus('completed')
				}}>
					<GeneralInformation 
						generalInformation={generalInformation}
						onGeneralInformation={setGeneralInformation} 
					/>
					<button ref={generalInformationBtnRef} className="btn btn-lg btn-primary btn-block d-none">Siguiente</button>
				</form>
				<form className={`col-12 ${step !== 1 ? 'd-none' : ''}`} onSubmit={(e) => {
					e.preventDefault()
					setConfigAdditionalInformationStatus('completed')
				}}>
					<ConfigAdditional 
						companyId={company}
						onConfigAdditionalInformation={setConfigAdditionalInformation}
						configAdditionalInformation={configAdditionalInformation}
					/>
					<button ref={configAdditionalInformationBtnRef} className="btn btn-lg btn-primary btn-block d-none">Siguiente</button>
				</form>
			</div>
		</div>
	)
}

CreateCampaign.propTypes = {
	match: PropTypes.object,
	history: PropTypes.object,
}

export default CreateCampaign
