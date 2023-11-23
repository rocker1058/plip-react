import gql from 'graphql-tag'
import Fragment from './role.fragment'

export default gql`
	mutation updateRol($id: ID!, $role: RoleUpdate!){
		Access{
			updateRole(id: $id, role: $role ){
				...RoleProperties
			}
		}
	}
	${Fragment}
`