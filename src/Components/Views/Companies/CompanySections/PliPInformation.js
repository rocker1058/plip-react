import React, { useState, useEffect } from 'react'
import PropTypes from 'prop-types'
import ContentLoader from 'react-content-loader'
import { useQuery } from 'react-apollo'

import { GET_PLIP_COMPANY_USERS } from '../../ManageUsers/GraphQL'

import emptyImage from '../../../../Assets/img/undraw_security_o890.svg'

function ListLoader(props) {
	return <ContentLoader
		speed={2}
		primaryColor="#f3f3f3"
		secondaryColor="#ecebeb"
		className="ContentLoader"
		{...props}>
		<rect x="0" y="0" rx="0" ry="0" width="400" height="30" />
		<rect x="0" y="35" rx="0" ry="0" width="400" height="30" />
		<rect x="0" y="70" rx="0" ry="0" width="400" height="30" />
		<rect x="0" y="105" rx="0" ry="0" width="400" height="30" />
		<rect x="0" y="140" rx="0" ry="0" width="400" height="30" />
		<rect x="0" y="175" rx="0" ry="0" width="400" height="30" />
	</ContentLoader>
}

function EmptyContent() {
	return (
		<div className="col-12 card emptytable">
			<div className="row justify-content-center">
				<div className="col-4">
					<img className="img-fluid" src={emptyImage} />
				</div>
				<div className="w-100 d-block"></div>
				<div className="col-10 col-sm-6 col-md-4">
					<h5 className="text-center">NO EXISTEN CONTACTOS PLIP</h5>
				</div>
			</div>
		</div>
	)
}

function UserItem({ user }){
	return (
		<tr style={{ height: '70px' }}>
			<td>{user.name}</td>
			<td>{user.lastName}</td>
			<td>{user.email}</td>
			<td>{user.phoneNumber}</td>
		</tr>
	)
}

UserItem.propTypes = {
	user: PropTypes.object,
}

function UsersTable({ users, token, limit, callbacks }) {
	return (
		<div className="col-12 custom-table">
			<div className="table-responsive">
				<table className="table">
					<thead>
						<tr>
							<th scope="col">Nombre</th>
							<th scope="col">Apellido</th>
							<th scope="col">Correo</th>
							<th scope="col">Teléfono</th>
						</tr>
					</thead>
					<tbody>
						{users.map(user => <UserItem key={user.id} user={user} />)}
					</tbody>
				</table>
			</div>
			{ token && users.length >= limit &&
				<div className="row justify-content-center more">
					<div className="col-12 text-center">
						<button onClick={() => callbacks.fetchMore(token)} className="btn btn-lightblue">Mostrar más</button>
					</div>
				</div>
			}
		</div>
	)
}

UsersTable.propTypes = {
	users: PropTypes.array,
	token: PropTypes.string,
	callbacks: PropTypes.object,
	limit: PropTypes.number,
}

function PliPInformation({ company }) {
	const [ inputSearch, setInputSearch ] = useState('')
	const [ searchTimeout, setSearchTimeout ] = useState(null)
	const [ search, setSearch ] = useState(null)
	const [ limit ] = useState(100)
	const [ users, setUsers ] = useState([])
	const [ loading, setLoading ] = useState(true)
	const { data, fetchMore } = useQuery(GET_PLIP_COMPANY_USERS, { variables: { limit, sortBy: 'name', order:'Ascending', ...(search ? { filter: { search, company } } : { filter: { company } }) } })

	useEffect(() => {
		if (data && data.User) {
			setLoading(false)
			setUsers(data.User.plipUsers.results)
		}
	}, [ data ])

	const callbacks = {
		fetchMore: (token) => {
			fetchMore({
				query: GET_PLIP_COMPANY_USERS,
				variables: { company, token },
				updateQuery: (previousResult, { fetchMoreResult }) => {
					return {
						User: {
							...previousResult.User,
							plipUsers: {
								...previousResult.User.users,
								token: fetchMoreResult.User.users.token,
								results: [
									...previousResult.User.users.results,
									...fetchMoreResult.User.users.results,
								],
							},
						},
					}
				},
			})
		},
	}

	return (
		<React.Fragment>
			<div className="col-12 my-3">
				<div className="row">
					<div className="col-12">
						<div className="row justify-content-between">
							<div className="col-md-8">
								<div className="row justify-content-end">
									<div className="col-md-8">
										<input className="form-control" placeholder="Buscar por nombre de contacto" value={inputSearch} onChange={e => {
											const text = e.target.value
											setInputSearch(text)
											if(searchTimeout) {
												clearTimeout(searchTimeout)
											}
											setSearchTimeout(setTimeout(() => {
												setSearch(text)
											}, 1000))
										}}/>
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>
				{ loading &&
					<div className="row">
						<div className="col-12">
							<ListLoader style={{ height: '100%', width: '100%' }} />
						</div>
					</div>
				}
				{ !loading && data.User && users.length === 0 &&
					<div className="row px-3 mt-4 mt-lg-0">
						<EmptyContent callbacks={callbacks} />
					</div>
				}
				{ !loading && data.User && users.length > 0 &&
					<div className="row">
						<UsersTable company={company} users={users} limit={limit} token={data.User.plipUsers.token} callbacks={callbacks}/>
					</div>
				}
			</div>
		</React.Fragment>
	)
}

PliPInformation.propTypes = {
	company: PropTypes.string,
}

export default PliPInformation