import { useSelector } from 'react-redux'
import { useApolloClient } from 'react-apollo'
import gql from 'graphql-tag'

function usePermissionManager() {
	const { user } = useSelector(state => ({
		user: state.authentication.user,
	}))

	const client = useApolloClient()

	const getLocationParents = async (location) => {
		const { data } = await client.query({
			query: gql`
				query locationQuery($id: ID!) {
					Location {
						location(id: $id){
							id
							name
							company {
								id
								name
							}
							businessLine{
								id
								name
							}
						}
					}
				}
				`,
			variables: {
				id: location,
			},
		})
		return { location: { id: data.Location.location.id, name: data.Location.location.name }, businessLine: data.Location.location.businessLine, company: data.Location.location.company }
	}

	const getBusinessLineParents = async (businessLine) => {
		const { data } = await client.query({
			query: gql`
				query businessLineQuery($id: ID!) {
					BusinessLine {
						businessLine(id: $id){
							id
							name
							company {
								id
								name
							}
						}
					}
				}
				`,
			variables: {
				id: businessLine,
			},
		})
		return { businessLine: { id: data.BusinessLine.businessLine.id, name: data.BusinessLine.businessLine.name }, company: data.BusinessLine.businessLine.company }
	}

	const companies = user ? user.accesses.filter(access => access.roles.length + access.permissions.length > 0 && !access.disabled).map(access => access.company.id) : []
	const distinctCompanies = [ ...new Set(companies) ]
	return {
		hasType: (type) => user && user.accesses.find(access => (access.type === type) && access.roles.length + access.permissions.length > 0  && !access.disabled),
		hasSomePermissionInLocation: async ({ location }) => {
			if (!user) {
				return false
			}
			try {
				const { businessLine, company } = await getLocationParents(location)
				const validAccesses = user.accesses.filter(access => ((access.company.id === company.id || access.company.id === '*') && (access.businessLine.id === businessLine.id || access.businessLine.id === '*') && (access.location.id === location || access.location.id === '*')) && access.roles.length + access.permissions.length > 0  && !access.disabled)
				return validAccesses.length > 0
			}
			catch(e) {
				return false
			}
		},
		hasPermissionInLocation: async ({ location, permission }) => {
			if (!user) {
				return false
			}
			try {
				const { businessLine, company } = await getLocationParents(location)
				const validAccesses = user.accesses.filter(access => ((access.company.id === company.id || access.company.id === '*') && (access.businessLine.id === businessLine.id || access.businessLine.id === '*') && (access.location.id === location || access.location.id === '*')) && access.roles.length + access.permissions.length > 0  && !access.disabled)
				const permissions = validAccesses.reduce((acc, access) => {
					const rolePermissions = access.roles.reduce((roleAcc, role) => ([ ...roleAcc, ...role.permissions ]), []).map(permission => permission.name)
					return [ ...acc, ...rolePermissions, ...access.permissions.map(permission => permission.name) ]
				}, [])
				return [ ...new Set(permissions) ].includes(permission)
			}
			catch(e) {
				return false
			}
		},
		hasSomePermissionInBusinessLine: async ({ businessLine }) => {
			if (!user) {
				return false
			}
			try {
				const { company } = await getBusinessLineParents(businessLine)
				const validAccesses = user.accesses.filter(access => ((access.company.id === company.id || access.company.id === '*') && (access.businessLine.id === businessLine || access.businessLine.id === '*')) && access.roles.length + access.permissions.length > 0  && !access.disabled)
				return validAccesses.length > 0
			}
			catch(e) {
				return false
			}
		},
		hasPermissionInBusinessLine: async ({ businessLine, permission }) => {
			if (!user) {
				return false
			}
			try {
				const { company } = await getBusinessLineParents(businessLine)
				const validAccesses = user.accesses.filter(access => ((access.company.id === company.id || access.company.id === '*') && (access.businessLine.id === businessLine || access.businessLine.id === '*')) && access.roles.length + access.permissions.length > 0  && !access.disabled)
				const permissions = validAccesses.reduce((acc, access) => {
					const rolePermissions = access.roles.reduce((roleAcc, role) => ([ ...roleAcc, ...role.permissions ]), []).map(permission => permission.name)
					return [ ...acc, ...rolePermissions, ...access.permissions.map(permission => permission.name) ]
				}, [])
				return [ ...new Set(permissions) ].includes(permission)
			}
			catch(e) {
				return false
			}
		},
		hasSomePermissionInCompany: async ({ company }) => {
			if (!user) {
				return false
			}
			try {
				const validAccesses = user.accesses.filter(access => ((access.company.id === company || access.company.id === '*')) && access.roles.length + access.permissions.length > 0 && !access.disabled)
				return validAccesses.length > 0
			}
			catch(e) {
				return false
			}
		},
		hasPermissionInCompany: async ({ company, permission }) => {
			if (!user) {
				return false
			}
			try {
				const validAccesses = user.accesses.filter(access => ((access.company.id === company || access.company.id === '*')) && access.roles.length + access.permissions.length > 0 && !access.disabled)
				const permissions = validAccesses.reduce((acc, access) => {
					const rolePermissions = access.roles.reduce((roleAcc, role) => ([ ...roleAcc, ...role.permissions ]), []).map(permission => permission.name)
					return [ ...acc, ...rolePermissions, ...access.permissions.map(permission => permission.name) ]
				}, [])
				return [ ...new Set(permissions) ].includes(permission)
			}
			catch(e) {
				return false
			}
		},
		hasCategoryInCompany: ({ company, category }) => {
			if (!user) {
				return false
			}
			const validAccesses = user.accesses.filter(access => (access.company.id === company || access.company.id === '*') && !access.disabled)
			const categories = validAccesses.reduce((acc, access) => {
				const rolePermissions = access.roles.reduce((roleAcc, role) => ([ ...roleAcc, ...role.permissions ]), []).map(permission => permission.category)
				return [ ...acc, ...rolePermissions, ...access.permissions.map(permission => permission.category) ]
			}, [])
			return [ ...new Set(categories) ].includes(category)
		},
		hasPliPPermission:({ permission }) => {
			if (!user) {
				return false
			}
			const validAccesses = user.accesses.filter(access => (access.type === 'PliP' || access.company.id === '*') && !access.disabled)
			const permissions = validAccesses.reduce((acc, access) => {
				const rolePermissions = access.roles.reduce((roleAcc, role) => ([ ...roleAcc, ...role.permissions ]), []).map(permission => permission.name)
				return [ ...acc, ...rolePermissions, ...access.permissions.map(permission => permission.name) ]
			}, [])
			return [ ...new Set(permissions) ].includes(permission)
		},
		distinctBusinessLines: (company) => {
			if (!user) {
				return []
			}
			const businessLines =  user ? user.accesses.filter(access => access.roles.length + access.permissions.length > 0  && !access.disabled).filter(access => access.company.id === company || access.company.id === '*').map(access => access.businessLine.id) : []
			return [ ...new Set(businessLines) ]
		},
		distinctLocations: (company, businessLine) => {
			if (!user) {
				return []
			}
			const locations =  user ? user.accesses.filter(access => access.roles.length + access.permissions.length > 0 && !access.disabled).filter(access => (access.company.id === company || access.company.id === '*') && (access.businessLine.id === businessLine || access.businessLine.id === '*')).map(access => access.location.id) : []
			return [ ...new Set(locations) ]
		},
		distinctLocationsInCompany: (company) => {
			if (!user) {
				return []
			}
			const locations =  user ? user.accesses.filter(access => access.roles.length + access.permissions.length > 0 && !access.disabled).filter(access => (access.company.id === company || access.company.id === '*')).map(access => access.location.id) : []
			return [ ...new Set(locations) ]
		},
		distinctCompanies,
		getBusinessLineParents,
		getLocationParents,
	}
}

export default usePermissionManager