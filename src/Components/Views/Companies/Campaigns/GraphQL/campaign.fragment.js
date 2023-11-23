import gql from 'graphql-tag'

export default gql`
	fragment CampaignProperties on Campaign {
		id
        company
        name
        start
        end
        status
		impressions
		images{
			id
			imageUrl
			advertisingUrl
			clicks
			type
			deleted
			deletedDate
		}
		conditions{
			businessLine
			country
			region
			city
		}
		createdAt
	}
`
