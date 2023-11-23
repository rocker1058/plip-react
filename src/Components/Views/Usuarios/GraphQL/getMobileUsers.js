import gql from 'graphql-tag'

export default gql`
	query queryUsers($token: ID, $limit: Int, $sortBy: String, $filter: MobileUserFilter){
		User{
			mobileUsers(token: $token, limit: $limit, sortBy: $sortBy, filter: $filter ){
				results{
					id
					email
					name
					enabled
					report {
						id
						points
						paperSaved
					}
				}
				token
			}
		}
	}`