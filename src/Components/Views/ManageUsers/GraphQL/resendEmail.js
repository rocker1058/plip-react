import gql from 'graphql-tag'

export default gql`
	mutation resendEmail($email: Email!){
		User{
			resendConfirmationEmail(email: $email)
		}
	}
`