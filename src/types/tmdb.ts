export type TmdbMediaType = 'movie' | 'tv'

export type TmdbReference = {
    id: string
    type: TmdbMediaType
}

export type TmdbCastMember = {
    id: number
    name: string
    character?: string
    profile_path?: string | null
}

export type TmdbCreditsResponse = {
    cast: TmdbCastMember[]
}

export type AppCastMember = {
    id: string
    name: string
    character?: string
    imageUrl?: string
}
