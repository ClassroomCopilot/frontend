import { useCallback } from 'react'
import {
	Geometry2d,
	Rectangle2d,
	SVGContainer,
	ShapeUtil,
	T,
	TLBaseShape,
	getPerfectDashProps,
	resizeBox,
	useValue,
	RecordProps,
	TLShapePartial,
	TLShapeId,
	DefaultColorStyle,
	DefaultDashStyle,
	DefaultSizeStyle,
	Vec,
	TLParentId,
} from '@tldraw/tldraw'
import { getSlideLabel, getSlideShowLabel, moveToSlide, moveToSlideShow, useSlides, useSlideShows } from './useSlides'
import './slides.css'
import { SlideLayoutBinding } from './SlideLayoutBindingUtil'
import { logger } from '../../../debugConfig'

export type SlideShowShape = TLBaseShape<
	'slideshow',
	{
		w: number
		h: number
		isCurrentSlideshow: boolean | undefined
		slideCount: number
		slidePattern: 'freeform' | 'horizontal' | 'vertical' | 'grid' | 'radial'
		autoAdvance: boolean
		advanceInterval: number // in milliseconds
		slides: TLShapeId[] // Change from string[] to TLShapeId[]
		slideShowIndex: number
		currentSlideIndex: number
	}
>

export type SlideShape = TLBaseShape<
	'slide',
	{
		w: number
		h: number
		isCurrentSlide: boolean
		parentId: string | null // ID of parent SlideShowShape
		slideIndex: number
	}
>

export const defaultPresentationProps = {
	slideshowWidth: 1920,
	slideshowHeight: 1080,
	slideWidth: 1920,
	slideHeight: 1080,
	slideCount: 10,
	slides: [],
	slidePattern: 'freeform' as const,
	SLIDE_GAP: 50,
	autoAdvance: false,
	advanceInterval: 5000,
	isCurrentSlideshow: false,
	isCurrentSlide: false,
	parentId: null,
	slideIndex: 0,
	slideShowIndex: 0,
}

export class SlideShowShapeUtil extends ShapeUtil<SlideShowShape> {
	static override type = 'slideshow' as const
	static styles = {
		color: DefaultColorStyle,
		dash: DefaultDashStyle,
		size: DefaultSizeStyle,
	} as const
	static override props: RecordProps<SlideShowShape> = {
		w: T.number,
		h: T.number,
		isCurrentSlideshow: T.boolean,
		slideCount: T.number,
		slidePattern: T.string as T.Validator<SlideShowShape['props']['slidePattern']>,
		autoAdvance: T.boolean,
		advanceInterval: T.number,
		slides: T.arrayOf(T.string) as unknown as T.Validator<TLShapeId[]>,
		slideShowIndex: T.number,
		currentSlideIndex: T.number,
	}
	
	override canBind = () => true
	override hideRotateHandle = () => true
	override canResize = () => false

	getDefaultProps(): SlideShowShape['props'] {
		return {
			w: defaultPresentationProps.slideshowWidth,
			h: defaultPresentationProps.slideshowHeight,
			isCurrentSlideshow: defaultPresentationProps.isCurrentSlideshow,
			slideCount: defaultPresentationProps.slideCount,
			slidePattern: defaultPresentationProps.slidePattern,
			autoAdvance: defaultPresentationProps.autoAdvance,
			advanceInterval: defaultPresentationProps.advanceInterval,
			slides: defaultPresentationProps.slides,
			slideShowIndex: defaultPresentationProps.slideShowIndex,
			currentSlideIndex: defaultPresentationProps.slideIndex,
		}
	}

	// TODO: Handle onBeforeCreate
	override onBeforeCreate = (shape: SlideShowShape) => {
		/*
		return {
			...shape,
			props: {
				...shape.props,
			},
		}
		*/
		return shape
	}

	// TODO: Handle onCreated
	onCreated(shape: SlideShowShape) {
		return shape
	}

	override onChildrenChange = (shape: SlideShowShape): TLShapePartial[] => {
		/*
		// Get all descendant shapes
		const descendants = this.editor.getSortedChildIdsForParent(shape.id)
		if (descendants.length === 0) return []

		let minX = Infinity
		let minY = Infinity
		let maxX = -Infinity
		let maxY = -Infinity

		descendants.forEach((childId) => {
			const child = this.editor.getShape(childId)
			if (!child) return
			
			const bounds = this.editor.getShapeGeometry(child).bounds
			minX = Math.min(minX, bounds.minX)
			minY = Math.min(minY, bounds.minY)
			maxX = Math.max(maxX, bounds.maxX)
			maxY = Math.max(maxY, bounds.maxY)
		})

		return [{
			id: shape.id,
			type: 'slideshow',
			props: {
				...shape.props,
				w: maxX - minX + 40,
				h: maxY - minY + 40,
			},
		}]
		*/
		return []
	}
	

