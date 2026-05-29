export type OPhimTaxonomy = {
    id: string
    name: string
    slug: string
}

export type OPhimListSlug =
    | 'phim-moi'
    | 'phim-bo'
    | 'phim-le'
    | 'tv-shows'
    | 'hoat-hinh'
    | 'phim-vietsub'
    | 'phim-thuyet-minh'
    | 'phim-long-tien'
    | 'phim-bo-dang-chieu'
    | 'phim-bo-hoan-thanh'
    | 'phim-sap-chieu'
    | 'subteam'
    | 'phim-chieu-rap'

export type OPhimVoteInfo = {
    id?: string
    type?: string
    season?: number | null
    vote_average?: number
    vote_count?: number
}

export type OPhimMovieItem = {
    _id: string
    name: string
    slug: string
    origin_name?: string
    type: string
    thumb_url: string
    poster_url?: string
    content?: string
    time?: string
    episode_current?: string
    quality?: string
    lang?: string
    year?: number
    modified?: {
        time?: string
    }
    tmdb?: OPhimVoteInfo
    imdb?: OPhimVoteInfo
    category?: OPhimTaxonomy[]
    country?: OPhimTaxonomy[]
    actor?: string[]
    director?: string[]
    trailer_url?: string
    episodes?: OPhimEpisodeServer[]
}

export type OPhimEpisode = {
    name: string
    slug: string
    filename?: string
    link_embed?: string
    link_m3u8?: string
}

export type OPhimEpisodeServer = {
    server_name: string
    is_ai?: boolean
    server_data: OPhimEpisode[]
}

export type OPhimPeople = {
    tmdb_people_id: number
    name: string
    character?: string
    known_for_department?: string
    profile_path?: string | null
}

export type OPhimHomeResponse = {
    status: 'success' | 'error'
    message: string
    data: {
        items: OPhimMovieItem[]
        APP_DOMAIN_CDN_IMAGE: string
        type_list?: string
        params?: {
            pagination?: {
                totalItems?: number
                totalItemsPerPage?: number
                currentPage?: number
            }
        }
    }
}

export type OPhimTaxonomyResponse = {
    status: 'success' | 'error'
    message: string
    data: {
        items: OPhimTaxonomy[]
    }
}

export type OPhimListResponse = OPhimHomeResponse & {
    data: OPhimHomeResponse['data'] & {
        type_list: OPhimListSlug | string
    }
}

export type OPhimListQuery = {
    page?: number
    limit?: number
    category?: string
    country?: string
}

export type OPhimMovieDetailResponse = {
    status: 'success' | 'error'
    message: string
    data: {
        item: OPhimMovieItem
        APP_DOMAIN_CDN_IMAGE: string
    }
}

export type OPhimPeoplesResponse = {
    success: boolean
    message: string
    status_code: number
    data: {
        profile_sizes?: {
            w185?: string
            h632?: string
            original?: string
            w45?: string
        }
        peoples: OPhimPeople[]
    }
}
