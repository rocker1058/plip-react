import gql from 'graphql-tag'
import Fragment from './businessLine.fragment'

export default gql`
	query queryCompany($id: ID!){
		BusinessLine{
			businessLine(id: $id){
				...BusinessLineProperties
			}
		}
	}
	${Fragment}
`