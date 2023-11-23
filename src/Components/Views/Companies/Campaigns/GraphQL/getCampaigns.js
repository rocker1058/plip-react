import gql from 'graphql-tag'
import Fragment from './campaign.fragment'

export default gql`
	query queryCampaigns($company: ID!, $filter: CampaignFilter, $token: ID, $limit: Int, $sortBy: String, $order: Order){
		Campaign{
			campaigns(company: $company, filter: $filter, token: $token, limit: $limit, sortBy: $sortBy, order: $order){
				results{
					...CampaignProperties
				}
				token
			}
		}
	}
	${Fragment}
`