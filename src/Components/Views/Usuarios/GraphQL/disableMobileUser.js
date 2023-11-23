import gql from 'graphql-tag'

export default gql`
	mutation disableUser($id: ID!){
		User{
			disableMobileUser(user: $id)
		}
	}`