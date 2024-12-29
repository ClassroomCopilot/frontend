import {
	Geometry2d,
	HTMLContainer,
	RecordProps,
	Rectangle2d,
	ShapeUtil,
	T,
	TLBaseShape,
	TLResizeInfo,
	resizeBox,
} from '@tldraw/tldraw'
import { useState, useEffect, useRef } from 'react'
import { getYoutubeTranscript, extractVideoId } from '../../../services/tldraw/tools/youtubeService'

// There's a guide at the bottom of this file!

// [1]
declare global {
    interface Window {
        YT: any;
        onYouTubeIframeAPIReady: () => void;
    }

	interface TranscriptLine {
		start: number;
		duration: number;
		text: string;
	}
}

type IYoutubeEmbedShape = TLBaseShape<
	'youtube-embed',
	{
		w: number
		h: number
        size: number
		transcript_width: number
		transcript_height: number
		video_width: number
		video_height: number
		video_aspect_ratio: number
		video_url: string
		transcript: { start: number; duration: number; text: string }[]
		transcriptVisible: boolean
	}
>

// [2]
export class YoutubeEmbedShapeUtil extends ShapeUtil<IYoutubeEmbedShape> {
	// [a]
	static override type = 'youtube-embed' as const
	static override props: RecordProps<IYoutubeEmbedShape> = {
		w: T.number,
		h: T.number,
        size: T.number,
		transcript_width: T.number,
		transcript_height: T.number,
		video_width: T.number,
		video_height: T.number,
		video_aspect_ratio: T.number,
		video_url: T.string,
		transcript: T.arrayOf(T.object({
			start: T.number,
			duration: T.number,
			text: T.string,
		})),
		transcriptVisible: T.boolean,
	}

	// [b]
	getDefaultProps(): IYoutubeEmbedShape['props'] {
		return {
			w: 16,
			h: 9,
			size: 40,
			transcript_width: 0.3,
			transcript_height: 1,
			video_width: 0.7,
			video_height: 1,
			video_aspect_ratio: 1.778,
			video_url: "https://www.youtube.com/watch?v=uIdjdPm_FU8",
			transcript: [],
			transcriptVisible: true,
		}
	}

	// [c]
	override canEdit() {
		return true
	}
	override canResize() {
		return true
	}
	override isAspectRatioLocked() {
		return true
	}

	// [d]
    // getGeometry is what the editor uses for hit-testing, binding etc.
	getGeometry(shape: IYoutubeEmbedShape): Geometry2d {
		const videoWidth = shape.props.w * shape.props.size;
		const videoHeight = shape.props.h * shape.props.size;
		const totalWidth = shape.props.transcriptVisible 
			? videoWidth + (videoWidth * shape.props.transcript_width)
			: videoWidth;

		return new Rectangle2d({
			width: totalWidth,
			height: videoHeight,
			isFilled: false,
		})
	}

	// [e]
	override onResize(shape: IYoutubeEmbedShape, info: TLResizeInfo<IYoutubeEmbedShape>) {
		const resized = resizeBox(shape, info);
		const newSize = resized.props.size;
		const newWidth = resized.props.w;
		const newHeight = resized.props.h;

		return {
			...resized,
			props: {
				...resized.props,
				size: newSize,
				w: newWidth,
				h: newHeight,
			},
		};
	}

