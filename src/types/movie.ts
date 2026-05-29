import type { TmdbReference } from './tmdb'

export type AppMovie = {
    id: string
    title: string
    year: number | null
    rating: number | null
    duration: string | null
    quality: string | null
    status: string | null
    country: string
    region: string
    lists: string[]
    genre: string[]
    director: string
    cast: string[]
    poster: string
    backdrop: string
    description: string
    trailerUrl?: string
    tmdb?: TmdbReference
    featured: boolean
    trending: boolean
}
