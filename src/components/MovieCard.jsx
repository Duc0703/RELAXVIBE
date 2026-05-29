import { Link } from 'react-router-dom'
import { getMovieMetaItems } from '../utils/movieDisplay'

function MovieCard({ movie, imageLoading = 'lazy', imageFetchPriority = 'auto' }) {
    const metaItems = getMovieMetaItems(movie)

    return (
        <Link
            to={`/movie/${movie.id}`}
            className="group block h-full overflow-hidden rounded-lg border border-[rgba(255,179,71,0.2)] bg-[linear-gradient(180deg,rgba(247,251,255,0.11),rgba(247,251,255,0.055)),rgba(255,228,197,0.08)] transition hover:-translate-y-1.5 hover:shadow-[0_24px_52px_rgba(0,0,0,0.46),0_0_22px_rgba(255,179,71,0.2),0_0_0_1px_rgba(255,179,71,0.42)]"
        >
            <div className="relative aspect-[2/3] w-full overflow-hidden bg-[linear-gradient(145deg,rgba(247,251,255,0.12),rgba(255,159,26,0.14)),#07101f]">
                <div className="absolute inset-0 grid place-items-center text-xs font-black uppercase tracking-[0.08em] text-white/20">
                    Relax Vibe
                </div>
                <img
                    src={movie.poster}
                    alt={movie.title}
                    className="relative z-[1] h-full w-full object-cover transition duration-300 group-hover:scale-105"
                    loading={imageLoading}
                    fetchpriority={imageFetchPriority}
                    decoding="async"
                />
                <div className="absolute inset-0 z-[2] grid place-items-center bg-black/70 opacity-0 transition group-hover:opacity-100">
                    <span className="inline-flex min-h-10 items-center rounded-lg border border-[rgba(255,179,71,0.65)] bg-[#070b12]/95 px-4 text-sm font-extrabold text-[#f7fbff] shadow-[0_12px_28px_rgba(0,0,0,0.28)]">
                        Xem ngay
                    </span>
                </div>
                {movie.quality && (
                    <div className="absolute left-1 top-1 z-[3] rounded-md border border-[rgba(255,179,71,0.2)] bg-orange-500 px-2 py-1 text-[0.7rem] font-extrabold text-white">
                        {movie.quality}
                    </div>
                )}
                {movie.status && (
                    <div className="absolute right-1 top-1 z-[3] max-w-[calc(100%-64px)] truncate rounded-md border border-[rgba(255,179,71,0.2)] bg-black/80 px-2 py-1 text-[0.7rem] font-extrabold leading-tight text-[#f7fbff]">
                        {movie.status}
                    </div>
                )}
            </div>
            <div className="p-3 md:p-4">
                <h3 className="mb-1 truncate text-sm font-extrabold text-[#f7fbff] md:text-base">{movie.title}</h3>
                <p className="truncate text-sm text-[#eaf3ff]/85">{metaItems.join(' • ')}</p>
            </div>
        </Link>
    )
}

export default MovieCard
