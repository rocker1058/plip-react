import gql from 'graphql-tag'

export default gql`
	mutation autoVerifyUser($phoneNumber: String!){
		User{
			autoVerifyUser(phoneNumber: $phoneNumber)
		}
	}`