	// [f]
    // component is what the editor uses to render the shape.
    // We need to return the video on the left and the transcript on the right
	component(shape: IYoutubeEmbedShape) {
		const [transcript, setTranscript] = useState<TranscriptLine[]>([]);
		const [currentTime, setCurrentTime] = useState<number>(0);
		const [currentLineIndex, setCurrentLineIndex] = useState<number | null>(null);
		const transcriptRef = useRef<HTMLDivElement | null>(null);
		const hasFetchedTranscript = useRef<boolean>(false);
		const playerRef = useRef<any>(null);
		const timeUpdateIntervalRef = useRef<NodeJS.Timeout | null>(null);
		const [transcriptVisible, setTranscriptVisible] = useState<boolean>(shape.props.transcriptVisible);

		useEffect(() => {
			const fetchTranscript = async () => {
				if (hasFetchedTranscript.current) return;
				
				try {
					const transcriptData = await getYoutubeTranscript(shape.props.video_url);
					
					hasFetchedTranscript.current = true;
					setTranscript(transcriptData);
				} catch (error) {
					console.error('Error fetching transcript:', error);
				}
			};

			fetchTranscript();

			const onYouTubeIframeAPIReady = () => {
				if (playerRef.current) return;
				
				playerRef.current = new (window as any).YT.Player('youtube-player', {
					events: {
						'onReady': onPlayerReady,
						'onStateChange': onPlayerStateChange
					}
				});
			};

			const onPlayerReady = (event: any) => {
				console.log('YouTube player is ready');
			};

			const onPlayerStateChange = (event: any) => {
				if (event.data === (window as any).YT.PlayerState.PLAYING) {
					startTimeUpdates();
				} else {
					stopTimeUpdates();
				}
			};

			const startTimeUpdates = () => {
				timeUpdateIntervalRef.current = setInterval(() => {
					if (playerRef.current?.getCurrentTime) {
						const time = playerRef.current.getCurrentTime();
						setCurrentTime(time);
					}
				}, 1000);
			};

			const stopTimeUpdates = () => {
				if (timeUpdateIntervalRef.current) {
					clearInterval(timeUpdateIntervalRef.current);
					timeUpdateIntervalRef.current = null;
				}
			};

			// Load YouTube iframe API
			const tag = document.createElement('script');
			tag.src = "https://www.youtube.com/iframe_api";
			const firstScriptTag = document.getElementsByTagName('script')[0];
			firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);

			(window as any).onYouTubeIframeAPIReady = onYouTubeIframeAPIReady;

			return () => {
				if (timeUpdateIntervalRef.current) {
					clearInterval(timeUpdateIntervalRef.current);
				}
				playerRef.current = null;
				hasFetchedTranscript.current = false;
			};
		}, [shape.props.video_url]);

		useEffect(() => {
			const newCurrentLineIndex = transcript.findIndex(
				(line, index) => 
					currentTime >= line.start && 
					(index === transcript.length - 1 || currentTime < transcript[index + 1].start)
			);
			
			if (newCurrentLineIndex !== -1 && newCurrentLineIndex !== currentLineIndex) {
				setCurrentLineIndex(newCurrentLineIndex);
			}
		}, [currentTime, transcript, currentLineIndex]);

		useEffect(() => {
			if (currentLineIndex !== null && transcriptRef.current) {
				const transcriptContainer = transcriptRef.current;
				const lineElement = transcriptContainer.children[currentLineIndex] as HTMLElement;
				if (lineElement) {
					const containerRect = transcriptContainer.getBoundingClientRect();
					const lineRect = lineElement.getBoundingClientRect();
					
					// Calculate the desired position (25% from the top of the container)
					const desiredPosition = containerRect.height * 0.25;
					
					// Calculate the current position of the line relative to the container
					const currentPosition = lineRect.top - containerRect.top;
					
					// Calculate the difference between desired and current position
					const scrollDifference = currentPosition - desiredPosition;
					
					// Smooth scroll to the new position
					transcriptContainer.scrollTo({
						top: transcriptContainer.scrollTop + scrollDifference,
						behavior: 'smooth'
					});
				}
			}
		}, [currentLineIndex]);

		const toggleTranscript = () => {
			const newTranscriptVisible = !transcriptVisible;
			setTranscriptVisible(newTranscriptVisible);
			this.editor.updateShape<IYoutubeEmbedShape>({
				id: shape.props.video_url,
				type: 'youtube-embed',
				props: { ...shape.props, transcriptVisible: newTranscriptVisible },
			});
		};

		const { transcript_width, video_url } = shape.props;
		const videoWidth = shape.props.w * shape.props.size;
		const videoHeight = shape.props.h * shape.props.size;

