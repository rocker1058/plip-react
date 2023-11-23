import gql from 'graphql-tag'

export default gql`
	fragment CompanyProperties on Company {
		id
		logo
		legalName
		name
		document {
			type
			number
		}
		phone
	}
`