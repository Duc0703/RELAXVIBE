import { useRef } from 'react'
import { cn } from '../utils/styles'

function Arrow({ direction }) {
    return (
        <span
            aria-hidden="true"
            className={cn(
                'block size-2.5 rotate-45 border-[#f7fbff]',
                direction === 'prev' ? 'border-b-2 border-l-2' : 'border-r-2 border-t-2',
            )}
        />
    )
}

function MovieRail({ children, className = '' }) {
    const railRef = useRef(null)

    const scrollRail = (direction) => {
        const rail = railRef.current

        if (!rail) {
            return
        }

        const distance = Math.max(rail.clientWidth * 0.82, 280)

        rail.scrollBy({
            left: direction * distance,
            behavior: 'smooth',
        })
    }

    return (
        <div className={cn('group/rail relative min-w-0', className)}>
            <button
                type="button"
                className="absolute left-1 top-[calc(50%-0.35rem)] z-[6] hidden size-10 -translate-y-1/2 items-center justify-center rounded-full border border-[rgba(255,179,71,0.55)] bg-[#070b12]/95 opacity-0 shadow-[0_14px_30px_rgba(0,0,0,0.34)] transition group-hover/rail:opacity-100 group-focus-within/rail:opacity-100 md:flex"
                aria-label="Cuộn sang trái"
                onClick={() => scrollRail(-1)}
            >
                <Arrow direction="prev" />
            </button>
            <div
                className="grid auto-cols-[140px] grid-flow-col gap-4 overflow-x-auto overscroll-x-contain scroll-smooth py-1 pb-4 [scrollbar-width:none] md:auto-cols-[176px] [&::-webkit-scrollbar]:hidden"
                ref={railRef}
            >
                {children}
            </div>
            <button
                type="button"
                className="absolute right-1 top-[calc(50%-0.35rem)] z-[6] hidden size-10 -translate-y-1/2 items-center justify-center rounded-full border border-[rgba(255,179,71,0.55)] bg-[#070b12]/95 opacity-0 shadow-[0_14px_30px_rgba(0,0,0,0.34)] transition group-hover/rail:opacity-100 group-focus-within/rail:opacity-100 md:flex"
                aria-label="Cuộn sang phải"
                onClick={() => scrollRail(1)}
            >
                <Arrow direction="next" />
            </button>
        </div>
    )
}

export default MovieRail