	getGeometry(shape: SlideShowShape): Geometry2d {
		return new Rectangle2d({
			width: shape.props.w,
			height: shape.props.h,
			isFilled: false,
		})
	}

	override onRotate = (initial: SlideShowShape) => initial

	override onResize = (shape: SlideShowShape, info: any) => {
		return resizeBox(shape, info)
	}

	override onDoubleClick = (shape: SlideShowShape) => {
		moveToSlideShow(this.editor, shape)
		this.editor.selectNone()
	}

	override onDoubleClickEdge = (shape: SlideShowShape) => {
		moveToSlideShow(this.editor, shape)
		this.editor.selectNone()
	}

	override component(shape: SlideShowShape) {
		const bounds = this.editor.getShapeGeometry(shape).bounds

		// eslint-disable-next-line react-hooks/rules-of-hooks
		const zoomLevel = useValue('zoom level', () => this.editor.getZoomLevel(), [this.editor])

		// eslint-disable-next-line react-hooks/rules-of-hooks
		const slideshows = useSlideShows()
		const index = slideshows.findIndex((s) => s.id === shape.id)

		// eslint-disable-next-line react-hooks/rules-of-hooks
		const handleLabelPointerDown = useCallback(() => this.editor.select(shape.id), [shape.id])

		if (!bounds) return null

		return (
			<>
				<div 
					onPointerDown={handleLabelPointerDown} 
					className={`slide-shape-label ${shape.props.isCurrentSlideshow ? 'current-slide' : ''}`}
					style={{
						// TODO: Hiddenish
						transform: `scale(${ 0.5 /  zoomLevel})`,
						transformOrigin: 'top left'
					}}
				>
					{getSlideShowLabel(shape, index)}
				</div>
				<SVGContainer>
					<rect
					width={shape.props.w}
					height={shape.props.h}
					stroke="var(--color-text)"
					strokeWidth={2}
					fill="none"
					strokeDasharray="4 4"
					/>
				</SVGContainer>
			</>
		)
	}

	indicator(shape: SlideShowShape) {
		return <rect width={shape.props.w} height={shape.props.h} />
	}
}

export class SlideShapeUtil extends ShapeUtil<SlideShape> {
	static override type = 'slide' as const
	static styles = {
		color: DefaultColorStyle,
		dash: DefaultDashStyle,
		size: DefaultSizeStyle,
	} as const
	static override props: RecordProps<SlideShape> = {
		w: T.number,
		h: T.number,
		isCurrentSlide: T.boolean,
		parentId: T.string.nullable(),
		slideIndex: T.number,
	}

	override getDefaultProps(): SlideShape['props'] {
		return {
			w: defaultPresentationProps.slideWidth,
			h: defaultPresentationProps.slideHeight,
			isCurrentSlide: defaultPresentationProps.isCurrentSlide,
			parentId: defaultPresentationProps.parentId,
			slideIndex: defaultPresentationProps.slideIndex,
		}
	}

	override component(shape: SlideShape) {
		const bounds = this.editor.getShapeGeometry(shape).bounds

		// eslint-disable-next-line react-hooks/rules-of-hooks
		const zoomLevel = useValue('zoom level', () => this.editor.getZoomLevel(), [this.editor])

		// eslint-disable-next-line react-hooks/rules-of-hooks
		const slides = useSlides()
		const index = slides.findIndex((s) => s.id === shape.id)

		// eslint-disable-next-line react-hooks/rules-of-hooks
		const handleLabelPointerDown = useCallback(() => this.editor.select(shape.id), [shape.id])

		if (!bounds) return null

		return (
			<>
				{/* Add ghost indicator during translation */}
				{this.editor.isIn('translating') && (
					<SVGContainer>
						{this.ghostIndicator(shape, shape.x, shape.y)}
					</SVGContainer>
				)}
				
				<div 
					onPointerDown={handleLabelPointerDown} 
					className={`slide-shape-label ${shape.props.isCurrentSlide ? 'current-slide' : ''}`}
					style={{
						transform: `scale(${0.75/ zoomLevel})`,
						transformOrigin: 'top left'
					}}
				>
					{getSlideLabel(shape, index)}
				</div>
				<SVGContainer>
					<g
						style={{
							stroke: 'var(--color-text)',
							strokeWidth: 'calc(1px * var(--tl-scale))',
							opacity: this.editor.isIn('translating') ? 0.5 : 0.25,
						}}
						pointerEvents="none"
						strokeLinecap="round"
						strokeLinejoin="round"
					>
						{bounds.sides.map((side, i) => {
							const { strokeDasharray, strokeDashoffset } = getPerfectDashProps(
								side[0].dist(side[1]),
								1 / zoomLevel,
								{
									style: 'dashed',
									lengthRatio: 6,
								}
							)

							return (
								<line
									key={i}
									x1={side[0].x}
									y1={side[0].y}
									x2={side[1].x}
									y2={side[1].y}
									strokeDasharray={strokeDasharray}
									strokeDashoffset={strokeDashoffset}
								/>
							)
						})}
					</g>
				</SVGContainer>
			</>
		)
	}

