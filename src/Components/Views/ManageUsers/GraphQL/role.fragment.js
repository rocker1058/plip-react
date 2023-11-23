import gql from 'graphql-tag'
import Fragment from './permission.fragment'

export default gql`
	fragment RoleProperties on Role {
		id
		name
		friendlyName
		type
		isPlip
		description
		permissions{
			...PermissionProperties
		}
	}
	${Fragment}
`