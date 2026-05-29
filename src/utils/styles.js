export function cn(...classes) {
    return classes.filter(Boolean).join(' ')
}

export const ui = {
    page: 'min-h-[calc(100vh-200px)] bg-[linear-gradient(180deg,rgba(255,159,26,0.08),transparent_280px),#050505] px-4 py-8 text-[#f7fbff] md:px-8 md:py-12',
    shell: 'w-full',
    eyebrow: 'mb-3 inline-block text-xs font-extrabold uppercase tracking-[0.12em] text-[#ffe4c7]',
    title: 'mb-3 text-[clamp(2rem,5vw,3.4rem)] font-black leading-none text-[#f7fbff]',
    muted: 'text-[#d4ccbb]',
    panel: 'rounded-lg border border-[rgba(255,179,71,0.2)] bg-[linear-gradient(145deg,rgba(247,251,255,0.1),rgba(255,159,26,0.06)),rgba(7,11,18,0.74)]',
    button: 'inline-flex min-h-11 items-center justify-center overflow-hidden rounded-lg border border-[rgba(255,179,71,0.65)] bg-[rgba(7,11,18,0.94)] px-4 font-extrabold text-[#f7fbff] shadow-[inset_0_0_0_1px_rgba(255,179,71,0.25),0_12px_32px_rgba(255,159,26,0.12)] transition hover:-translate-y-0.5 hover:border-[#ffe4c7] hover:text-[#ffd69a] hover:shadow-[inset_0_0_18px_rgba(255,159,26,0.24),0_18px_40px_rgba(255,159,26,0.22)]',
    iconButton: 'inline-flex size-10 items-center justify-center rounded-full border border-[rgba(247,251,255,0.16)] bg-[rgba(247,251,255,0.08)] text-[#f7fbff] transition hover:border-[#ff9f1a] hover:text-[#ffd69a]',
    select: 'min-h-11 w-full rounded-lg border border-[rgba(247,251,255,0.2)] bg-[linear-gradient(135deg,rgba(255,159,26,0.22),rgba(247,251,255,0.09)),rgba(247,251,255,0.08)] px-3 font-bold text-[#f7fbff] outline-none focus:border-[#ff9f1a] focus:ring-4 focus:ring-[rgba(255,159,26,0.18)]',
    grid: 'grid grid-cols-2 gap-3 sm:grid-cols-[repeat(auto-fill,minmax(140px,1fr))] md:gap-5 lg:grid-cols-[repeat(auto-fill,minmax(176px,1fr))]',
    empty: 'rounded-lg border border-dashed border-[rgba(255,179,71,0.2)] bg-[linear-gradient(145deg,rgba(247,251,255,0.12),rgba(255,159,26,0.07)),rgba(255,228,197,0.08)] px-4 py-10 text-center text-lg text-[#d4ccbb]',
    loading: 'flex min-h-[400px] items-center justify-center gap-3 text-xl font-extrabold text-[#ffb347]',
}
