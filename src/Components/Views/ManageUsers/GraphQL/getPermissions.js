import gql from 'graphql-tag'
import Fragment from './permission.fragment'

export default gql`
	query getPermissions($filter: PermissionFilter) {
		Access{
			permissions(filter: $filter) {
				results{
					...PermissionProperties
				}
				token
			}
		}
	}
	${Fragment}
`