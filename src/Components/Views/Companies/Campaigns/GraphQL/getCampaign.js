import gql from 'graphql-tag'
import Fragment from './campaign.fragment'

export default gql`
	query queryCampaign($id: ID!){
		Campaign{
			campaign(id: $id){
				...CampaignProperties
			}
		}
	}
	${Fragment}
`