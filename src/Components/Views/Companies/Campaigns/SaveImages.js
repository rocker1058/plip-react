import React, { useState, useEffect, useContext, useRef } from 'react'
import PropTypes from 'prop-types'
import { useDispatch } from 'react-redux'
import { useQuery, useMutation } from 'react-apollo'
import { Link } from 'react-router-dom'
import ContentLoader from 'react-content-loader'
import swal from 'sweetalert'

import { GET_COMPANY } from '../GraphQL'
import { GET_CAMPAIGN, UPDATE_CAMPAIGN } from './GraphQL'
import { SET_NAVBAR_PROPERTIES, SET_SIDEBAR_PROPERTIES } from '../../../../Redux/Actions'
import {  CropImage, CustomForm, NotyfContext } from '../../../Common'
import moment from 'moment'

const descriptions = {
	'Pop Up': 'La imagen de tipo Pop Up te permite resaltar información en el momento que el usuario abre la factura',
	'Carrusel': 'Estas imágenes aparecerán en la vista de publicidad una vez el usuario pulsa uno de los banners. Con el carrousel puedes resaltar hasta 3 imágenes',
	'Banner': 'Con estas imágenes podrás invitar al usuario a conocer más sobre tus promociones. ¡Invítalos a pulsarla! Estas imágenes siempre se mostrarán junto a la información de tu factura',
	'General': 'Adjunta aquella publicidad que consideras puede ser interesante para tu usuario. Estas imágenes serán mostradas en la vista de publicidad junto al carrusel',
}

const dimensions = {
	'Pop Up': 'Ancho: 626px / alto: 626px',
	'Carrusel': 'Ancho: 600px / alto: 441px',
	'Banner': 'Ancho: 1389px / alto: 293px',
	'General': 'Ancho: 338px / alto: 338px',
}

const ListLoader = props => (
	<ContentLoader
		speed={2}
		primaryColor="#f3f3f3"
		secondaryColor="#ecebeb"
		className="col-12 mt-5 ContentLoader"
		{...props}>
		<rect x="0" y="0" rx="0" ry="0" width="100%" height="50" />
		<rect x="0" y="55" rx="0" ry="0" width="100%" height="50" />
		<rect x="0" y="110" rx="0" ry="0" width="100%" height="50" />
		<rect x="0" y="165" rx="0" ry="0" width="100%" height="50" />
		<rect x="0" y="220" rx="0" ry="0" width="100%" height="50" />
		<rect x="0" y="275" rx="0" ry="0" width="100%" height="50" />
		<rect x="0" y="300" rx="0" ry="0" width="100%" height="50" />
		<rect x="0" y="355" rx="0" ry="0" width="100%" height="50" />
		<rect x="0" y="410" rx="0" ry="0" width="100%" height="50" />
		<rect x="0" y="465" rx="0" ry="0" width="100%" height="50" />
		<rect x="0" y="520" rx="0" ry="0" width="100%" height="50" />
		<rect x="0" y="575" rx="0" ry="0" width="100%" height="50" />
	</ContentLoader>
)

function FormImage({ getTypeAdvertising, onAddImage, typeAdvertising, onImages, images }){
	const imageRef = useRef()
	const [ image, setImage ] = useState(null)
	const [ advertisingUrl, setadvertisingUrl ] = useState('')
	const [ errorInputImage, setErrorInputImage ] = useState(false)
	const [ errorInputadvertisingUrl, setErrorInputadvertisingUrl ] = useState(false)

	const saveInArray = () => {
		if((advertisingUrl || typeAdvertising === 'banner') && image){
			const newItem = { type: typeAdvertising, advertisingUrl, image }
			onImages([ ...images, newItem ])
			onAddImage(false)
		}
		if(!image){
			setErrorInputImage(true)
		}
		if(!advertisingUrl && (typeAdvertising !== 'banner')){
			setErrorInputadvertisingUrl(true)
		}
	}

	return(
		<>
			<div className="px-3">
				<CropImage
					ref={imageRef}
					width={getTypeAdvertising().width} 
					height={getTypeAdvertising().height}
					advertisingImages={true} 
					aspect={getTypeAdvertising().width / getTypeAdvertising().height}
					onResult={value => {
						setImage(value)	
						setErrorInputImage(false)								
					}}
					value={image}
					message="Da click aquí para agregar una imagen"
				/>
			</div>
			{errorInputImage && <span style={{ color: 'red' }}>Debes subir una imagen</span>}
			{typeAdvertising !== 'banner' &&
				<div className="form-group mt-3">
					<label htmlFor="inputEmail">Añadir URL a la imágen</label>
					<input 
						className="form-control" 
						placeholder="Añadir URL de foto"
						required
						value={advertisingUrl} 
						onChange={e => {
							setadvertisingUrl(e.target.value)
							setErrorInputadvertisingUrl(false)								
						}}/>
					{errorInputadvertisingUrl && <span style={{ color: 'red' }}>Debes añadir la URL de la imágen</span>}
				</div>
			}
			<div className="row justify-content-end mt-3">
				<CustomForm.LoadingButton onClick={saveInArray} className="btn btn-primary mr-3">Siguiente</CustomForm.LoadingButton>
			</div>
		</>
	)
}

