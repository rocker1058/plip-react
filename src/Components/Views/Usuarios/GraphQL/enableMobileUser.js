import gql from 'graphql-tag'

export default gql`
	mutation enableUser($id: ID!){
		User{
			enableMobileUser(user: $id)
		}
	}`