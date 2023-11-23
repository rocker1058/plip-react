import React, { Component } from 'react'
import PropTypes from 'prop-types'

const COMMA_KEY = 188
const BACKSPACE_KEY = 8

class TagInput extends Component {
	constructor(props) {
		super(props)
		this.state = {
			value: '',
		}
		this.handleChange = this.handleChange.bind(this)
		this.handleKeyUp = this.handleKeyUp.bind(this)
		this.handleKeyDown = this.handleKeyDown.bind(this)
	}

	handleChange(e) {
		this.setState({
			value: e.target.value,
		})
	}

	handleKeyUp(e) {
		const key = e.keyCode

		if (key === COMMA_KEY) {
			this.addTag()
			e.preventDefault()
		}
	}

	handleKeyDown(e) {
		const key = e.keyCode
		if (key === BACKSPACE_KEY && !this.state.value) {
			this.editPrevTag()
		}
	}

	addTag() {
		const { value } = this.state
		let tag = value.trim()

		tag = tag.replace(/,/g, '')

		if (!tag) {
			return
		}

		this.setState({
			value: '',
		}, () => this.props.onTagsChange([ ...this.props.tags, tag ]))
	}

	editPrevTag() {
		const tag = this.props.tags.pop()

		this.setState({ value: tag })
	}

	deleteTag(i) {
		this.props.onTagsChange(this.props.tags.filter((_, index) => index !== i))
	}

	render() {
		return (
			<div className="tagInput">
				<div className="tags">
					<ul className="list-unstyled">
						{this.props.tags.map((tag, i) => (
							<li key={tag + i} className="tag">
								<span className="tagtext">{tag}</span>
								<button className="close" onClick={() => this.deleteTag.bind(this)(i)}><span aria-hidden="true">×</span></button>
							</li>
						))}
					</ul>
					<input
						type="text"
						placeholder="Agrega un tag..."
						value={this.state.value}
						onChange={this.handleChange}
						className="form-control"
						onKeyUp={this.handleKeyUp}
						onKeyDown={this.handleKeyDown}
					/>
				</div>
				<small>
					Presiona <code>,</code> para agregar un tag. Presiona{' '}
					<code>backspace</code> para editar tag anteriores.
				</small>
			</div>
		)
	}
}

TagInput.propTypes = {
	tags: PropTypes.array,
	onTagsChange: PropTypes.func,
}

export default TagInput