FormImage.propTypes = {
	typeAdvertising: PropTypes.string,
	onImages: PropTypes.func,
	images: PropTypes.array,
	onAddImage: PropTypes.func,
	getTypeAdvertising: PropTypes.func,
}

function ListImages({ getTypeAdvertising, images, onImages, onAddImage }){

	const deleteImage = (image, indexCurrent) => {

		swal({
			title: 'Deshabilitar imagen',
			text: 'Una vez deshabilitada esta imagen, no podrás habilitarla nuevamente. Ten en cuenta que este cambio solo se verá reflejado en futuras facturas.',
			icon: 'warning',
			dangerMode: true,
			buttons: [ 'Cancelar', 'Si' ],
		})
			.then((willDelete) => {
				if (willDelete) {
					if(image.imageUrl){
						const newArray = [ ...images ]
						newArray[indexCurrent] = { ...newArray[indexCurrent], deleted: true, deletedDate: moment() }
						onImages(newArray)
					}else{
						onImages(images.filter((_, index) => index !== indexCurrent))
					}
				}
			})
	}
	return(
		<div className="mt-5">
			{images.map((image, index) => {
				if(!image.deleted){
					return (
						<div key={index} className="card-image row py-3 pr-3 mt-3">
							<div className="col-5 align-items-center d-flex">
								<img className="img-fluid" src={image.imageUrl ? image.imageUrl : URL.createObjectURL(image.image)}/>
							</div>
							<div className="col-7 d-flex flex-column ">
								<p>Clicks: {image.clicks || 0}</p>
								{image.type !== 'banner' && <div className="row align-items-center">
									<div className="form-group mb-1">
										<input 
											className="form-control"
											placeholder="Agregar url" 
											value={image.advertisingUrl} 
											onChange={e => {
												const text = e.target.value
												const newArray = [ ...images ]
												newArray[index] = { ...newArray[index], advertisingUrl: text }
												onImages(newArray)
											}}
										/>
									</div>
									<a className="ml-2" target="_blank" href={image.advertisingUrl}>Ir</a>
								</div>
								}
							</div>
							<div className="container-icon-trash"><p onClick={() => deleteImage(image, index)} className="icon-trash">Deshabilitar</p></div>
						</div>
					)
				}
			},
			)}
			{(getTypeAdvertising().maxImages > images.filter((item) => !item.deleted).length) &&
				<div className="row justify-content-end mt-3">
					<CustomForm.LoadingButton onClick={() => onAddImage(true)} className="btn btn-primary">Agregar imagen</CustomForm.LoadingButton>
				</div>
			}
		</div>
	)
}

ListImages.propTypes = {
	images: PropTypes.array,
	onImages: PropTypes.func,
	onAddImage: PropTypes.func,
	getTypeAdvertising: PropTypes.func,
}

function ListDeletedImages({ images }){

	return(
		<div className="mt-5">
			<p>Lista de imágenes deshabilitadas</p>
			{images.map((image, index) => {
				return (
					<div key={index} className="card-image row py-3 pr-3 mt-3">
						<div className="col-5 align-items-center d-flex">
							<img className="img-fluid" src={image.imageUrl ? image.imageUrl : URL.createObjectURL(image.image)}/>
						</div>
						<div className="col-6 d-flex flex-column">
							<p>Clicks: {image.clicks || 0}</p>
							<p>Deshabilitada: {moment(image.deletedDate).format('DD/MMM/YYYY')}</p>
							{image.type !== 'banner' && <div>
								<a target="_blank" href={image.advertisingUrl}>{image.advertisingUrl}</a>
							</div>
							}
						</div>
							
					</div>
				)
			},
			)}
		</div>
	)
}

ListDeletedImages.propTypes = {
	images: PropTypes.array,
}

