import gql from 'graphql-tag'

export default gql`
	fragment KeyProperties on Key {
		id
		name
		tags
		active
		createdAt
	}
`