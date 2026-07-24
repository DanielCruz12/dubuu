"use client"

import type React from "react"

import { useState, useEffect, useCallback, useMemo } from "react"
import { type RootState, useAppDispatch, useAppSelector } from "@/redux/store"
import {
  setSearchTerm,
  setCountry,
  setCategories,
  setDurations,
  setPriceRange,
  setLocationEnabled,
  setRating,
  setProductType,
  resetSearch,
} from "@/redux/slices/product/search/search-slice"
import { useGetProductsQuery } from "@/redux/slices/product/product-slice"
import { useUser } from "@clerk/nextjs"
import type { IProduct } from "@/types/product"
import { DEFAULT_PRODUCT_TYPE_QUERY } from "@/constants/product-type"

// Define initial state for filters
const initialFilterState = {
  rating: "0",
  pricing: "1000",
  productType: DEFAULT_PRODUCT_TYPE_QUERY,
}

interface UseSearchLogicProps {
  products: IProduct[]
  onSearchResults?: (products: IProduct[]) => void
  onSearchLoading?: (loading: boolean) => void
}

export const useSearchLogic = ({ products, onSearchResults, onSearchLoading }: UseSearchLogicProps) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isDialogFilterOpen, setIsDialogFilterOpen] = useState(false)
  const [activeFiltersCount, setActiveFiltersCount] = useState(0)
  const [isLoadingLocation, setIsLoadingLocation] = useState(false)
  const [isMounted, setIsMounted] = useState(false)

  const { user } = useUser()
  const dispatch = useAppDispatch()

  const { searchTerm, country, priceRange, isLocationEnabled, rating, productType } = useAppSelector(
    (state: RootState) => state.search,
  )

  // Estados locales para aplicar los filtros al final
  const [tempRating, setTempRating] = useState(rating)
  const [tempProductType, setTempProductType] = useState(productType)
  const [tempPriceRange, setTempPriceRange] = useState(priceRange)

  // Sincronizar estados temporales cuando cambian los valores del Redux store
  useEffect(() => {
    setTempRating(rating)
    setTempProductType(productType)
    setTempPriceRange(priceRange)
  }, [rating, productType, priceRange])

  // Categoría y duración ya no se usan en filtros de búsqueda
  useEffect(() => {
    dispatch(setCategories([]))
    dispatch(setDurations([]))
  }, [dispatch])

  // Efecto para marcar como montado
  useEffect(() => {
    setIsMounted(true)
  }, [])

  // Construir parámetros de búsqueda
  const buildSearchParams = useCallback(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const params: Record<string, any> = {}

    if (!!user && searchTerm && searchTerm.length >= 3) {
      params.search = searchTerm
    }

    if (productType && productType !== "all") {
      params.product_type = productType
    }

    if (isLocationEnabled && country && country.code) {
      params.country = country.code
    }

    if (rating !== initialFilterState.rating && rating !== "0") {
      params.min_rating = Number.parseFloat(rating)
    }

    if (priceRange[0] > 0) {
      params.min_price = priceRange[0]
    }
    if (priceRange[1] < 1000) {
      params.max_price = priceRange[1]
    }

    params.limit = 20
    return params
  }, [searchTerm, productType, isLocationEnabled, country, rating, priceRange, user])

  // Query para búsqueda en API
  //
  // El cambio de productType (pills Tours/Rental) NO entra aquí a propósito:
  // HomeContent (src/app/home/page.tsx) ya reacciona a ese cambio reseteando
  // su propia paginación y volviendo a pedir la lista base con el nuevo tipo.
  // Si aquí también se activaba "modo búsqueda" solo por el tipo, cuando
  // productType volvía a coincidir con initialFilterState.productType (p. ej.
  // al seleccionar "Tours", que es el valor por defecto) shouldSearch pasaba
  // a false y se caía de nuevo en `products` (la lista base, que todavía
  // podía corresponder al tipo anterior mientras se resincronizaba), dejando
  // la pill marcada en "Tours" pero mostrando los resultados del tipo previo.
  const searchParams = buildSearchParams()
  const shouldSearch =
    (!!user && searchTerm.length >= 3) ||
    (isLocationEnabled && country && country.code) ||
    (rating !== initialFilterState.rating && rating !== "0") ||
    priceRange[0] > 0 ||
    priceRange[1] < 1000

  const {
    data: searchResults,
    isLoading: isSearching,
    isFetching: isSearchFetching,
  } = useGetProductsQuery(searchParams, {
    skip: !shouldSearch,
    refetchOnMountOrArgChange: false,
    refetchOnFocus: false,
    refetchOnReconnect: false,
  })

  // Notificar estado de carga al componente padre
  useEffect(() => {
    if (onSearchLoading) {
      onSearchLoading(isSearching || isSearchFetching)
    }
  }, [isSearching, isSearchFetching, onSearchLoading])

  // Función de geolocalización
  const requestLocation = async () => {
    if (!navigator.geolocation) return

    setIsLoadingLocation(true)

    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000,
        })
      })

      const { latitude, longitude } = position.coords

      try {
        const response = await fetch(
          `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=es`,
        )

        if (response.ok) {
          const data = await response.json()
          const countryCode = data.countryCode
          const countryName = data.countryName

          if (countryCode && countryName) {
            dispatch(setCountry({ code: countryCode, name: countryName }))
            dispatch(setLocationEnabled(true))
            localStorage.setItem("userCountry", countryCode)
            localStorage.setItem("userCountryName", countryName)
          }
        }
      } catch (error) {
        console.error("Error en geocodificación:", error)
      }
    } catch (error) {
      console.error("Error al obtener ubicación:", error)
    } finally {
      setIsLoadingLocation(false)
    }
  }

  // Cargar país guardado
  useEffect(() => {
    if (!isMounted) return

    const savedCountry = localStorage.getItem("userCountry")
    const savedCountryName = localStorage.getItem("userCountryName")

    if (savedCountry && (!country || !country.code)) {
      if (savedCountryName) {
        dispatch(setCountry({ code: savedCountry, name: savedCountryName }))
        dispatch(setLocationEnabled(true))
      } else {
        dispatch(setCountry({ code: savedCountry, name: savedCountry }))
        dispatch(setLocationEnabled(true))

        const fetchCountryName = async (countryCode: string) => {
          try {
            const response = await fetch(`https://restcountries.com/v3.1/alpha/${countryCode}`)
            if (response.ok) {
              const data = await response.json()
              const countryName = data[0]?.name?.common || countryCode
              dispatch(setCountry({ code: countryCode, name: countryName }))
              localStorage.setItem("userCountryName", countryName)
            }
          } catch (error) {
            console.error("Error al obtener nombre del país:", error)
          }
        }

        fetchCountryName(savedCountry)
      }
    }
  }, [country, dispatch, isMounted])

  // Calcular filtros activos
  useEffect(() => {
    let count = 0
    if (rating !== initialFilterState.rating && rating !== "0") count++
    if (productType !== initialFilterState.productType) count++
    if (priceRange[0] > 0 || priceRange[1] < 1000) count++
    if (isLocationEnabled && country && country.code) count++
    setActiveFiltersCount(count)
  }, [rating, productType, priceRange, isLocationEnabled, country])

  // Determinar qué productos mostrar
  const displayProducts = useMemo(() => {
    if (shouldSearch) {
      const apiResults = searchResults?.data
      return Array.isArray(apiResults) ? apiResults : []
    } else {
      return Array.isArray(products) ? products : []
    }
  }, [shouldSearch, searchResults?.data, products])

  // Pasar resultados al componente padre
  useEffect(() => {
    if (onSearchResults) {
      const validResults = Array.isArray(displayProducts) ? displayProducts : []
      onSearchResults(validResults)
    }
  }, [displayProducts, onSearchResults])

  // Filtrar productos para el diálogo de búsqueda
  const filteredForDialog = useMemo(() => {
    if (!user || searchTerm.length < 3) {
      return []
    }

    const validProducts = Array.isArray(displayProducts) ? displayProducts : []
    const searchLower = searchTerm.toLowerCase()

    return validProducts.filter((product) => {
      if (!product || typeof product !== "object") return false

      const name = product.name || ""
      const description = product.description || ""
      const country = product.country || ""

      return (
        name.toLowerCase().includes(searchLower) ||
        description.toLowerCase().includes(searchLower) ||
        country.toLowerCase().includes(searchLower)
      )
    })
  }, [user, searchTerm, displayProducts])

  const handleApplyFilters = () => {
    const safeProductType =
      tempProductType === "tours" || tempProductType === "rental"
        ? tempProductType
        : DEFAULT_PRODUCT_TYPE_QUERY
    const safeRating =
      ["0", "1", "2", "3", "4", "5"].includes(tempRating) ? tempRating : "0"

    dispatch(setRating(safeRating))
    dispatch(setProductType(safeProductType))
    dispatch(setCategories([]))
    dispatch(setDurations([]))
    dispatch(setPriceRange(tempPriceRange))
    setIsDialogFilterOpen(false)
  }

  const handleResetFilters = () => {
    dispatch(resetSearch())
    setTempRating(initialFilterState.rating)
    setTempProductType(initialFilterState.productType)
    setTempPriceRange([0, 1000])
    if (isMounted) {
      localStorage.removeItem("userCountry")
      localStorage.removeItem("userCountryName")
    }
    setIsDialogFilterOpen(false)
  }

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!!user) {
      dispatch(setSearchTerm(e.target.value))
    }
  }

  const handleSearchFocus = () => {
    if (!!user) {
      setIsDialogOpen(true)
    }
  }

  const handleLocationToggle = () => {
    if (isLocationEnabled) {
      dispatch(setLocationEnabled(false))
      dispatch(setCountry({ code: "", name: "" }))
      if (isMounted) {
        localStorage.removeItem("userCountry")
        localStorage.removeItem("userCountryName")
      }
    } else {
      if (country && country.code) {
        dispatch(setLocationEnabled(true))
      } else {
        requestLocation()
      }
    }
  }

  return {
    // State
    isDialogOpen,
    setIsDialogOpen,
    isDialogFilterOpen,
    setIsDialogFilterOpen,
    activeFiltersCount,
    isLoadingLocation,
    isMounted,
    user,
    searchTerm,
    country,
    priceRange,
    isLocationEnabled,
    rating,
    productType,
    tempRating,
    setTempRating,
    tempProductType,
    setTempProductType,
    tempPriceRange,
    setTempPriceRange,
    isSearching,
    isSearchFetching,
    shouldSearch,
    displayProducts,
    filteredForDialog,
    dispatch,
    // Handlers
    handleApplyFilters,
    handleResetFilters,
    handleSearchChange,
    handleSearchFocus,
    handleLocationToggle,
    // Constants
    initialFilterState,
  }
}