	canBind({ fromShapeType, toShapeType, bindingType }: {
		fromShapeType: string
		toShapeType: string
		bindingType: string
	}) {
		return fromShapeType === 'slideshow' && toShapeType === 'slide' && bindingType === 'slide-layout'
	}

	override canResize = () => false
	
	override hideRotateHandle = () => true
	
	override onRotate = (initial: SlideShape) => initial
	
	indicator(shape: SlideShape) {
		// Return null during translation to hide the default indicator
		if (this.editor.isIn('translating')) return null
		return <rect width={shape.props.w} height={shape.props.h} />
	}
	
	getGeometry(shape: SlideShape): Geometry2d {
		return new Rectangle2d({
			width: shape.props.w,
			height: shape.props.h,
			isFilled: false,
		})
	}

	override onBeforeCreate = (shape: SlideShape) => {
		/*
		return {
			...shape,
			props: {
				...shape.props,
				isCurrentSlide: false,
				parentId: null,
				slideIndex: 0,
			},
		}
		*/
		return shape
	}

	onCreated(shape: SlideShape) {
		return shape
	}

	override onResize = (shape: SlideShape, info: any) => {
		return resizeBox(shape, info)
	}

	override onDoubleClick = (shape: SlideShape) => {
		moveToSlide(this.editor, shape)
		this.editor.selectNone()
	}

	override onDoubleClickEdge = (shape: SlideShape) => {
		moveToSlide(this.editor, shape)
		this.editor.selectNone()
	}


	private getTargetSlideShow(shape: SlideShape, pageAnchor: Vec) {
		return this.editor.getShapeAtPoint(pageAnchor, {
			hitInside: true,
			filter: (otherShape) =>
				this.editor.canBindShapes({ fromShape: otherShape, toShape: shape, binding: 'slide-layout' }),
		}) as SlideShowShape | undefined
	}

	override onTranslateStart(shape: SlideShape) {
		console.log('🟦 TRANSLATE START 🟦')
		console.log('Shape being moved:', {
			id: shape.id,
			currentIndex: shape.props.slideIndex,
			position: { x: shape.x, y: shape.y }
		})

		const bindings = this.editor.getBindingsToShape<SlideLayoutBinding>(shape, 'slide-layout')
		console.log('Current bindings:', bindings)

		if (bindings.length > 0) {
			console.log('Marking bindings as placeholders')
			this.editor.updateBindings(
				bindings.map(binding => ({
					...binding,
						props: { ...binding.props, placeholder: true }
				}))
			)
		}
	}

