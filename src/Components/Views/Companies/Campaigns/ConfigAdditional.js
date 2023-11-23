import React, { useState, useEffect } from 'react'
import PropTypes from 'prop-types'
import { useApolloClient } from 'react-apollo'
import spanishLocale from 'i18n-iso-countries/langs/es.json' 
import countries from 'i18n-iso-countries'
import { useQuery } from 'react-apollo'

import { CustomForm  } from '../../../Common'
import { GET_LOCATIONS } from '../../Locations/GraphQL' 
import { GET_BUSINESS_LINES } from '../../BusinessLines/GraphQL' 

countries.registerLocale(spanishLocale)

function ItemConditional({ conditions, condition, onDeleteCondition, index, companyId, businessLines, onConditions, isEdit }){
	const [ locations, setLocations ] = useState([])
	const [ selectedLocations, setSelectedLocations ] = useState([])
	const [ listCountries, setListCountries ] = useState([])
	const [ regions, setRegions ] = useState([])
	const [ cities, setCities ] = useState([])
	const client = useApolloClient()

	const getLocation = async (businessLine) => {
		const variables = {
			filter: { company: companyId }, 
			limit: 10000, 
			sortBy: 'name', 
			order:'Ascending',
		}
		if(businessLine){
			variables.businessLine = businessLine
		}
		const { data } = await client.query({
			query: GET_LOCATIONS,
			variables,
		})
		if(data && data.Location && data.Location.locations && data.Location.locations.results){
			setLocations(data.Location.locations.results)
			filterSelectedLocations(data.Location.locations.results)
			setListCountries([ ...new Set(data.Location.locations.results.map((item) => item.address.country)) ])
			if(isEdit){
				setRegions([ ...new Set(data.Location.locations.results.filter((item) => item.address.country === condition.country).map((item) => item.address.region)) ])
				setCities([ ...new Set(data.Location.locations.results.filter((item) => (item.address.country === condition.country && item.address.region === condition.region)).map((item) => item.address.city)) ])
			}
		}
	}

	useEffect(() => {
		getLocation()
	}, [])

	const filterSelectedLocations = (allLocation) => {
		let acc = allLocation
		if(condition.country !== '*'){
			acc = acc.filter((item) => item.address.country === condition.country)
			if(condition.region !== '*'){
				acc = acc.filter((item) => item.address.region === condition.region )
				if(condition.city !== '*'){
					acc = acc.filter((item) => item.address.city === condition.city )
				}
			}
		}
		setSelectedLocations(acc)
	}

	const filterLocation = () => {
		if(condition.country !== '*'){
			const newRegions = locations.filter((item) => item.address.country === condition.country).map((item) => item.address.region)
			setRegions([ ...new Set(newRegions) ])
		}
		if(condition.region !== '*'){
			const newCities = locations.filter((item) => (item.address.country === condition.country && item.address.region === condition.region)).map((item) => item.address.city)
			setCities([ ...new Set(newCities) ])
		}
		getLocation(condition.businessLine !== '*' ? condition.businessLine : null)
	}

	useEffect(() => {
		filterLocation()
		filterSelectedLocations(locations)
	}, [ condition ])
	

	const editConditional = (name, value) => {
		
		let newArray = [ ...conditions ]
		if(name === 'businessLine'){
			newArray[index] = { ...newArray[index], businessLine: value, country: '*', region: '*', city: '*' }
		}
		else if(name === 'country'){
			newArray[index] = { ...newArray[index], country: value, region: '*', city: '*' }
		}
		else if(name === 'region'){
			newArray[index] = { ...newArray[index], region: value, city: '*' }
		}
		else{
			newArray[index] = { ...newArray[index], city: value }
		}
		onConditions(newArray)
	}

	return (
		<>
			<div className="row justify-content-between px-3">
				<h5>Condición {index + 1}</h5>
				{conditions.length > 1 &&
				<div onClick={()=> onDeleteCondition(index)}>
					<i className="fas fa-times"></i>
				</div>
				}
			</div>
			<div className="form-group">
				<label className="col-form-label text-sm-right" htmlFor="inputName">Línea de negocio</label>
				<select onChange={(e) => editConditional('businessLine', e.target.value)} value={condition.businessLine} className="form-control" name="location">
					<option value="*">Todas las líneas de negocio</option>
					{businessLines.map(businessLine => <option key={businessLine.id} value={businessLine.id}>{businessLine.name}</option>)}
				</select>
			</div>
			<div className="row justify-content-between">
				<div className="form-group col-12 col-lg-4">
					<label className="col-form-label text-center" htmlFor="inputName">País</label>
					<select onChange={(e) => editConditional('country', e.target.value)} className="form-control" value={condition.country} name="location">
						<option value="*">Todos los países</option>
						{listCountries.map((country, index) => <option key={index} value={country}>{countries.getName(country, 'es')}</option>)}
					</select>
				</div>
				<div className="form-group col-12 col-lg-4">
					<label className="col-form-label text-center" htmlFor="inputName">Región</label>
					<select onChange={(e) => editConditional('region', e.target.value)} disabled={condition.country === '*' ? true : false } value={condition.region} className="form-control" name="location">
						<option value="*">Todas las regiones</option>
						{regions.map((region, index) => <option key={index} value={region}>{region}</option>)}
					</select>
				</div>
				<div className="form-group col-12 col-lg-4 ">
					<label className="col-form-label text-center" htmlFor="inputName">Ciudad</label>
					<select onChange={(e) => editConditional('city', e.target.value)} disabled={condition.region === '*' ? true : false } value={condition.city} className="form-control" name="location">
						<option value="*">Todas las ciudades</option>
						{cities.map((city, index) => <option key={index} value={city}>{city}</option>)}
					</select>
				</div>
			</div>
			<p>{`${selectedLocations.length} de ${locations.length} establecimientos en las lineas de negocio seleccionadas`}</p>
		</>
	)
}