		return (
			<HTMLContainer
				style={{
					width: '100%',
					height: '100%',
					display: 'flex',
					pointerEvents: 'all',
				}}
			>
				<div style={{ display: 'flex', width: '100%', height: '100%' }}>
					<div style={{ 
						width: `${videoWidth}px`, 
						height: `${videoHeight}px`,
						backgroundColor: '#000'
					}}>
						<iframe 
							id="youtube-player"
							style={{ 
								width: '100%', 
								height: '100%', 
							}} 
							src={`https://www.youtube.com/embed/${extractVideoId(video_url)}?enablejsapi=1`}
								allowFullScreen
						/>
					</div>
					{transcriptVisible && (
						<div 
							ref={transcriptRef}
							style={{ 
								width: `${videoWidth * transcript_width}px`, 
								height: '100%', 
								overflowY: 'auto',
								padding: '10px',
								boxSizing: 'border-box',
								backgroundColor: '#f0f0f0',
							}}
						>
							<h3>Transcript</h3>
							{transcript.length > 0 ? (
								transcript.map((line, index) => (
									<div 
										key={index} 
										style={{ 
											backgroundColor: index === currentLineIndex ? '#ffff00' : 'transparent',
											padding: '5px',
											marginBottom: '5px',
											borderRadius: '3px',
											transition: 'background-color 0.3s ease',
											border: index === currentLineIndex ? '1px solid #ffa500' : 'none',
											boxShadow: index === currentLineIndex ? '0 0 5px rgba(255, 165, 0, 0.5)' : 'none'
										}}
									>
										<span style={{ fontWeight: 'bold' }}>{formatTime(line.start)}:</span> {line.text}
									</div>
								))
							) : (
								<p>Loading transcript...</p>
							)}
						</div>
					)}
					<div style={{
						position: 'absolute',
						top: 10,
						left: 10,
						zIndex: 1000,
					}}>
						<select 
							value=""
							onChange={(e) => {
								if (e.target.value === 'toggle-transcript') {
									toggleTranscript();
								}
								e.target.value = "";
							}}
						>
							<option value="">Tools</option>
							<option value="toggle-transcript">Toggle Transcription</option>
							<option value="new-tool">New Tool</option>
							<option value="another-new-tool">Another New Tool</option>
						</select>
					</div>
				</div>
			</HTMLContainer>
		);
	}

	// [g]
	indicator(shape: IYoutubeEmbedShape) {
		return <rect width={shape.props.w * shape.props.size} height={shape.props.h * shape.props.size} />
	}
}

// Helper function to format time
function formatTime(seconds: number): string {
	const minutes = Math.floor(seconds / 60);
	const remainingSeconds = Math.floor(seconds % 60);
	return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
}

// [3]
export const customEmbedShapeUtils = [YoutubeEmbedShapeUtil]

/*
Introduction:

You can create custom shapes in tldraw by creating a shape util and passing it to the Tldraw component.
In this example, we'll create a custom shape that is a simple rectangle with some text inside of it. 

[1] 
Define the shape type. This is a type that extend the `TLBaseShape` generic and defines the shape's 
props. We need to pass in a unique string literal for the shape's type and an object that defines the
shape's props.

[2] 
This is our shape util. In tldraw shape utils are classes that define how a shape behaves and renders.
We can extend the ShapeUtil class and provide the shape type as a generic. If we extended the 
BaseBoxShapeUtil class instead, we wouldn't have define methods such as `getGeometry` and `onResize`.

	[a]
	This is where we define out shape's props and type for the editor. It's important to use the same
	string for the type as we did in [1]. We need to define the shape's props using tldraw's validator 
	library. The validator will help make sure the store always has shape data we can trust.

	[b]
	This is a method that returns the default props for our shape.

	[c]
	Some handy methods for controlling different shape behaviour. You don't have to define these, and 
	they're only shown here so you know they exist. Check out the editable shape example to learn more 
	about creating an editable shape.

	[d]
	The getGeometry method is what the editor uses for hit-testing, binding etc. We're using the
	Rectangle2d class from tldraw's geometry library to create a rectangle shape. If we extended the
	BaseBoxShapeUtil class, we wouldn't have to define this method.

	[e]
	We're using the resizeBox utility method to handle resizing our shape. If we extended the
	BaseBoxShapeUtil class, we wouldn't have to define this method.

	[f]
	The component method defines how our shape renders. We're returning an HTMLContainer here, which
	is a handy component that tldraw exports. It's essentially a div with some special css. There's a
	lot of flexibility here, and you can use any React hooks you want and return any valid JSX.

	[g]
	The indicator is the blue outline around a selected shape. We're just returning a rectangle with the
	same width and height as the shape here. You can return any valid JSX here.

[3]
This is where we render the Tldraw component with our custom shape. We're passing in our custom shape
util as an array to the shapeUtils prop. We're also using the onMount callback to create a shape on 
the canvas. If you want to learn how to add a tool for your shape, check out the custom config example. 
If you want to learn how to programmatically control the canvas, check out the Editor API examples.

*/

