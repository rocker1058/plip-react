import React from 'react'
import PropTypes from 'prop-types'

import PlacesAutocomplete, {
	geocodeByAddress,
	getLatLng,
} from 'react-places-autocomplete'

function GoogleMapsSuggestion({ value, onAddressChange, onAddressSelected }) {
	const handleAddressSelect = async (address) => {
		const geocodedData = await geocodeByAddress(address)
		const { lat, lng } = await getLatLng(geocodedData[0])
		onAddressSelected({ 
			country: geocodedData[0].address_components.find(c => c.types.includes('country')).short_name,
			region: geocodedData[0].address_components.find(c => c.types.includes('administrative_area_level_1')) ? geocodedData[0].address_components.find(c => c.types.includes('administrative_area_level_1')).long_name : '',
			city: geocodedData[0].address_components.find(c => c.types.includes('locality') || c.types.includes('administrative_area_level_2')) ? geocodedData[0].address_components.find(c => c.types.includes('locality') || c.types.includes('administrative_area_level_2')).short_name : '',
			address,//geocodedData[0].formatted_address,
			tags: geocodedData[0].address_components.map(c => c.long_name),
			latitude: lat,
			longitude: lng,
		})
	}

	return <PlacesAutocomplete
		value={value || ''}
		onChange={onAddressChange}
		onSelect={handleAddressSelect}
	>
		{({
			suggestions, getSuggestionItemProps, loading: loadingSuggestions, getInputProps,
		}) => 
			(<div className="custom-input">
				<input {...getInputProps()} placeholder="Dirección" className="form-control" value={value || ''} autoComplete="off"/>
				<div className="autocomplete-dropdown-container">
					{loadingSuggestions && <div>Cargando</div>}
					{suggestions.map((suggestion) => {
						const className = suggestion.active ? 'suggestion-item--active' : 'suggestion-item'
						const style = suggestion.active ? { backgroundColor: '#fafafa', cursor: 'pointer' } : { backgroundColor: '#ffffff', cursor: 'pointer' }
						return (
							<div key={suggestion.id} {...getSuggestionItemProps(suggestion, { className, style })}>
								<span>{suggestion.description}</span>
							</div>)
					})}
				</div>
			</div>)
		}
	</PlacesAutocomplete>
}

GoogleMapsSuggestion.propTypes = {
	value: PropTypes.object,
	onAddressChange: PropTypes.func,
	onAddressSelected: PropTypes.func,
}

export default GoogleMapsSuggestion