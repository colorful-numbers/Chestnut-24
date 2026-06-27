import { useEffect, useRef, useState } from 'react'
import { Music2, X } from 'lucide-react'

// Background-music player for the character display.
//
// A circular button sits in the corner of the stage. Clicking it expands a panel
// holding an Apple Music embed (with the embed's own play / pause / scrubbing
// controls). Clicking outside the panel collapses it back to the circle.
//
// The <iframe> stays mounted while collapsed (the panel is only visually hidden)
// so playback continues in the background. Apple Music embeds are cross-origin
// and will not play on localhost; that is expected — they play once deployed.
export default function BgmPlayer({ track, labels = {}, trackNames = {}, className = '' }) {
  const rootRef = useRef(null)
  const [expanded, setExpanded] = useState(false)

  useEffect(() => {
    if (!expanded) return undefined
    const onPointerDown = (event) => {
      if (rootRef.current && !rootRef.current.contains(event.target)) setExpanded(false)
    }
    document.addEventListener('pointerdown', onPointerDown)
    return () => document.removeEventListener('pointerdown', onPointerDown)
  }, [expanded])

  const trackName = track ? trackNames[track.id] || '' : ''

  return (
    <div ref={rootRef} className={`bgm-player ${expanded ? 'is-expanded' : ''} ${className}`}>
      <button
        type="button"
        className="bgm-player__toggle"
        aria-label={labels.open}
        aria-expanded={expanded}
        title={labels.open}
        onClick={() => setExpanded((current) => !current)}
      >
        <Music2 size={18} />
      </button>

      <div className={`bgm-player__panel ${expanded ? 'is-open' : ''}`} aria-hidden={!expanded}>
        <div className="bgm-player__panel-head">
          <span className="bgm-player__track">
            {trackName ? `${labels.now} · ${trackName}` : labels.open}
          </span>
          <button
            type="button"
            className="bgm-player__close"
            aria-label={labels.close}
            title={labels.close}
            onClick={() => setExpanded(false)}
          >
            <X size={14} />
          </button>
        </div>
        {track?.src && (
          <iframe
            key={track.src}
            title={trackName || labels.open}
            className="bgm-player__frame"
            allow="autoplay *; encrypted-media *; fullscreen *; clipboard-write"
            frameBorder="0"
            height="175"
            sandbox="allow-forms allow-popups allow-same-origin allow-scripts allow-storage-access-by-user-activation allow-top-navigation-by-user-activation"
            src={track.src}
          />
        )}
      </div>
    </div>
  )
}
