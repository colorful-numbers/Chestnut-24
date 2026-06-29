import { useEffect, useRef, useState } from 'react'
import { Music2, Pause, Play, Volume2, VolumeX, X } from 'lucide-react'

// Background-music player for the character display.
//
// A circular button sits in the corner of the stage. Clicking it expands a panel
// with the now-playing track plus play/pause, mute, and a volume slider.
//
// Playback uses a local <audio> element (track.src) and starts automatically
// when the character display is opened. The original Apple Music embed path is
// kept behind USE_EMBED for future use; flip it to render track.embed instead.
const USE_EMBED = false
const DEFAULT_VOLUME = 0.6

export default function BgmPlayer({ track, labels = {}, trackNames = {}, className = '' }) {
  const rootRef = useRef(null)
  const audioRef = useRef(null)
  const [expanded, setExpanded] = useState(false)
  const [playing, setPlaying] = useState(false)
  const [muted, setMuted] = useState(false)
  const [volume, setVolume] = useState(DEFAULT_VOLUME)

  const trackName = track ? trackNames[track.id] || '' : ''
  const localSrc = !USE_EMBED && track?.src ? track.src : ''
  const embedSrc = USE_EMBED && track?.embed ? track.embed : ''

  useEffect(() => {
    if (!expanded) return undefined
    const onPointerDown = (event) => {
      if (rootRef.current && !rootRef.current.contains(event.target)) setExpanded(false)
    }
    document.addEventListener('pointerdown', onPointerDown)
    return () => document.removeEventListener('pointerdown', onPointerDown)
  }, [expanded])

  // Auto play whenever the track changes (the display is open while mounted). If
  // the browser blocks autoplay, retry once on the first user interaction.
  useEffect(() => {
    const audio = audioRef.current
    if (!audio || !localSrc) return undefined

    audio.src = localSrc
    audio.loop = true
    audio.volume = volume
    audio.muted = muted

    const tryPlay = () => {
      const attempt = audio.play()
      if (attempt?.then) attempt.then(() => setPlaying(true)).catch(() => setPlaying(false))
    }
    tryPlay()
    const onGesture = () => tryPlay()
    window.addEventListener('pointerdown', onGesture, { once: true })
    return () => window.removeEventListener('pointerdown', onGesture)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [localSrc])

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return
    audio.volume = volume
    audio.muted = muted
  }, [volume, muted])

  const togglePlay = () => {
    const audio = audioRef.current
    if (!audio) return
    if (audio.paused) {
      const attempt = audio.play()
      if (attempt?.then) attempt.then(() => setPlaying(true)).catch(() => {})
    } else {
      audio.pause()
      setPlaying(false)
    }
  }

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

        {embedSrc ? (
          <iframe
            key={embedSrc}
            title={trackName || labels.open}
            className="bgm-player__frame"
            allow="autoplay *; encrypted-media *; fullscreen *; clipboard-write"
            frameBorder="0"
            height="175"
            sandbox="allow-forms allow-popups allow-same-origin allow-scripts allow-storage-access-by-user-activation allow-top-navigation-by-user-activation"
            src={embedSrc}
          />
        ) : localSrc ? (
          <>
            <audio
              ref={audioRef}
              preload="auto"
              onPlay={() => setPlaying(true)}
              onPause={() => setPlaying(false)}
            />
            <div className="bgm-player__controls">
              <button
                type="button"
                className="bgm-player__ctrl"
                aria-label={playing ? labels.pause : labels.play}
                title={playing ? labels.pause : labels.play}
                onClick={togglePlay}
              >
                {playing ? <Pause size={16} /> : <Play size={16} />}
              </button>
              <button
                type="button"
                className="bgm-player__ctrl"
                aria-label={muted ? labels.unmute : labels.mute}
                title={muted ? labels.unmute : labels.mute}
                onClick={() => setMuted((current) => !current)}
              >
                {muted ? <VolumeX size={16} /> : <Volume2 size={16} />}
              </button>
              <input
                type="range"
                className="bgm-player__volume"
                min={0}
                max={1}
                step={0.01}
                value={muted ? 0 : volume}
                aria-label={labels.volume}
                onChange={(event) => {
                  setVolume(Number(event.target.value))
                  if (Number(event.target.value) > 0) setMuted(false)
                }}
              />
            </div>
          </>
        ) : null}
      </div>
    </div>
  )
}
