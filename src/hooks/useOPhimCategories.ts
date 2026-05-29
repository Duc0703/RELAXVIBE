import { useEffect, useState } from 'react'
import { fallbackCategoryOptions, type OPhimFilterOption } from '../constants/ophimFilters'
import { getOPhimCategories } from '../services/ophimApi'

type OPhimCategoriesState = {
    categories: OPhimFilterOption[]
    loading: boolean
    error: string | null
}

let cachedCategoriesState: OPhimCategoriesState | null = null

export function useOPhimCategories(): OPhimCategoriesState {
    const [state, setState] = useState<OPhimCategoriesState>(cachedCategoriesState || {
        categories: fallbackCategoryOptions,
        loading: true,
        error: null,
    })

    useEffect(() => {
        if (cachedCategoriesState) {
            return undefined
        }

        const controller = new AbortController()

        async function loadCategories() {
            try {
                const response = await getOPhimCategories(controller.signal)
                const categories = response.data.items.map((item) => ({
                    label: item.name,
                    value: item.slug,
                }))

                const nextState = {
                    categories: categories.length > 0 ? categories : fallbackCategoryOptions,
                    loading: false,
                    error: null,
                }

                cachedCategoriesState = nextState
                setState(nextState)
            } catch (error) {
                if (error instanceof DOMException && error.name === 'AbortError') {
                    return
                }

                setState({
                    categories: fallbackCategoryOptions,
                    loading: false,
                    error: error instanceof Error ? error.message : 'Không thể tải thể loại phim.',
                })
            }
        }

        loadCategories()

        return () => controller.abort()
    }, [])

    return state
}