function SaveImages({ history, match }) {
	const idCompany = match.params.idestablecimiento
	const idCampaign = match.params.idcampaign
	const typeAdvertising = match.params.type

	const dispatch = useDispatch()
	const notyf = useContext(NotyfContext)
	const [ loading, setLoading ] = useState(false)
	const [ addImage, setAddImage ] = useState(false)
	
	const [ company, setCompany ] = useState({})
	const [ campaign, setCampaign ] = useState({})
	const [ images, setImages ] = useState([])

	useEffect(() => {
		dispatch({ type: SET_NAVBAR_PROPERTIES, visibility: true })
		dispatch({ type: SET_SIDEBAR_PROPERTIES, visibility: true })
	}, [])

	const { data: companyInfo } = useQuery(GET_COMPANY, { variables: { id: idCompany }, skip: !idCompany })
	const { data: campaignInfo, loading: loadingCampaign } = useQuery(GET_CAMPAIGN, { variables: { id: idCampaign }, fetchPolicy: 'no-cache' })

	useEffect(() => {
		if (companyInfo && companyInfo.Company && companyInfo.Company.company) {
			setCompany(companyInfo.Company.company)
		}
	}, [ companyInfo ])
	
	useEffect(() => {
		if (campaignInfo && campaignInfo.Campaign && campaignInfo.Campaign.campaign) {
			setCampaign(campaignInfo.Campaign.campaign)
			const getImages = campaignInfo.Campaign.campaign.images ? campaignInfo.Campaign.campaign.images.filter((image) => image.type === typeAdvertising) : []
			setImages(getImages)
		}
	}, [ campaignInfo ])

	const [ updateImages ] = useMutation(UPDATE_CAMPAIGN, {
		onCompleted: () => {
			setLoading(false)
			notyf.open({
				type: 'success',
				message: 'La campaña ha sido actualizada exitosamente',
			})
			history.push({
				pathname: `/establecimientos/${idCompany}/campanas/editar/${idCampaign}`,
			})
		},
		onError: () => {
			setLoading(false)
			notyf.open({
				type: 'error',
				message: 'Error al actualizar campaña. Intenta de nuevo más tarde',
			})
		},
	})

	const onSubmit = () => {
		setLoading(true)
		const otherImages = campaign.images.filter((item) => item.type !== typeAdvertising)
		const groupImages = [ ...images, ...otherImages ].map((item) => {
			delete item.clicks
			delete item.__typename
			return item
		})
		updateImages({
			variables: {
				id: idCampaign,
				campaign:{
					images: groupImages,
				},
			},
			context: {
				upload: true,
			},
		})
	}

	const getTypeAdvertising = () => {
		switch(typeAdvertising){
		case 'popup':
			return {
				name: 'Pop Up',
				maxImages: 1,
				width: 626, 
				height: 626,
			}
		case 'carousel':
			return {
				name: 'Carrusel',
				maxImages: 3,
				width: 600, 
				height: 441,
			}
		case 'banner':
			return {
				name: 'Banner',
				maxImages: 2,
				width: 1389, 
				height: 293,
			}
		case 'general':
			return {
				name: 'General',
				maxImages: 6,
				width: 338, 
				height: 338,
			}
		}
	}

	return (
		<div className="container mt-2">
			<div className="row">
				<div className="col-12 col-md-6">
					<nav aria-label="breadcrumb">
						<ol className="breadcrumb">
							{<li className="breadcrumb-item">Establecimiento: <Link to={`/establecimientos/${company.id}?tab=campaigns`}>{company === 'PliP' ? 'PliP' : company.name}</Link></li>}
							{<li className="breadcrumb-item">Campaña: <Link to={`/establecimientos/${company.id}/campanas/editar/${campaign.id}/`}>{campaign.name}</Link></li>}
							<li className="breadcrumb-item">{getTypeAdvertising().name}</li>
						</ol>
					</nav>
				</div>
				<div className="col-12 col-md-6">
					{images.length > 0 &&
						<div className="row justify-content-end">
							<CustomForm.LoadingButton loading={loading} className="btn btn-primary mr-2" onClick={onSubmit}>Guardar cambios</CustomForm.LoadingButton>
						</div>
					}
				</div>
			</div>
			<div className="row justify-content-center">
				<div className="col-12 col-md-6 mb-5">
					<h5 className="text-center mt-4">{`${getTypeAdvertising().name} - ${images.filter((item) => !item.deleted).length} de ${getTypeAdvertising().maxImages} imágenes`}</h5>
					<p className="text-center mt-2">{descriptions[getTypeAdvertising().name]}</p>
					<p className="text-center mt-2">{dimensions[getTypeAdvertising().name]}</p>
					{((images.filter((item) => !item.deleted).length < 1 || addImage) && !loadingCampaign) &&
						<FormImage getTypeAdvertising={getTypeAdvertising} typeAdvertising={typeAdvertising} onImages={setImages} onAddImage={setAddImage} images={images}/>
					}
					{(images.filter((item) => !item.deleted).length > 0 && !addImage && !loadingCampaign) &&
						<ListImages getTypeAdvertising={getTypeAdvertising} onImages={setImages} images={images} onAddImage={setAddImage}/>
					}
					{(images.filter((item) => item.deleted && item.imageUrl).length > 0 && !loadingCampaign) &&
						<ListDeletedImages images={images.filter((item) => item.deleted && item.imageUrl)} />
					}
					{loadingCampaign &&
						<ListLoader/>
					}
				</div>
			</div>
		</div>
	)
}

SaveImages.propTypes = {
	match: PropTypes.object,
	history: PropTypes.object,
}

export default SaveImages