	override onTranslate(initial: SlideShape, current: SlideShape): TLShapePartial<SlideShape> | undefined {
		logger.info('translation', '🟨 TRANSLATE UPDATE')
		const parentId = current.props.parentId
		if (!parentId) return

		const maybeSlideshow = this.editor.getShape(parentId as TLParentId)
		if (!maybeSlideshow || maybeSlideshow.type !== 'slideshow') return
		const slideshow = maybeSlideshow as SlideShowShape

		// Get current transform
		const currentTransform = this.editor.getShapePageTransform(current)
		if (!currentTransform) return
		const currentPoint = currentTransform.point()

		const gap = defaultPresentationProps.SLIDE_GAP

		// Calculate target index based on position and pattern
		const currentIndex = slideshow.props.slides.indexOf(current.id)
		let targetIndex: number

		switch (slideshow.props.slidePattern) {
			case 'horizontal':
				targetIndex = Math.max(0, Math.min(
					Math.round((currentPoint.x - slideshow.x - gap) / (current.props.w + gap)),
					slideshow.props.slides.length - 1
				))
				break
			case 'vertical':
				targetIndex = Math.max(0, Math.min(
					Math.round((currentPoint.y - slideshow.y - gap) / (current.props.h + gap)),
					slideshow.props.slides.length - 1
				))
				break
			case 'grid':
				// TODO: Implement grid pattern
				const cols = Math.ceil(Math.sqrt(slideshow.props.slides.length))
				const row = Math.floor((currentPoint.y - slideshow.y - gap) / (current.props.h + gap))
				const col = Math.floor((currentPoint.x - slideshow.x - gap) / (current.props.w + gap))
				targetIndex = Math.max(0, Math.min(
					row * cols + col,
					slideshow.props.slides.length - 1
				))
				break
			case 'radial':
				// TODO: Implement radial pattern
				targetIndex = currentIndex // Placeholder
				break
			default:
				targetIndex = currentIndex
		}

		// Calculate constrained position based on pattern
		let constrainedX: number
		let constrainedY: number

		switch (slideshow.props.slidePattern) {
			case 'horizontal':
				constrainedX = slideshow.x + gap + targetIndex * (current.props.w + gap)
				constrainedY = slideshow.y + gap
				break
			case 'vertical':
				constrainedX = slideshow.x + gap
				constrainedY = slideshow.y + gap + targetIndex * (current.props.h + gap)
				break
			case 'grid':
				// TODO: Implement grid constraints
				const cols = Math.ceil(Math.sqrt(slideshow.props.slides.length))
				constrainedX = slideshow.x + gap + (targetIndex % cols) * (current.props.w + gap)
				constrainedY = slideshow.y + gap + Math.floor(targetIndex / cols) * (current.props.h + gap)
				break
			case 'radial':
				// TODO: Implement radial constraints
				constrainedX = currentPoint.x
				constrainedY = currentPoint.y
				break
			default:
				constrainedX = currentPoint.x
				constrainedY = currentPoint.y
		}

		// Only update array and other slides if index changed
		if (targetIndex !== currentIndex) {
			logger.debug('translation', `Moving slide from ${currentIndex} to ${targetIndex}`)
			
			// Update slideshow array only
			const newSlides = [...slideshow.props.slides]
			newSlides.splice(currentIndex, 1)
			newSlides.splice(targetIndex, 0, current.id)

			this.editor.updateShape<SlideShowShape>({
				id: slideshow.id,
				type: 'slideshow',
				props: {
					...slideshow.props,
					slides: newSlides
				}
			})

			// Update other slides' positions
			newSlides.forEach((slideId, index) => {
				if (slideId === current.id) return // Skip moving slide

				let position: { x: number, y: number }
				switch (slideshow.props.slidePattern) {
					case 'horizontal':
						position = {
							x: slideshow.x + gap + index * (current.props.w + gap),
							y: slideshow.y + gap
						}
						break
					case 'vertical':
						position = {
							x: slideshow.x + gap,
							y: slideshow.y + gap + index * (current.props.h + gap)
						}
						break
					case 'grid':
						// TODO: Implement grid positioning
						const cols = Math.ceil(Math.sqrt(newSlides.length))
						position = {
							x: slideshow.x + gap + (index % cols) * (current.props.w + gap),
							y: slideshow.y + gap + Math.floor(index / cols) * (current.props.h + gap)
						}
						break
					case 'radial':
						// TODO: Implement radial positioning
						position = {
							x: slideshow.x + gap,
							y: slideshow.y + gap
						}
						break
					default:
						position = {
							x: slideshow.x + gap + index * (current.props.w + gap),
							y: slideshow.y + gap
						}
				}

				this.editor.updateShape({
					id: slideId,
					type: 'slide',
					x: position.x,
					y: position.y,
				})
			})
		}

		// Return snapped position for the moving slide
		return {
			id: current.id,
			type: 'slide' as const,
			x: constrainedX,
			y: constrainedY
		}
	}

	override onTranslateEnd(shape: SlideShape) {
		logger.info('translation', '🟥 TRANSLATE END')
		const parentId = shape.props.parentId
		if (!parentId) return

		const maybeSlideshow = this.editor.getShape(parentId as TLParentId)
		if (!maybeSlideshow || maybeSlideshow.type !== 'slideshow') return
		const slideshow = maybeSlideshow as SlideShowShape

		// Now that translation is complete, update all slideIndices to match array order
		this.editor.batch(() => {
			slideshow.props.slides.forEach((slideId, index) => {
				this.editor.updateShape({
					id: slideId,
					type: 'slide',
					props: {
						slideIndex: index
					}
				})
			})
		})
	}

	// Add a new method for the ghost indicator
	ghostIndicator(shape: SlideShape, x: number, y: number) {
		return (
			<g opacity={0.3}>
				<rect 
					x={x} 
					y={y} 
					width={shape.props.w} 
					height={shape.props.h} 
					fill="var(--color-selected)" 
					stroke="var(--color-selected)"
					strokeWidth={2}
					strokeDasharray="4 4"
				/>
			</g>
		)
	}
}