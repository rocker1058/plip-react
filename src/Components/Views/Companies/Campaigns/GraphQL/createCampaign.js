import gql from 'graphql-tag'
import Fragment from './campaign.fragment'

export default gql`
	mutation createCampaign($campaign: CampaignInput!) {
		Campaign{
			createCampaign(
				campaign: $campaign,
			){
				...CampaignProperties
			}
		}
	}
	${Fragment}
`