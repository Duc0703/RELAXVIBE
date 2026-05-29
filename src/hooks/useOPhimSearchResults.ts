import { useEffect, useMemo, useState } from 'react'
import { getOPhimCategory, getOPhimCountry, getOPhimList, searchOPhim } from '../services/ophimApi'
import type { AppMovie } from '../types/movie'
import type { OPhimListSlug } from '../types/ophim'
import { mapOPhimListToAppMovies } from '../utils/ophimMapper'

type OPhimSearchParams = {
    keyword: string
    category: string
    country: string
    listSlug: OPhimListSlug
    page?: number
    limit?: number
}

type OPhimSearchState = {
    movies: AppMovie[]
    pagination: {
        currentPage: number
        totalPages: number
        totalItems: number
        itemsPerPage: number
    }
    loading: boolean
    error: string | null
}

export function useOPhimSearchResults(params: OPhimSearchParams): OPhimSearchState {
    const stableParams = useMemo(
        () => ({
            keyword: params.keyword.trim(),
            category: params.category,
            country: params.country,
            listSlug: params.listSlug,
            page: params.page || 1,
            limit: params.limit || 20,
        }),
        [params.category, params.country, params.keyword, params.limit, params.listSlug, params.page],
    )

    const [state, setState] = useState<OPhimSearchState>({
        movies: [],
        pagination: {
            currentPage: stableParams.page,
            totalPages: 1,
            totalItems: 0,
            itemsPerPage: stableParams.limit,
        },
        loading: true,
        error: null,
    })

    useEffect(() => {
        const controller = new AbortController()

        async function loadResults() {
            try {
                setState((currentState) => ({
                    ...currentState,
                    loading: true,
                    error: null,
                }))

                const query = {
                    page: stableParams.page,
                    limit: stableParams.limit,
                    category: stableParams.category === 'All' ? undefined : stableParams.category,
                    country: stableParams.country === 'All' ? undefined : stableParams.country,
                }

                const response = stableParams.keyword
                    ? await searchOPhim(stableParams.keyword, query, controller.signal)
                    : stableParams.category !== 'All' && stableParams.listSlug === 'phim-moi'
                        ? await getOPhimCategory(stableParams.category, query, controller.signal)
                        : stableParams.country !== 'All' && stableParams.listSlug === 'phim-moi'
                            ? await getOPhimCountry(stableParams.country, query, controller.signal)
                            : await getOPhimList(stableParams.listSlug, query, controller.signal)

                const responsePagination = response.data.params?.pagination
                const totalItems = responsePagination?.totalItems || response.data.items.length
                const itemsPerPage = responsePagination?.totalItemsPerPage || stableParams.limit
                const currentPage = responsePagination?.currentPage || stableParams.page

                setState({
                    movies: mapOPhimListToAppMovies(response),
                    pagination: {
                        currentPage,
                        totalPages: Math.max(1, Math.ceil(totalItems / itemsPerPage)),
                        totalItems,
                        itemsPerPage,
                    },
                    loading: false,
                    error: null,
                })
            } catch (error) {
                if (error instanceof DOMException && error.name === 'AbortError') {
                    return
                }

                setState({
                    movies: [],
                    pagination: {
                        currentPage: stableParams.page,
                        totalPages: 1,
                        totalItems: 0,
                        itemsPerPage: stableParams.limit,
                    },
                    loading: false,
                    error: error instanceof Error ? error.message : 'Không thể tải kết quả tìm kiếm.',
                })
            }
        }

        loadResults()

        return () => controller.abort()
    }, [stableParams])

    return state
}
