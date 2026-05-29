import { useEffect } from 'react'
import { ui } from '../utils/styles'

function getYouTubeEmbedUrl(url) {
    try {
        const parsedUrl = new URL(url)
        const host = parsedUrl.hostname.replace('www.', '')

        if (host === 'youtu.be') {
            return `https://www.youtube.com/embed/${parsedUrl.pathname.slice(1)}?autoplay=1&rel=0`
        }

        if (host === 'youtube.com' || host === 'm.youtube.com') {
            const videoId = parsedUrl.searchParams.get('v')

            if (videoId) {
                return `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0`
            }

            if (parsedUrl.pathname.startsWith('/embed/')) {
                return `${url}${url.includes('?') ? '&' : '?'}autoplay=1&rel=0`
            }
        }
    } catch {
        return url
    }

    return url
}

function TrailerModal({ isOpen, onClose, title, url }) {
    useEffect(() => {
        if (!isOpen) {
            return undefined
        }

        const handleKeyDown = (event) => {
            if (event.key === 'Escape') {
                onClose()
            }
        }

        const originalOverflow = document.body.style.overflow
        document.body.style.overflow = 'hidden'
        document.addEventListener('keydown', handleKeyDown)

        return () => {
            document.body.style.overflow = originalOverflow
            document.removeEventListener('keydown', handleKeyDown)
        }
    }, [isOpen, onClose])

    if (!isOpen || !url) {
        return null
    }

    const embedUrl = getYouTubeEmbedUrl(url)

    return (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-3 md:p-5" role="dialog" aria-modal="true" aria-label={`Trailer ${title}`}>
            <button type="button" className="absolute inset-0 cursor-pointer border-0 bg-[radial-gradient(circle_at_center,rgba(255,159,26,0.16),transparent_32rem),rgba(0,0,0,0.78)]" onClick={onClose} aria-label="Đóng trailer" />
            <div className="relative w-full max-w-[980px] overflow-hidden rounded-lg border border-white/15 bg-[linear-gradient(145deg,rgba(247,251,255,0.1),rgba(255,159,26,0.06)),rgba(5,5,5,0.96)] shadow-[0_30px_90px_rgba(0,0,0,0.6)]">
                <div className="flex items-center justify-between gap-4 p-4">
                    <div className="min-w-0">
                        <span className="mb-1 block text-xs font-black uppercase text-[#ff9f1a]">Trailer</span>
                        <h2 className="m-0 truncate text-[clamp(1.05rem,2.4vw,1.45rem)] font-extrabold leading-tight text-[#f7fbff]">{title}</h2>
                    </div>
                    <button type="button" className={ui.iconButton} onClick={onClose} aria-label="Đóng trailer">
                        <span className="relative block h-0.5 w-4 rotate-45 rounded-full bg-[#f7fbff] after:absolute after:left-0 after:top-0 after:h-0.5 after:w-4 after:rotate-90 after:rounded-full after:bg-[#f7fbff] after:content-['']" />
                    </button>
                </div>
                <div className="aspect-video w-full border-y border-white/10 bg-[#02050b]">
                    <iframe
                        src={embedUrl}
                        title={`Trailer ${title}`}
                        className="h-full w-full border-0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                    />
                </div>
                <div className="flex justify-end p-4">
                    <a href={url} target="_blank" rel="noreferrer" className={ui.button}>
                        Mở trên YouTube
                    </a>
                </div>
            </div>
        </div>
    )
}

export default TrailerModal
