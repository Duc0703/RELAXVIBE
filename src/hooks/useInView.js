import { useEffect, useRef, useState } from 'react'

export function useInView({ rootMargin = '420px 0px', threshold = 0, triggerOnce = true } = {}) {
    const elementRef = useRef(null)
    const [inView, setInView] = useState(false)

    useEffect(() => {
        const element = elementRef.current

        if (!element) {
            return undefined
        }

        if (!('IntersectionObserver' in window)) {
            setInView(true)
            return undefined
        }

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setInView(true)

                    if (triggerOnce) {
                        observer.disconnect()
                    }

                    return
                }

                if (!triggerOnce) {
                    setInView(false)
                }
            },
            { rootMargin, threshold },
        )

        observer.observe(element)

        return () => observer.disconnect()
    }, [rootMargin, threshold, triggerOnce])

    return [elementRef, inView]
}
