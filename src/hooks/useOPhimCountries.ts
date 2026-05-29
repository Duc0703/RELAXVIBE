import { useEffect, useState } from 'react'
import { fallbackCountryOptions, type OPhimFilterOption } from '../constants/ophimFilters'
import { getOPhimCountries } from '../services/ophimApi'

type OPhimCountriesState = {
    countries: OPhimFilterOption[]
    loading: boolean
    error: string | null
}

let cachedCountriesState: OPhimCountriesState | null = null

export function useOPhimCountries(enabled = true): OPhimCountriesState {
    const [state, setState] = useState<OPhimCountriesState>(cachedCountriesState || {
        countries: fallbackCountryOptions,
        loading: true,
        error: null,
    })

    useEffect(() => {
        if (cachedCountriesState) {
            return undefined
        }

        if (!enabled) {
            return undefined
        }

        const controller = new AbortController()

        async function loadCountries() {
            try {
                const response = await getOPhimCountries(controller.signal)
                const countries = response.data.items.map((item) => ({
                    label: item.name,
                    value: item.slug,
                }))

                const nextState = {
                    countries: countries.length > 0 ? countries : fallbackCountryOptions,
                    loading: false,
                    error: null,
                }

                cachedCountriesState = nextState
                setState(nextState)
            } catch (error) {
                if (error instanceof DOMException && error.name === 'AbortError') {
                    return
                }

                setState({
                    countries: fallbackCountryOptions,
                    loading: false,
                    error: error instanceof Error ? error.message : 'Không thể tải quốc gia phim.',
                })
            }
        }

        loadCountries()

        return () => controller.abort()
    }, [enabled])

    return state
}
