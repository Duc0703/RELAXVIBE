import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Link, useParams, useSearchParams } from 'react-router-dom'
import TrailerModal from '../components/TrailerModal'
import { useLocalLibrary } from '../hooks/useLocalLibrary'
import { useOPhimMovieDetail } from '../hooks/useOPhimMovieDetail'
import { getHeroMetaItems } from '../utils/movieDisplay'
import { getWatchProgress, saveWatchProgress } from '../utils/localLibrary'
import { cn, ui } from '../utils/styles'

const playerButtonClass = 'inline-flex size-10 items-center justify-center rounded-full border border-white/15 bg-black/45 text-[#f7fbff] transition hover:border-[#ff9f1a] hover:text-[#ffd69a]'
const chipClass = 'min-h-10 rounded-lg border border-[rgba(255,179,71,0.45)] bg-[#070b12]/95 px-3 py-2 text-sm font-extrabold text-[#f7fbff] transition hover:border-[#ffe4c7] hover:text-[#ffd69a]'

function PlayerIcon({ name }) {
    const labels = {
        play: '▶',
        pause: 'Ⅱ',
        mute: '×',
        volume: '♪',
        fullscreen: '⛶',
        minimize: '□',
        reload: '↻',
        source: '↗',
    }

    return <span className="text-sm font-black leading-none" aria-hidden="true">{labels[name] || '•'}</span>
}

