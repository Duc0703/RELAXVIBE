import type { AppMovie } from '../types/movie'
import type { OPhimHomeResponse, OPhimListResponse, OPhimMovieDetailResponse, OPhimMovieItem } from '../types/ophim'
import type { TmdbReference } from '../types/tmdb'

function buildImageUrl(cdnDomain: string, path?: string) {
    if (!path) {
        return 'https://placehold.co/500x750/07101f/eaf3ff?text=Relax+Vibe'
    }

    if (path.startsWith('http')) {
        return path
    }

    return `${cdnDomain.replace(/\/$/, '')}/uploads/movies/${path.replace(/^\//, '')}`
}

function getCountryName(item: OPhimMovieItem) {
    return item.country?.[0]?.name || 'Đang cập nhật'
}

function getRegion(item: OPhimMovieItem) {
    const country = getCountryName(item)

    if (country === 'Hàn Quốc') {
        return 'Hàn Quốc'
    }

    if (country === 'Trung Quốc') {
        return 'Trung Quốc'
    }

    if (['Âu Mỹ', 'Mỹ', 'Anh', 'Pháp', 'Đức', 'Úc'].includes(country)) {
        return 'Âu Mỹ'
    }

    return country
}

function getRating(item: OPhimMovieItem) {
    const rating = item.tmdb?.vote_average || item.imdb?.vote_average || 0

    return rating > 0 ? rating : null
}

function getDuration(item: OPhimMovieItem) {
    const normalizedTime = item.time?.trim()

    if (normalizedTime && !normalizedTime.startsWith('?')) {
        return normalizedTime
    }

    return item.episode_current || item.lang || null
}

function stripHtml(value?: string) {
    if (!value) {
        return ''
    }

    return value
        .replace(/<[^>]*>/g, ' ')
        .replace(/&nbsp;/g, ' ')
        .replace(/\s+/g, ' ')
        .trim()
}

function getTmdbReference(item: OPhimMovieItem): TmdbReference | undefined {
    if (!item.tmdb?.id || !item.tmdb.type) {
        return undefined
    }

    if (item.tmdb.type !== 'movie' && item.tmdb.type !== 'tv') {
        return undefined
    }

    return {
        id: item.tmdb.id,
        type: item.tmdb.type,
    }
}

export function mapOPhimItemToAppMovie(
    item: OPhimMovieItem,
    cdnDomain: string,
    index: number,
): AppMovie {
    const poster = buildImageUrl(cdnDomain, item.poster_url || item.thumb_url)
    const backdrop = buildImageUrl(cdnDomain, item.thumb_url || item.poster_url)
    const country = getCountryName(item)
    const region = getRegion(item)
    const genres = item.category?.map((category) => category.name) || ['Đang cập nhật']
    const isNew = item.year ? item.year >= new Date().getFullYear() - 1 : true

    const lists = ['Phim mới', ...(index < 8 ? ['Xu hướng'] : []), item.type === 'hoathinh' ? 'Hoạt hình' : '']
        .filter(Boolean)

    return {
        id: item.slug,
        title: item.name,
        year: item.year || null,
        rating: getRating(item),
        duration: getDuration(item),
        quality: item.quality || item.lang || null,
        status: item.episode_current || (item.trailer_url ? 'Trailer' : null),
        country,
        region,
        lists,
        genre: genres,
        director: item.director?.filter(Boolean).join(', ') || 'Đang cập nhật',
        cast: item.actor?.filter(Boolean) || [],
        poster,
        backdrop,
        description: stripHtml(item.content) || (item.origin_name
            ? `${item.name} (${item.origin_name}) hiện có ${item.episode_current || 'tập mới'}.`
            : `${item.name} hiện có ${item.episode_current || 'tập mới'}.`),
        trailerUrl: item.trailer_url,
        tmdb: getTmdbReference(item),
        featured: index === 0,
        trending: index < 8 || isNew,
    }
}

export function mapOPhimHomeToAppMovies(response: OPhimHomeResponse): AppMovie[] {
    const cdnDomain = response.data.APP_DOMAIN_CDN_IMAGE

    return response.data.items.map((item, index) => mapOPhimItemToAppMovie(item, cdnDomain, index))
}

export function mapOPhimListToAppMovies(response: OPhimListResponse): AppMovie[] {
    const cdnDomain = response.data.APP_DOMAIN_CDN_IMAGE

    return response.data.items.map((item, index) => mapOPhimItemToAppMovie(item, cdnDomain, index))
}

export function mapOPhimDetailToAppMovie(response: OPhimMovieDetailResponse): AppMovie {
    return mapOPhimItemToAppMovie(response.data.item, response.data.APP_DOMAIN_CDN_IMAGE, 0)
}
