import gql from 'graphql-tag'
import Fragment from './role.fragment'

export default gql`
	query getUser($id: ID!) {
		Access{
			role(id: $id){
				...RoleProperties
			}
		}
	}
	${Fragment}
`