function HlsVideoPlayer({ poster, src, title, initialTime = 0, onProgress }) {
    const hlsRef = useRef(null)
    const playerRef = useRef(null)
    const restoredTimeRef = useRef(false)
    const lastProgressSaveRef = useRef(0)
    const videoRef = useRef(null)
    const [currentTime, setCurrentTime] = useState(0)
    const [duration, setDuration] = useState(0)
    const [errorMessage, setErrorMessage] = useState('')
    const [isFullscreen, setIsFullscreen] = useState(false)
    const [isLoading, setIsLoading] = useState(true)
    const [isMuted, setIsMuted] = useState(false)
    const [isPlaying, setIsPlaying] = useState(false)
    const [showControls, setShowControls] = useState(true)
    const [qualityLevels, setQualityLevels] = useState([])
    const [selectedQuality, setSelectedQuality] = useState(-1)
    const [isPortraitVideo, setIsPortraitVideo] = useState(false)
    const [volume, setVolume] = useState(1)

    useEffect(() => {
        const video = videoRef.current

        if (!video || !src) {
            return undefined
        }

        setErrorMessage('')
        setIsLoading(true)
        setIsPlaying(false)
        setQualityLevels([])
        setSelectedQuality(-1)
        setIsPortraitVideo(false)
        setCurrentTime(0)
        setDuration(0)
        restoredTimeRef.current = false
        lastProgressSaveRef.current = 0

        if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = src

            return () => {
                video.removeAttribute('src')
                video.load()
            }
        }

        let hlsInstance = null
        let isCancelled = false

        import('hls.js').then(({ default: Hls }) => {
            if (isCancelled || !video) {
                return
            }

            if (!Hls.isSupported()) {
                setErrorMessage('Trình duyệt này chưa hỗ trợ phát HLS.')
                return
            }

            hlsInstance = new Hls({
                enableWorker: true,
                lowLatencyMode: true,
            })
            hlsRef.current = hlsInstance

            hlsInstance.loadSource(src)
            hlsInstance.attachMedia(video)
            hlsInstance.on(Hls.Events.MANIFEST_PARSED, () => {
                setQualityLevels(
                    hlsInstance.levels.map((level, index) => ({
                        height: level.height,
                        index,
                    })),
                )
            })
            hlsInstance.on(Hls.Events.ERROR, (_, data) => {
                if (data.fatal) {
                    setErrorMessage('Không thể phát nguồn M3U8 này. Hãy thử tập hoặc server khác.')
                    setIsLoading(false)
                }
            })
        }).catch(() => {
            if (!isCancelled) {
                setErrorMessage('Không thể tải trình phát HLS.')
                setIsLoading(false)
            }
        })

        return () => {
            isCancelled = true

            if (hlsInstance) {
                hlsInstance.destroy()
            }
            hlsRef.current = null
        }
    }, [src])

    useEffect(() => {
        const video = videoRef.current

        if (!video) {
            return undefined
        }

        const restorePlaybackTime = () => {
            const nextTime = Number(initialTime)

            if (restoredTimeRef.current || !Number.isFinite(nextTime) || nextTime < 5) {
                return
            }

            if (Number.isFinite(video.duration) && video.duration > 0 && nextTime > video.duration - 6) {
                restoredTimeRef.current = true
                return
            }

            video.currentTime = nextTime
            restoredTimeRef.current = true
            setCurrentTime(nextTime)
        }

        const syncTime = () => {
            const nextTime = video.currentTime || 0
            const nextDuration = Number.isFinite(video.duration) ? video.duration : 0

            setCurrentTime(nextTime)

            if (onProgress && nextTime - lastProgressSaveRef.current >= 5) {
                lastProgressSaveRef.current = nextTime
                onProgress(nextTime, nextDuration)
            }
        }
        const syncDuration = () => {
            setDuration(Number.isFinite(video.duration) ? video.duration : 0)
            restorePlaybackTime()
        }
        const syncVideoShape = () => {
            if (video.videoWidth && video.videoHeight) {
                setIsPortraitVideo(video.videoHeight > video.videoWidth)
            }
        }
        const handleCanPlay = () => {
            setIsLoading(false)
            restorePlaybackTime()
        }
        const handleEnded = () => setIsPlaying(false)
        const handlePause = () => {
            setIsPlaying(false)

            if (onProgress) {
                onProgress(video.currentTime || 0, Number.isFinite(video.duration) ? video.duration : 0)
            }
        }
        const handlePlay = () => setIsPlaying(true)
        const handleWaiting = () => setIsLoading(true)
        const handlePageHide = () => {
            if (onProgress) {
                onProgress(video.currentTime || 0, Number.isFinite(video.duration) ? video.duration : 0)
            }
        }

        video.addEventListener('canplay', handleCanPlay)
        video.addEventListener('durationchange', syncDuration)
        video.addEventListener('ended', handleEnded)
        video.addEventListener('loadedmetadata', syncDuration)
        video.addEventListener('loadedmetadata', syncVideoShape)
        video.addEventListener('resize', syncVideoShape)
        video.addEventListener('pause', handlePause)
        video.addEventListener('play', handlePlay)
        video.addEventListener('playing', handleCanPlay)
        video.addEventListener('timeupdate', syncTime)
        video.addEventListener('waiting', handleWaiting)
        window.addEventListener('pagehide', handlePageHide)

        return () => {
            video.removeEventListener('canplay', handleCanPlay)
            video.removeEventListener('durationchange', syncDuration)
            video.removeEventListener('ended', handleEnded)
            video.removeEventListener('loadedmetadata', syncDuration)
            video.removeEventListener('loadedmetadata', syncVideoShape)
            video.removeEventListener('resize', syncVideoShape)
            video.removeEventListener('pause', handlePause)
            video.removeEventListener('play', handlePlay)
            video.removeEventListener('playing', handleCanPlay)
            video.removeEventListener('timeupdate', syncTime)
            video.removeEventListener('waiting', handleWaiting)
            window.removeEventListener('pagehide', handlePageHide)
        }
    }, [initialTime, onProgress])

    useEffect(() => {
        const handleFullscreenChange = () => setIsFullscreen(document.fullscreenElement === playerRef.current)

        document.addEventListener('fullscreenchange', handleFullscreenChange)

        return () => document.removeEventListener('fullscreenchange', handleFullscreenChange)
    }, [])

    useEffect(() => {
        if (!isPlaying || errorMessage) {
            setShowControls(true)
            return undefined
        }

        const timeoutId = window.setTimeout(() => setShowControls(false), 2600)

        return () => window.clearTimeout(timeoutId)
    }, [errorMessage, isPlaying, showControls])

    const revealControls = () => {
        setShowControls(true)
    }

    const togglePlayback = () => {
        const video = videoRef.current

        if (!video) {
            return
        }

        if (video.paused) {
            video.play().catch(() => {
                setErrorMessage('Trình duyệt đã chặn tự động phát. Hãy bấm phát lại.')
            })
            return
        }

        video.pause()
    }

    const seekTo = (event) => {
        const video = videoRef.current
        const nextTime = Number(event.target.value)

        if (!video) {
            return
        }

        video.currentTime = nextTime
        setCurrentTime(nextTime)

        if (onProgress) {
            onProgress(nextTime, Number.isFinite(video.duration) ? video.duration : 0)
        }
    }

    const changeVolume = (event) => {
        const video = videoRef.current
        const nextVolume = Number(event.target.value)

        if (!video) {
            return
        }

        video.volume = nextVolume
        video.muted = nextVolume === 0
        setVolume(nextVolume)
        setIsMuted(video.muted)
    }

    const toggleMute = () => {
        const video = videoRef.current

        if (!video) {
            return
        }

        video.muted = !video.muted
        setIsMuted(video.muted)
    }

    const toggleFullscreen = () => {
        const player = playerRef.current

        if (!player) {
            return
        }

        if (document.fullscreenElement) {
            document.exitFullscreen()
            return
        }

        player.requestFullscreen?.()
    }

    const changeQuality = (event) => {
        const nextQuality = Number(event.target.value)

        if (hlsRef.current) {
            hlsRef.current.currentLevel = nextQuality
        }

        setSelectedQuality(nextQuality)
    }

    const progressMax = duration || 0
    const progressPercent = duration ? (currentTime / duration) * 100 : 0

    return (
        <div
            className={cn(
                'group relative w-full overflow-hidden rounded-lg bg-[#02050b] shadow-[0_24px_70px_rgba(0,0,0,0.46)]',
                isPortraitVideo ? 'mx-auto aspect-[9/16] max-h-[78vh] max-w-[430px] md:aspect-video md:max-h-none md:max-w-none' : 'aspect-video',
            )}
            ref={playerRef}
            onMouseMove={revealControls}
            onTouchStart={revealControls}
        >
            <video
                ref={videoRef}
                className={cn('h-full w-full bg-black', isPortraitVideo ? 'object-cover md:object-contain' : 'object-contain')}
                playsInline
                poster={poster}
                preload="metadata"
                title={title}
                onClick={togglePlayback}
            />
            {!isPlaying && !errorMessage && (
                <button
                    type="button"
                    className="absolute left-1/2 top-1/2 z-20 grid size-16 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border border-[rgba(255,179,71,0.65)] bg-[#070b12]/90 shadow-[0_18px_48px_rgba(255,159,26,0.22)] transition hover:scale-105 sm:size-20"
                    onClick={togglePlayback}
                    aria-label="Phát video"
                >
                    <span className="ml-1 block size-0 border-y-[10px] border-l-[15px] border-y-transparent border-l-[#f7fbff] sm:border-y-[12px] sm:border-l-[18px]" />
                </button>
            )}
            {isLoading && !errorMessage && (
                <div className="absolute left-4 top-4 z-20 rounded-full bg-black/70 px-4 py-2 text-sm font-extrabold text-[#ffb347]">Đang tải...</div>
            )}
            {errorMessage && (
                <div className="absolute inset-0 z-20 grid place-items-center bg-black/70 p-6 text-center font-bold text-[#f7fbff]">
                    {errorMessage}
                </div>
            )}
            <div className={cn('absolute inset-x-0 bottom-0 z-30 grid gap-3 bg-gradient-to-t from-black/90 to-transparent p-3 transition sm:p-4', !showControls && isPlaying && 'opacity-0')} onFocus={revealControls}>
                <input
                    className="h-1.5 w-full accent-[#ff9f1a]"
                    type="range"
                    min="0"
                    max={progressMax}
                    step="0.1"
                    value={Math.min(currentTime, progressMax)}
                    onChange={seekTo}
                    aria-label="Tua video"
                    style={{ '--progress': `${progressPercent}%` }}
                />
                <div className="grid grid-cols-[auto_minmax(0,1fr)_auto_auto] items-center gap-2 sm:flex sm:flex-wrap sm:gap-3">
                    <button
                        type="button"
                        className={playerButtonClass}
                        onClick={togglePlayback}
                        aria-label={isPlaying ? 'Tạm dừng' : 'Phát'}
                        title={isPlaying ? 'Tạm dừng' : 'Phát'}
                    >
                        <PlayerIcon name={isPlaying ? 'pause' : 'play'} />
                    </button>
                    <div className="min-w-0 text-xs font-bold text-[#f7fbff] sm:text-sm">
                        {formatTime(currentTime)} / {formatTime(duration)}
                    </div>
                    <button
                        type="button"
                        className={playerButtonClass}
                        onClick={toggleMute}
                        aria-label={isMuted || volume === 0 ? 'Bật tiếng' : 'Tắt tiếng'}
                        title={isMuted || volume === 0 ? 'Bật tiếng' : 'Tắt tiếng'}
                    >
                        <PlayerIcon name={isMuted || volume === 0 ? 'mute' : 'volume'} />
                    </button>
                    <input
                        className="hidden w-24 accent-[#ff9f1a] sm:block"
                        type="range"
                        min="0"
                        max="1"
                        step="0.05"
                        value={isMuted ? 0 : volume}
                        onChange={changeVolume}
                        aria-label="Âm lượng"
                    />
                    {qualityLevels.length > 0 && (
                        <select
                            className="hidden min-h-9 rounded-lg border border-white/15 bg-black/60 px-2 text-sm font-bold text-[#f7fbff] outline-none sm:block"
                            value={selectedQuality}
                            onChange={changeQuality}
                            aria-label="Chất lượng"
                        >
                            <option value="-1">Auto</option>
                            {qualityLevels.map((level) => (
                                <option key={level.index} value={level.index}>
                                    {level.height ? `${level.height}p` : `Level ${level.index + 1}`}
                                </option>
                            ))}
                        </select>
                    )}
                </div>
            </div>
            <button
                type="button"
                className={cn('absolute bottom-3 right-3 z-40 sm:bottom-4 sm:right-4', playerButtonClass, !showControls && isPlaying && 'opacity-0')}
                onClick={toggleFullscreen}
                aria-label={isFullscreen ? 'Thoát toàn màn hình' : 'Toàn màn hình'}
                title={isFullscreen ? 'Thoát toàn màn hình' : 'Toàn màn hình'}
            >
                <PlayerIcon name={isFullscreen ? 'minimize' : 'fullscreen'} />
            </button>
        </div>
    )
}

