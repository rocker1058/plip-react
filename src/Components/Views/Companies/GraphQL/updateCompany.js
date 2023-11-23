import gql from 'graphql-tag'
import Fragment from './company.detail.fragment'

export default gql`
	mutation updateCompany($id: ID!, $company: CompanyUpdate!) {
		Company{
			updateCompany(id: $id, company: $company){
				...CompanyDetailProperties
			}
		}
	}
	${Fragment}
`