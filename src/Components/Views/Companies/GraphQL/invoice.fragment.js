import gql from 'graphql-tag'

export default gql`
	fragment InvoiceProperties on Invoice {
		id
		user {
			id
			name
			email
		}
		items
		locationTags
		keyTags
		number
		company{
			id
			name
			logo
		}
		location{
			id
			name
		}
		businessLine{
			id
			name
		}
		total
		points
		paperSaved
		createdAt
		date
		canceled
	}
`