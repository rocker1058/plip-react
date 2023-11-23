import gql from 'graphql-tag'
import Fragment from './role.fragment'

export default gql`
	query queryRolesAndPermissions($filter: RoleFilter){
		Access{
			roles(filter: $filter }) {
				results {
					...RoleProperties
				}
			}
		}
	}
	${Fragment}
`
