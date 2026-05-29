import type { AppCastMember, TmdbCreditsResponse, TmdbReference } from '../types/tmdb'

const TMDB_API_BASE_URL = 'https://api.themoviedb.org/3'
const TMDB_IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/w185'

function getTmdbApiKey() {
    return import.meta.env.VITE_TMDB_API_KEY?.trim()
}

async function requestTmdb<TResponse>(path: string, signal?: AbortSignal): Promise<TResponse> {
    const apiKey = getTmdbApiKey()

    if (!apiKey) {
        return Promise.reject(new Error('TMDB API key is not configured.'))
    }

    const params = new URLSearchParams({
        api_key: apiKey,
        language: 'vi-VN',
    })

    const response = await fetch(`${TMDB_API_BASE_URL}${path}?${params.toString()}`, { signal })

    if (!response.ok) {
        throw new Error(`TMDB API error: ${response.status}`)
    }

    return response.json() as Promise<TResponse>
}

export function hasTmdbApiKey() {
    return Boolean(getTmdbApiKey())
}

export async function getTmdbCast(reference: TmdbReference, signal?: AbortSignal): Promise<AppCastMember[]> {
    const response = await requestTmdb<TmdbCreditsResponse>(
        `/${reference.type}/${reference.id}/credits`,
        signal,
    )

    return response.cast.slice(0, 12).map((actor) => ({
        id: String(actor.id),
        name: actor.name,
        character: actor.character,
        imageUrl: actor.profile_path ? `${TMDB_IMAGE_BASE_URL}${actor.profile_path}` : undefined,
    }))
}
