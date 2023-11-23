import gql from 'graphql-tag'
import Fragment from './company.detail.fragment'

export default gql`
	query queryCompany($id: ID!){
		Company{
			company(id: $id){
				...CompanyDetailProperties
			}
		}
	}
	${Fragment}
`