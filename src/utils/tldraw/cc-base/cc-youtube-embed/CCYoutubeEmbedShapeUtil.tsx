import React, { useEffect, useRef, useState, memo } from 'react'
import { CCBaseShapeUtil, CCBaseShape } from '../CCBaseShapeUtil'
import { CC_YOUTUBE_EMBED_STYLE_CONSTANTS } from './cc-youtube-embed-styles'
import { getYoutubeTranscript, extractVideoId } from './youtubeService'
import { formatTime, Player, OnStateChangeEvent, PlayerState } from './cc-youtube-embed-helpers'
import { ccShapeProps } from '../cc-props'
import { getDefaultCCYoutubeEmbedProps } from '../cc-props'

// Add YouTube types to the global Window interface
declare global {
  interface Window {
    YT: {
      Player: new (
        elementId: string,
        config: {
          events?: {
            onReady?: () => void
            onStateChange?: (event: OnStateChangeEvent) => void
          }
        }
      ) => Player
      PlayerState: PlayerState
    }
    onYouTubeIframeAPIReady: () => void
  }
}

interface TranscriptLine {
  start: number
  duration: number
  text: string
}

export interface CCYoutubeEmbedShape extends CCBaseShape {
  type: 'cc-youtube-embed'
  props: {
    title: string
    w: number
    h: number
    headerColor: string
    isLocked: boolean
    video_url: string
    transcript: TranscriptLine[]
    transcriptVisible: boolean
  }
}

const YoutubeEmbed = memo(({ shape }: { shape: CCYoutubeEmbedShape }) => {
  const [transcript, setTranscript] = useState<TranscriptLine[]>(shape.props.transcript)
  const [currentTime, setCurrentTime] = useState<number>(0)
  const [currentLineIndex, setCurrentLineIndex] = useState<number | null>(null)
  const transcriptRef = useRef<HTMLDivElement | null>(null)
  const hasFetchedTranscript = useRef<boolean>(false)
  const playerRef = useRef<Player | null>(null)
  const timeUpdateIntervalRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    const fetchTranscript = async () => {
      if (hasFetchedTranscript.current) return
      
      try {
        const transcriptData = await getYoutubeTranscript(shape.props.video_url)
        hasFetchedTranscript.current = true
        setTranscript(transcriptData)
      } catch (error) {
        console.error('Error fetching transcript:', error)
      }
    }

    fetchTranscript()

    return () => {
      hasFetchedTranscript.current = false
    }
  }, [shape.props.video_url])

  useEffect(() => {
    const onYouTubeIframeAPIReady = () => {
      if (playerRef.current) return
      
      playerRef.current = new window.YT.Player('youtube-player', {
        events: {
          'onReady': () => console.log('YouTube player is ready'),
          'onStateChange': (event: OnStateChangeEvent) => {
            if (event.data === window.YT.PlayerState.PLAYING) {
              startTimeUpdates()
            } else {
              stopTimeUpdates()
            }
          }
        }
      })
    }

    const startTimeUpdates = () => {
      timeUpdateIntervalRef.current = setInterval(() => {
        if (playerRef.current?.getCurrentTime) {
          const time = playerRef.current.getCurrentTime()
          setCurrentTime(time)
        }
      }, 100)
    }

    const stopTimeUpdates = () => {
      if (timeUpdateIntervalRef.current) {
        clearInterval(timeUpdateIntervalRef.current)
        timeUpdateIntervalRef.current = null
      }
    }

    // Load YouTube iframe API
    if (!document.querySelector('script[src="https://www.youtube.com/iframe_api"]')) {
      const tag = document.createElement('script')
      tag.src = "https://www.youtube.com/iframe_api"
      const firstScriptTag = document.getElementsByTagName('script')[0]
      firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag)
    }

    window.onYouTubeIframeAPIReady = onYouTubeIframeAPIReady

    return () => {
      stopTimeUpdates()
      if (playerRef.current?.destroy) {
        playerRef.current.destroy()
      }
      playerRef.current = null
    }
  }, [shape.props.video_url])

  useEffect(() => {
    const newCurrentLineIndex = transcript.findIndex(
      (line) => {
        const lineEndTime = line.start + line.duration;
        return currentTime >= line.start && currentTime <= lineEndTime;
      }
    )
    
    if (newCurrentLineIndex !== -1 && newCurrentLineIndex !== currentLineIndex) {
      setCurrentLineIndex(newCurrentLineIndex)
      
      // Scroll the active line into view
      if (transcriptRef.current) {
        const transcriptContainer = transcriptRef.current
        const lineElement = transcriptContainer.children[newCurrentLineIndex] as HTMLElement
        if (lineElement) {
          lineElement.scrollIntoView({ behavior: 'smooth', block: 'center' })
        }
      }
    }
  }, [currentTime, transcript, currentLineIndex])

  return (
    <div style={{ display: 'flex', width: '100%', height: '100%' }}>
      <div style={CC_YOUTUBE_EMBED_STYLE_CONSTANTS.VIDEO.container}>
        <iframe 
          id="youtube-player"
          style={{
            ...CC_YOUTUBE_EMBED_STYLE_CONSTANTS.VIDEO.iframe,
            pointerEvents: 'all'
          }}
          src={`https://www.youtube.com/embed/${extractVideoId(shape.props.video_url)}?enablejsapi=1`}
          allowFullScreen
        />
      </div>
      {shape.props.transcriptVisible && (
        <div 
          ref={transcriptRef}
          style={{
            ...CC_YOUTUBE_EMBED_STYLE_CONSTANTS.TRANSCRIPT.container,
            pointerEvents: 'all'
          }}
        >
          <h3 style={CC_YOUTUBE_EMBED_STYLE_CONSTANTS.TRANSCRIPT.title}>Transcript</h3>
          {transcript.length > 0 ? (
            transcript.map((line, index) => (
              <div 
                key={index} 
                style={{
                  ...CC_YOUTUBE_EMBED_STYLE_CONSTANTS.TRANSCRIPT.line,
                  ...(index === currentLineIndex ? CC_YOUTUBE_EMBED_STYLE_CONSTANTS.TRANSCRIPT.activeLine : {})
                }}
              >
                <span style={CC_YOUTUBE_EMBED_STYLE_CONSTANTS.TRANSCRIPT.timestamp}>
                  {formatTime(line.start)}:
                </span> 
                {line.text}
              </div>
            ))
          ) : (
            <p style={CC_YOUTUBE_EMBED_STYLE_CONSTANTS.TRANSCRIPT.loading}>Loading transcript...</p>
          )}
        </div>
      )}
    </div>
  )
})