ItemConditional.propTypes = {
	conditions: PropTypes.array,
	onDeleteCondition: PropTypes.func,
	index: PropTypes.number,
	companyId: PropTypes.string,
	condition: PropTypes.object,
	businessLines: PropTypes.array,
	onConditions: PropTypes.func,
	isEdit: PropTypes.bool,
}

function ConfigAdditional({ configAdditionalInformation, onConfigAdditionalInformation, companyId, isEdit }){
	const [ businessLines, setBusinessLines ] = useState([])

	const { data } = useQuery(GET_BUSINESS_LINES, { variables: { company: companyId } })

	const addNewCondition = () => {
		onConfigAdditionalInformation([ ...configAdditionalInformation, { businessLine: '*', country: '*', region: '*', city: '*' } ])
	}
    
	const deleteCondition = (currentIndex) => {
		if(configAdditionalInformation.length > 1){
			onConfigAdditionalInformation(configAdditionalInformation.filter((_, index) => index !== currentIndex))
		}
	}

	useEffect(() => {
		if(data && data.BusinessLine && data.BusinessLine.businessLines && data.BusinessLine.businessLines.results){
			setBusinessLines(data.BusinessLine.businessLines.results)
		}
	}, [ data ])

	return(
		<div className="row justify-content-center">
			<div className="col-12 col-lg-6">
				{configAdditionalInformation.map((data, index) => <div key={index} className="mt-4">
					<ItemConditional 
						index={index} 
						onDeleteCondition={deleteCondition} 
						conditions={configAdditionalInformation} 
						condition={data} 
						companyId={companyId}
						businessLines={businessLines}
						onConditions={onConfigAdditionalInformation}
						isEdit={isEdit}
					/>
				</div>,
				)}
				<div className="row justify-content-end mt-3 mb-5">
					<CustomForm.LoadingButton onClick={() => addNewCondition()} className="btn btn-primary">Agregar nueva condición</CustomForm.LoadingButton>
				</div>
			</div>
		</div>
	)
}

ConfigAdditional.propTypes = {
	configAdditionalInformation: PropTypes.array,
	onConfigAdditionalInformation: PropTypes.func,
	companyId: PropTypes.string,
	isEdit: PropTypes.bool,
}

export default ConfigAdditional