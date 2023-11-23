import gql from 'graphql-tag'
import Fragment from './user.fragment'

export default gql`
	{
		User{
			me {
				...UserProperties
			}
		}
	}
	${Fragment}
`