function EmbedVideoPlayer({ poster, src, title }) {
    const embedRef = useRef(null)
    const [hasStarted, setHasStarted] = useState(false)
    const [isFullscreen, setIsFullscreen] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [reloadKey, setReloadKey] = useState(0)

    useEffect(() => {
        const handleFullscreenChange = () => setIsFullscreen(document.fullscreenElement === embedRef.current)

        document.addEventListener('fullscreenchange', handleFullscreenChange)

        return () => document.removeEventListener('fullscreenchange', handleFullscreenChange)
    }, [])

    useEffect(() => {
        setHasStarted(false)
        setIsLoading(false)
        setReloadKey(0)
    }, [src])

    const startEmbed = () => {
        setHasStarted(true)
        setIsLoading(true)
    }

    const reloadEmbed = () => {
        setReloadKey((currentKey) => currentKey + 1)
        setIsLoading(true)
    }

    const toggleFullscreen = () => {
        const player = embedRef.current

        if (!player) {
            return
        }

        if (document.fullscreenElement) {
            document.exitFullscreen()
            return
        }

        player.requestFullscreen?.()
    }

    return (
        <div className="relative aspect-video w-full overflow-hidden rounded-lg bg-[#02050b] shadow-[0_24px_70px_rgba(0,0,0,0.46)]" ref={embedRef}>
            {hasStarted ? (
                <iframe
                    key={`${src}-${reloadKey}`}
                    src={src}
                    title={title}
                    className="h-full w-full border-0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    onLoad={() => setIsLoading(false)}
                />
            ) : (
                <div
                    className="absolute inset-0 grid place-items-center bg-cover bg-center p-6 text-center before:absolute before:inset-0 before:bg-black/70"
                    style={poster ? { backgroundImage: `url(${poster})` } : undefined}
                >
                    <button
                        type="button"
                        className="relative z-10 mb-5 grid size-20 place-items-center rounded-full border border-[rgba(255,179,71,0.65)] bg-[#070b12]/90 shadow-[0_18px_48px_rgba(255,159,26,0.22)] transition hover:scale-105"
                        onClick={startEmbed}
                        aria-label="Bắt đầu xem"
                    >
                        <span className="ml-1 block size-0 border-y-[12px] border-l-[18px] border-y-transparent border-l-[#f7fbff]" />
                    </button>
                    <div className="relative z-10">
                        <h2 className="mb-2 text-2xl font-black text-[#f7fbff]">{title}</h2>
                        <p className="text-[#d4ccbb]">Nguồn phát embed sẽ mở trong khung xem.</p>
                    </div>
                </div>
            )}

            {isLoading && (
                <div className="absolute left-4 top-4 z-20 rounded-full bg-black/70 px-4 py-2 text-sm font-extrabold text-[#ffb347]">Đang tải...</div>
            )}

            <div className="absolute bottom-4 right-4 z-30 flex gap-2">
                {!hasStarted && (
                    <button
                        type="button"
                        className={playerButtonClass}
                        onClick={startEmbed}
                        aria-label="Bắt đầu xem"
                        title="Bắt đầu xem"
                    >
                        <PlayerIcon name="play" />
                    </button>
                )}
                {hasStarted && (
                    <button
                        type="button"
                        className={playerButtonClass}
                        onClick={reloadEmbed}
                        aria-label="Tải lại nguồn phát"
                        title="Tải lại nguồn phát"
                    >
                        <PlayerIcon name="reload" />
                    </button>
                )}
                <button
                    type="button"
                    className={playerButtonClass}
                    onClick={toggleFullscreen}
                    aria-label={isFullscreen ? 'Thoát toàn màn hình' : 'Toàn màn hình'}
                    title={isFullscreen ? 'Thoát toàn màn hình' : 'Toàn màn hình'}
                >
                    <PlayerIcon name={isFullscreen ? 'minimize' : 'fullscreen'} />
                </button>
                <a
                    className={playerButtonClass}
                    href={src}
                    target="_blank"
                    rel="noreferrer"
                    aria-label="Mở nguồn phát"
                    title="Mở nguồn phát"
                >
                    <PlayerIcon name="source" />
                </a>
            </div>
        </div>
    )
}

