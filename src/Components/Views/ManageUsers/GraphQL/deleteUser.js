import gql from 'graphql-tag'

export default gql`
	mutation deleteUser($id: ID!, $company: ID!){
		User{
    		deleteUser(user: $id, company: $company)
  		}
	}
`