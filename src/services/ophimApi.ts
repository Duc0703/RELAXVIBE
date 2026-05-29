import type {
    OPhimHomeResponse,
    OPhimListQuery,
    OPhimListResponse,
    OPhimListSlug,
    OPhimMovieDetailResponse,
    OPhimPeoplesResponse,
    OPhimTaxonomyResponse,
} from '../types/ophim'
import type { AppCastMember } from '../types/tmdb'

const OPHIM_API_BASE_URL = import.meta.env.VITE_OPHIM_API_BASE_URL
    || (import.meta.env.PROD ? '/api/ophim' : 'https://ophim1.com/v1/api')

async function requestJson<TResponse>(path: string, signal?: AbortSignal): Promise<TResponse> {
    const response = await fetch(`${OPHIM_API_BASE_URL}${path}`, { signal })

    if (!response.ok) {
        throw new Error(`OPhim API error: ${response.status}`)
    }

    return response.json() as Promise<TResponse>
}

export function getOPhimHome(signal?: AbortSignal) {
    return requestJson<OPhimHomeResponse>('/home', signal)
}

export function getOPhimCategories(signal?: AbortSignal) {
    return requestJson<OPhimTaxonomyResponse>('/the-loai', signal)
}

export function getOPhimCountries(signal?: AbortSignal) {
    return requestJson<OPhimTaxonomyResponse>('/quoc-gia', signal)
}

function buildListParams(query: OPhimListQuery = {}) {
    const params = new URLSearchParams({
        page: String(query.page || 1),
    })

    if (query.limit) {
        params.set('limit', String(query.limit))
    }

    if (query.category) {
        params.set('category', query.category)
    }

    if (query.country) {
        params.set('country', query.country)
    }

    return params
}

export function getOPhimList(slug: OPhimListSlug, pageOrQuery: number | OPhimListQuery = 1, signal?: AbortSignal) {
    const query = typeof pageOrQuery === 'number' ? { page: pageOrQuery } : pageOrQuery
    const params = buildListParams(query)

    return requestJson<OPhimListResponse>(`/danh-sach/${slug}?${params.toString()}`, signal)
}

export function getOPhimCategory(categorySlug: string, query: OPhimListQuery = {}, signal?: AbortSignal) {
    const params = buildListParams(query)

    return requestJson<OPhimListResponse>(`/the-loai/${categorySlug}?${params.toString()}`, signal)
}

export function getOPhimCountry(countrySlug: string, query: OPhimListQuery = {}, signal?: AbortSignal) {
    const params = buildListParams(query)

    return requestJson<OPhimListResponse>(`/quoc-gia/${countrySlug}?${params.toString()}`, signal)
}

export function searchOPhim(keyword: string, query: OPhimListQuery = {}, signal?: AbortSignal) {
    const params = buildListParams(query)
    params.set('keyword', keyword)

    return requestJson<OPhimListResponse>(`/tim-kiem?${params.toString()}`, signal)
}

export function getOPhimMovieDetail(slug: string, signal?: AbortSignal) {
    return requestJson<OPhimMovieDetailResponse>(`/phim/${slug}`, signal)
}

export async function getOPhimPeoples(slug: string, signal?: AbortSignal): Promise<AppCastMember[]> {
    const response = await requestJson<OPhimPeoplesResponse>(`/phim/${slug}/peoples`, signal)
    const imageBaseUrl = response.data.profile_sizes?.w185 || response.data.profile_sizes?.h632 || ''
    const peoples = response.data.peoples || []
    const actors = peoples.filter((person) => (
        person.known_for_department === 'Acting' || Boolean(person.character?.trim())
    ))
    const displayPeoples = actors.length > 0 ? actors : peoples

    return displayPeoples.slice(0, 12).map((person) => ({
        id: String(person.tmdb_people_id),
        name: person.name,
        character: person.character || undefined,
        imageUrl: person.profile_path && imageBaseUrl
            ? `${imageBaseUrl}${person.profile_path}`
            : undefined,
    }))
}
