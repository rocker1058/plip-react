import gql from 'graphql-tag'

export default gql`
	fragment PermissionProperties on Permission {
		id
		name
		friendlyName
		category
		description
		type
	}
`
