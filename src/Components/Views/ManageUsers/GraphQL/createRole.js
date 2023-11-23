import gql from 'graphql-tag'
import Fragment from './role.fragment'

export default gql`
  mutation createRole($company: ID!, $role: RoleInput!) {
	Access{
    	createRoleInCompany(company: $company, role: $role)
		{
			...RoleProperties
  		}
  	}
  }
  ${Fragment}
`