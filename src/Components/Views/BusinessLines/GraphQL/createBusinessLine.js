import gql from 'graphql-tag'
import Fragment from './businessLine.fragment'

export default gql`
	mutation createBusinessLine($company: ID!,$businessLine: BusinessLineInput!) {
		BusinessLine{
			createBusinessLine(
				company: $company,
				businessLine: $businessLine
			){
				...BusinessLineProperties
			}
		}
	}
	${Fragment}
`