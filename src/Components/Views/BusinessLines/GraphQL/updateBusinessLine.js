import gql from 'graphql-tag'
import Fragment from './businessLine.fragment'

export default gql`
	mutation updateBusinessLine($id: ID!, $businessLine: BusinessLineUpdate!) {
		BusinessLine{
			updateBusinessLine(id: $id, businessLine: $businessLine){
				...BusinessLineProperties
			}
		}
	}
	${Fragment}
`