import React, { useState, useEffect, forwardRef, useImperativeHandle } from 'react'
import ReactCrop from 'react-image-crop'
import PropTypes from 'prop-types'

import 'react-image-crop/dist/ReactCrop.css'

const CropImage = forwardRef(({ aspect, value, message, onResult, width = 50, height }, ref) => {
	const [ loading, setLoading ] = useState(false)
	const [ image, setImage ] = useState(null)
	const [ file, setFile ] = useState({ src: null, name: '', type: '' })
	const [ crop, setCrop ] = useState({ aspect, width })
	const [ croppedImageUrl, setCroppedImageUrl ] = useState(null)

	const reset = () => {
		setLoading(false)
		setImage(null)
		setFile({ src: null, name: '', type: '' })
		setCrop({ aspect, width: 50 })
		setCroppedImageUrl(null)
		onResult(null)
	}

	useImperativeHandle(ref, () => ({
		reset: reset,
	}))

	const onSelectFile = (e) => {
		reset()
		if (e.target.files && e.target.files.length > 0) {
			const reader = new FileReader()
			const file = e.target.files[0]
			setLoading(true)
			setCroppedImageUrl(null)
			setCrop({ aspect })
			reader.addEventListener('load', () => {
				const img = new Image()
				img.onload = () => {
					setLoading(false)
					setFile({
						src: reader.result,
						file,
					})
					setCrop({ aspect, height: 400, width: (img.height / img.width) * 400, x: 10, y: 10 })
				}
				img.src = reader.result
			}, false)
			reader.readAsDataURL(file)
		}
	}

	// const clear = () => {
	// 	setLoading(false)
	// 	setImage(null)
	// 	setFile({ src: null, name: '', type: '' })
	// 	setCrop({ aspect })
	// 	setCroppedImageUrl(null)
	// 	onResult(null)
	// }

	const submitted = (e) => {
		e.preventDefault()
		if (image && file.src) {
			const canvas = document.createElement('canvas')
			canvas.width = width
			canvas.height = height
			const ctx = canvas.getContext('2d')
			const scaleX = image.naturalWidth / image.width
			const scaleY = image.naturalHeight / image.height
			ctx.drawImage(image, crop.x * scaleX, crop.y * scaleY, crop.width * scaleX, crop.height * scaleY, 0, 0, width, height)
			new Promise(() => {
				canvas.toBlob((blobFile) => {
					blobFile.name = file.file.name
					const objectUrl = URL.createObjectURL(blobFile)
					setCroppedImageUrl(objectUrl)
					onResult(blobFile)
				}, file.file.type)
			})
		}
	}

	useEffect(() => {
		if (typeof(value) === 'string') {
			setCroppedImageUrl(value)
		}
		// else if (!value){
		// 	reset()
		// }
	}, [ value ])

	return (
		<div className="row justify-content-center crop-image">
			{loading &&
				<div>Cargando</div>
			}
			{!loading && file.src && !croppedImageUrl &&
				<span className="warning">Recorta tu imagen dando click en <i className="fas fa-crop-alt"></i></span>
			}
			<div className={`col-12 p-0 ${!file.src && !loading && !croppedImageUrl ? 'cropGhost' : 'form-group'}`}>
				<label className={`lblFileInptProfileImg ${!file.src && !loading && !croppedImageUrl ? '' : 'd-none'}`}><i className="fa fa-plus"></i><br/><span>{message}</span></label>
				<input className={`${!file.src && !loading && !croppedImageUrl ? '' : 'form-control-file'}`} type="file" accept=".png,.jpg,.jpeg" onChange={onSelectFile} onClick={e => e.target.value = ''}/>
			</div>
			{(file.src || croppedImageUrl) &&
				<div className="col-12">
					<div className="row justify-content-center">
						<div className="col-11">
							{file.src && !croppedImageUrl &&
								<ReactCrop
									src={file.src}
									crop={crop}
									onComplete={setCrop}
									onImageLoaded={setImage}
									onChange={setCrop}
								/>
							}
							{croppedImageUrl &&
								<img className='img-fluid' src={croppedImageUrl} alt="" />
							}
						</div>
						<div className="col-1 px-0 options">
							{!croppedImageUrl && <button type="button" className="btn btn-secondary option crop mb-2" onClick={submitted}><i className="fas fa-crop-alt"></i></button>}
							<button type="button" className="btn btn-secondary trash option" onClick={reset}><i className="fas fa-trash"></i></button>
						</div>
					</div>
				</div>
			}
		</div>
	)
})

CropImage.propTypes = {
	onResult: PropTypes.func,
	width: PropTypes.number,
	height: PropTypes.number,
	aspect: PropTypes.number,
	message: PropTypes.string,
	value: PropTypes.any,
}

export default CropImage
