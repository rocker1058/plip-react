import gql from 'graphql-tag'
import Fragment from './campaign.fragment'

export default gql`
	mutation updateCampaign($id: ID!, $campaign: CampaignUpdate!) {
		Campaign{
			updateCampaign(id: $id, campaign: $campaign){
				...CampaignProperties
			}
		}
	}
	${Fragment}
`