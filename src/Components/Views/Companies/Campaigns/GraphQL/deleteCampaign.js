import gql from 'graphql-tag'

export default gql`
	mutation deleteCampaign($id: ID!){
		Campaign{
			deleteCampaign(id: $id)
		}
	}`