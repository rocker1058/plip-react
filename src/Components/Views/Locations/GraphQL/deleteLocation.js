import gql from 'graphql-tag'

export default gql`
	mutation deleteLocationMutation($id: ID!){
		Location{
			deleteLocation(id: $id)
		}
	}`