function formatTime(value) {
    if (!Number.isFinite(value) || value <= 0) {
        return '00:00'
    }

    const totalSeconds = Math.floor(value)
    const hours = Math.floor(totalSeconds / 3600)
    const minutes = Math.floor((totalSeconds % 3600) / 60)
    const seconds = totalSeconds % 60
    const paddedMinutes = String(minutes).padStart(2, '0')
    const paddedSeconds = String(seconds).padStart(2, '0')

    if (hours > 0) {
        return `${hours}:${paddedMinutes}:${paddedSeconds}`
    }

    return `${paddedMinutes}:${paddedSeconds}`
}

function isHlsSource(url) {
    return typeof url === 'string' && /\.m3u8(?:$|[?#])/i.test(url)
}

function Watch() {
    const { id } = useParams()
    const [searchParams] = useSearchParams()
    const { movie, episodeServers, loading } = useOPhimMovieDetail(id)
    const [selectedServerIndex, setSelectedServerIndex] = useState(0)
    const [selectedEpisodeIndex, setSelectedEpisodeIndex] = useState(0)
    const [isTrailerOpen, setIsTrailerOpen] = useState(false)
    const initializedPlaybackRef = useRef('')
    const { isFavorite } = useLocalLibrary()

    const availableServers = useMemo(
        () => episodeServers.filter((server) => server.server_data?.length > 0),
        [episodeServers],
    )
    const selectedServer = availableServers[selectedServerIndex] || availableServers[0]
    const selectedEpisodes = selectedServer?.server_data || []
    const selectedEpisode = selectedEpisodes[selectedEpisodeIndex] || selectedEpisodes[0]
    const hlsSource = isHlsSource(selectedEpisode?.link_m3u8)
        ? selectedEpisode.link_m3u8
        : ''
    const embedSource = selectedEpisode?.link_embed || (!hlsSource && selectedEpisode?.link_m3u8) || ''
    const hasPlayableEpisode = Boolean(hlsSource || embedSource)

    useEffect(() => {
        const initKey = `${id || ''}:${availableServers.length}`

        if (!id || availableServers.length === 0 || initializedPlaybackRef.current === initKey) {
            return
        }

        const savedProgress = getWatchProgress(id)
        const queryServerIndex = Number(searchParams.get('server'))
        const queryEpisodeIndex = Number(searchParams.get('episode'))
        const hasQueryServer = Number.isInteger(queryServerIndex) && queryServerIndex >= 0 && queryServerIndex < availableServers.length
        const nextServerIndex = hasQueryServer
            ? queryServerIndex
            : Number.isInteger(savedProgress?.serverIndex) && savedProgress.serverIndex >= 0 && savedProgress.serverIndex < availableServers.length
                ? savedProgress.serverIndex
                : 0
        const nextEpisodes = availableServers[nextServerIndex]?.server_data || []
        const hasQueryEpisode = Number.isInteger(queryEpisodeIndex) && queryEpisodeIndex >= 0 && queryEpisodeIndex < nextEpisodes.length
        const nextEpisodeIndex = hasQueryEpisode
            ? queryEpisodeIndex
            : Number.isInteger(savedProgress?.episodeIndex) && savedProgress.episodeIndex >= 0 && savedProgress.episodeIndex < nextEpisodes.length
                ? savedProgress.episodeIndex
                : 0

        setSelectedServerIndex(nextServerIndex)
        setSelectedEpisodeIndex(nextEpisodeIndex)
        initializedPlaybackRef.current = initKey
    }, [availableServers, id, searchParams])

    const initialPlaybackTime = useMemo(() => {
        const queryTime = Number(searchParams.get('t'))

        if (Number.isFinite(queryTime) && queryTime > 0) {
            return queryTime
        }

        const savedProgress = id ? getWatchProgress(id) : null
        const isSameEpisode = savedProgress
            && savedProgress.serverIndex === selectedServerIndex
            && savedProgress.episodeIndex === selectedEpisodeIndex

        return isSameEpisode ? savedProgress.currentTime || 0 : 0
    }, [id, searchParams, selectedEpisodeIndex, selectedServerIndex])

    const saveCurrentProgress = useCallback((currentTime, duration) => {
        if (!movie || !isFavorite(movie.id)) {
            return
        }

        saveWatchProgress({
            movieId: movie.id,
            movieTitle: movie.title,
            poster: movie.poster,
            backdrop: movie.backdrop,
            serverIndex: selectedServerIndex,
            episodeIndex: selectedEpisodeIndex,
            episodeName: selectedEpisode?.name || selectedEpisode?.filename || `Tập ${selectedEpisodeIndex + 1}`,
            episodeSlug: selectedEpisode?.slug || '',
            currentTime,
            duration,
        })
    }, [isFavorite, movie, selectedEpisode, selectedEpisodeIndex, selectedServerIndex])

    if (loading) {
        return <div className={ui.loading}>Đang tải trình phát...</div>
    }

    if (!movie) {
        return (
            <div className={cn(ui.page, 'grid place-items-center text-center')}>
                <div>
                    <h1 className={ui.title}>Không tìm thấy phim</h1>
                    <p className={cn(ui.muted, 'mb-6')}>Phim bạn muốn xem hiện chưa có trong thư viện.</p>
                    <Link to="/" className={ui.button}>Về trang chủ</Link>
                </div>
            </div>
        )
    }

    const metaItems = getHeroMetaItems(movie)
    const currentEpisodeName = selectedEpisode?.name || selectedEpisode?.filename || 'Tập mới nhất'

    return (
        <div className="min-h-[calc(100vh-200px)] bg-[linear-gradient(180deg,rgba(255,159,26,0.08),transparent_280px),#050505] px-4 py-8 text-[#f7fbff] md:px-8 md:py-12">
            <div className="w-full">
                <div className="mb-6 flex flex-col justify-between gap-4 md:flex-row md:items-end">
                    <div>
                        <Link to={`/movie/${movie.id}`} className="mb-3 inline-flex font-extrabold text-[#ffb347] transition hover:text-[#ffd69a]">Thông tin phim</Link>
                        <h1 className="mb-3 text-[clamp(2rem,5vw,3.4rem)] font-black leading-none text-[#f7fbff]">{movie.title}</h1>
                        <p className="text-[#d4ccbb]">
                            {selectedServer
                                ? `${selectedServer.server_name} - ${currentEpisodeName || 'Đang cập nhật'}`
                                : 'Chưa có server phát cho phim này.'}
                        </p>
                    </div>

                    {movie.trailerUrl && (
                        <button
                            type="button"
                            className={ui.button}
                            onClick={() => setIsTrailerOpen(true)}
                        >
                            Trailer
                        </button>
                    )}
                </div>

                <section>
                    <div className={ui.panel}>
                        {hlsSource ? (
                            <HlsVideoPlayer
                                poster={movie.backdrop || movie.poster}
                                src={hlsSource}
                                title={`${movie.title} - ${currentEpisodeName}`}
                                initialTime={initialPlaybackTime}
                                onProgress={saveCurrentProgress}
                            />
                        ) : embedSource ? (
                            <EmbedVideoPlayer
                                poster={movie.backdrop || movie.poster}
                                src={embedSource}
                                title={`${movie.title} - ${currentEpisodeName}`}
                            />
                        ) : (
                            <div className="grid aspect-video place-items-center p-8 text-center">
                                <div>
                                <h2 className="mb-2 text-2xl font-black text-[#f7fbff]">{hasPlayableEpisode ? 'Nguồn phát M3U8' : 'Chưa có link phát'}</h2>
                                <p className="max-w-xl text-[#d4ccbb]">
                                    {hasPlayableEpisode
                                        ? 'Tập này có link M3U8, có thể tích hợp HLS player ở bước tiếp theo.'
                                        : 'API hiện chưa trả về link embed cho tập này. Hãy thử trailer hoặc chọn tập khác nếu có.'}
                                </p>
                                </div>
                            </div>
                        )}
                    </div>
                </section>

                <section className={cn(ui.panel, 'mt-6 grid gap-6 p-4 md:p-6')}>
                    <div>
                        <div className="mb-4 flex items-center gap-4">
                            <img src={movie.poster} alt={movie.title} className="h-28 w-20 rounded-lg object-cover" />
                            <div>
                                <h2 className="mb-1 text-xl font-black text-[#f7fbff]">{movie.title}</h2>
                                <p className="text-sm text-[#d4ccbb]">{movie.genre.slice(0, 3).join(', ')}</p>
                            </div>
                        </div>
                        <div className="flex flex-wrap gap-3">
                            {metaItems.map((item, index) => (
                                <span key={item} className={cn('rounded-lg border border-white/10 bg-white/10 px-3 py-2 text-sm font-bold text-[#d4ccbb]', index === 0 && 'border-transparent bg-[linear-gradient(135deg,#ff9f1a,#ffb347)] text-[#050505]')}>{item}</span>
                            ))}
                        </div>
                    </div>

                    {availableServers.length > 0 && (
                        <div className="grid gap-6">
                            <div>
                                <h3 className="mb-3 text-lg font-black text-[#f7fbff]">Server</h3>
                                <div className="flex flex-wrap gap-2">
                                    {availableServers.map((server, index) => (
                                        <button
                                            key={`${server.server_name}-${index}`}
                                            type="button"
                                            className={cn(chipClass, index === selectedServerIndex && 'border-[#ffe4c7] text-[#ffd69a] shadow-[inset_0_0_18px_rgba(255,159,26,0.18)]')}
                                            onClick={() => {
                                                setSelectedServerIndex(index)
                                                setSelectedEpisodeIndex(0)
                                            }}
                                        >
                                            {server.server_name}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <h3 className="mb-3 text-lg font-black text-[#f7fbff]">Danh sách tập</h3>
                                <div className="flex flex-wrap gap-2">
                                    {selectedEpisodes.map((episode, index) => {
                                        const episodeLabel = episode.name || episode.filename || `Tập ${index + 1}`

                                        return (
                                            <button
                                                key={`${episode.slug || episodeLabel}-${index}`}
                                                type="button"
                                                className={cn(chipClass, 'min-w-[74px]', index === selectedEpisodeIndex && 'border-[#ffe4c7] text-[#ffd69a] shadow-[inset_0_0_18px_rgba(255,159,26,0.18)]')}
                                                onClick={() => setSelectedEpisodeIndex(index)}
                                            >
                                                {episodeLabel}
                                            </button>
                                        )
                                    })}
                                </div>
                            </div>
                        </div>
                    )}
                </section>
            </div>
            <TrailerModal
                isOpen={isTrailerOpen}
                onClose={() => setIsTrailerOpen(false)}
                title={movie.title}
                url={movie.trailerUrl}
            />
        </div>
    )
}

export default Watch