export class CCYoutubeEmbedShapeUtil extends CCBaseShapeUtil<CCYoutubeEmbedShape> {
  static override type = 'cc-youtube-embed'
  static override props = ccShapeProps['cc-youtube-embed']

  override getDefaultProps(): CCYoutubeEmbedShape['props'] {
    return getDefaultCCYoutubeEmbedProps()
  }

  override isAspectRatioLocked(shape: CCYoutubeEmbedShape) {
    return true
  }

  override getToolbarItems(shape: CCYoutubeEmbedShape) {
    return [
      {
        id: 'toggle-transcript',
        icon: shape.props.transcriptVisible ? '📖' : '📕',
        label: shape.props.transcriptVisible ? 'Hide Transcript' : 'Show Transcript',
        onClick: (e: React.MouseEvent, baseShape: CCBaseShape) => {
          console.log('Toggle transcript clicked')
          e.preventDefault()
          e.stopPropagation()
          
          const youtubeShape = baseShape as CCYoutubeEmbedShape
          console.log('Current visibility:', youtubeShape.props.transcriptVisible)
          
          const newProps = {
            ...youtubeShape.props,
            transcriptVisible: !youtubeShape.props.transcriptVisible
          }
          
          console.log('New visibility:', newProps.transcriptVisible)
          this.editor.updateShape({
            id: youtubeShape.id,
            type: 'cc-youtube-embed',
            props: newProps
          })
        },
        isActive: shape.props.transcriptVisible,
      }
    ]
  }

  // Override slide content binding behavior
  override getSlideContentBindingBehavior(): 'flatten' | 'bind' | 'none' {
    // YouTube embeds should be bound but not flattened to maintain interactivity
    return 'bind'
  }

  override renderContent = (shape: CCYoutubeEmbedShape) => {
    return <YoutubeEmbed shape={shape} />
  }
} 