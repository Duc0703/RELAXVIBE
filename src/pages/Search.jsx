import { useSearchParams } from 'react-router-dom'
import MovieCard from '../components/MovieCard'
import { listOptions } from '../constants/ophimFilters'
import { useOPhimCategories } from '../hooks/useOPhimCategories'
import { useOPhimCountries } from '../hooks/useOPhimCountries'
import { useOPhimSearchResults } from '../hooks/useOPhimSearchResults'
import { cn, ui } from '../utils/styles'

const MOVIES_PER_PAGE = 20
const MAX_VISIBLE_PAGES = 5

function formatNumber(value) {
    return new Intl.NumberFormat('vi-VN').format(value)
}

function getVisiblePages(currentPage, totalPages) {
    const pages = []
    const halfWindow = Math.floor(MAX_VISIBLE_PAGES / 2)
    let startPage = Math.max(1, currentPage - halfWindow)
    let endPage = Math.min(totalPages, startPage + MAX_VISIBLE_PAGES - 1)

    startPage = Math.max(1, endPage - MAX_VISIBLE_PAGES + 1)

    if (startPage > 1) {
        pages.push(1)

        if (startPage > 2) {
            pages.push('start-ellipsis')
        }
    }

    for (let page = startPage; page <= endPage; page += 1) {
        pages.push(page)
    }

    if (endPage < totalPages) {
        if (endPage < totalPages - 1) {
            pages.push('end-ellipsis')
        }

        pages.push(totalPages)
    }

    return pages
}

function Search() {
    const [searchParams] = useSearchParams()
    const query = searchParams.get('q')
    const selectedCategory = searchParams.get('category') || 'All'
    const selectedCountry = searchParams.get('country') || 'All'
    const selectedListSlug = searchParams.get('listSlug') || 'phim-moi'
    const selectedPage = Math.max(1, Number(searchParams.get('page')) || 1)
    const { categories } = useOPhimCategories()
    const { countries } = useOPhimCountries()
    const selectedCategoryLabel = categories.find((option) => option.value === selectedCategory)?.label
    const selectedCountryLabel = countries.find((option) => option.value === selectedCountry)?.label
    const selectedListLabel = listOptions.find((option) => option.value === selectedListSlug)?.label || 'Phim mới'
    const resultLabel = query
        ? <>Kết quả cho <strong>"{query}"</strong></>
        : selectedCategoryLabel
            ? <>Thể loại <strong>{selectedCategoryLabel}</strong></>
            : selectedCountryLabel
                ? <>Phim từ <strong>{selectedCountryLabel}</strong></>
                : <>Danh sách <strong>{selectedListLabel}</strong></>
    const { movies: results, pagination, loading, error } = useOPhimSearchResults({
        keyword: query || '',
        category: selectedCategory,
        country: selectedCountry,
        listSlug: selectedListSlug,
        page: selectedPage,
        limit: MOVIES_PER_PAGE,
    })
    const buildPageHref = (page) => {
        const nextParams = new URLSearchParams(searchParams)
        nextParams.set('page', String(page))

        return `/search?${nextParams.toString()}`
    }
    const startItem = results.length > 0 ? (pagination.currentPage - 1) * pagination.itemsPerPage + 1 : 0
    const endItem = results.length > 0 ? startItem + results.length - 1 : 0
    const visiblePages = getVisiblePages(pagination.currentPage, pagination.totalPages)

    return (
        <div className={ui.page}>
            <div className={cn(ui.shell, 'mb-10')}>
                <div className="min-w-0">
                    <span className={ui.eyebrow}>Thư viện Relax Vibe</span>
                    <h1 className={ui.title}>Tìm phim</h1>
                    <p className={cn(ui.muted, 'max-w-2xl text-base md:text-lg')}>{resultLabel}</p>
                </div>
            </div>

            <div className={ui.shell}>
                {loading ? (
                    <div className={ui.loading}>Đang tải phim...</div>
                ) : error ? (
                    <div className={ui.empty}>Không thể tải dữ liệu phim. Vui lòng thử lại.</div>
                ) : results.length === 0 ? (
                    <div className={ui.empty}>Không có phim nào phù hợp với bộ lọc hiện tại.</div>
                ) : (
                    <>
                        <div className={ui.grid}>
                            {results.map(movie => (
                                <MovieCard key={movie.id} movie={movie} />
                            ))}
                        </div>

                        <nav className="mt-8 flex flex-wrap items-center justify-center gap-3" aria-label="Phân trang phim">
                            <span className="basis-full text-center text-sm font-bold text-[#d4ccbb]">
                                {formatNumber(startItem)}-{formatNumber(endItem)} / {formatNumber(pagination.totalItems)} phim
                            </span>
                            <a
                                className={cn(ui.button, 'min-w-24', pagination.currentPage <= 1 && 'pointer-events-none opacity-50')}
                                href={pagination.currentPage <= 1 ? undefined : buildPageHref(pagination.currentPage - 1)}
                                aria-disabled={pagination.currentPage <= 1}
                            >
                                Trước
                            </a>
                            <div className="flex items-center gap-2" aria-label={`Trang ${pagination.currentPage} trong ${pagination.totalPages}`}>
                                {visiblePages.map((page) => (
                                    typeof page === 'number' ? (
                                        <a
                                            className={cn('inline-flex size-10 items-center justify-center rounded-lg border border-[rgba(255,179,71,0.45)] bg-[#070b12]/95 font-extrabold text-[#f7fbff] transition hover:text-[#ffd69a]', page === pagination.currentPage && 'border-[#ffe4c7] text-[#ffd69a]')}
                                            href={page === pagination.currentPage ? undefined : buildPageHref(page)}
                                            aria-current={page === pagination.currentPage ? 'page' : undefined}
                                            key={page}
                                        >
                                            {formatNumber(page)}
                                        </a>
                                    ) : (
                                        <span className="inline-flex min-w-6 justify-center font-bold text-[#d4ccbb]" aria-hidden="true" key={page}>...</span>
                                    )
                                ))}
                            </div>
                            <a
                                className={cn(ui.button, 'min-w-24', pagination.currentPage >= pagination.totalPages && 'pointer-events-none opacity-50')}
                                href={pagination.currentPage >= pagination.totalPages ? undefined : buildPageHref(pagination.currentPage + 1)}
                                aria-disabled={pagination.currentPage >= pagination.totalPages}
                            >
                                Sau
                            </a>
                        </nav>
                    </>
                )}
            </div>
        </div>
    )
}

export default Search
