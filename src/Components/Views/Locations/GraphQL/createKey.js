import gql from 'graphql-tag'

export default gql`
	mutation createKey($key: KeyInput!) {
		Key{
			createKey(key: $key){
				id
				name
				tags
				token
				secret
			}
		}
	}`