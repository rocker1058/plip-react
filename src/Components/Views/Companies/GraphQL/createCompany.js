import gql from 'graphql-tag'
import Fragment from './company.fragment'

export default gql`
	mutation createCompany($company: CompanyInput!) {
		Company{
			createCompany(
				company: $company
			){
				...CompanyProperties
			}
		}
	}
	${Fragment}
`