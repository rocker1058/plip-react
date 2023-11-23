import React, { useState, useMemo } from 'react'
import { useSelector } from 'react-redux'
import { Route, Redirect } from 'react-router-dom'
import PropTypes from 'prop-types'
import usePermissionManager from './usePermissionManager'

function CustomRoute({ authorization = () => Promise.resolve(true) , computedMatch: match, ...props }) {
	const user = useSelector(state => state.authentication.user)
	const { distinctCompanies, distinctLocationsInCompany } = usePermissionManager()
	const [ loaded, setLoaded ] = useState(false)
	const [ isAuthorized, setAuthorized ] = useState(false)
	const evaluateAuthorization = async () => {
		const authorized = await authorization(match.params)
		setAuthorized(authorized)
		setLoaded(true)
	}

	useMemo(() => {
		evaluateAuthorization()
	}, [])

	if (loaded){
		if (user) {
			if (props.path === '/') {
				let path = '/404'
				if (distinctCompanies.length > 1 || distinctCompanies.includes('*')) {
					path = '/establecimientos'
				}
				else if (distinctCompanies.length === 1) {
					const locations = distinctLocationsInCompany(distinctCompanies[0])
					if (locations.length === 1 && locations[0] !== '*') {
						path = `/establecimientos/${distinctCompanies[0]}/sucursales/${locations[0]}`
					}
					else {
						path = `/establecimientos/${distinctCompanies[0]}`
					}
				}
				return <Redirect to={{
					pathname: path,
				}}/>
			}
			else if (authorization && isAuthorized) {
				return <Route {...props}/>
			}
			else if (authorization && !isAuthorized) {
				return <Redirect to={{
					pathname: '/404',
				}}/>
			}
			return <Route {...props}/>
		}
		else {
			if (props.path === '/' || isAuthorized) {
				return <Route {...props}/>
			}
			return <Redirect to={{
				pathname: '/',
			}}/>
		}
	}
	return null
}

CustomRoute.propTypes = {
	authorization: PropTypes.func,
	path: PropTypes.string,
	computedMatch: PropTypes.object,
}

export default CustomRoute
