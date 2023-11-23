import gql from 'graphql-tag'

export default gql`
	fragment AccessProperties on Access {
		id
		type
		disabled
		company {
			id
			name
		}
		businessLine {
			id
			name
		}
		location{
			id
			name
		}
		roles{
			id
			name
			friendlyName
			type
			isPlip
			description
			permissions{
				id
				name
				friendlyName
				category
				description
			}
		}
		permissions {
			id
			name
			friendlyName
			category
			description
		}
	}
`