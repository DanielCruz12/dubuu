"use client";
import { Suspense, useState, useEffect, useCallback } from "react";
import { useSearchParams, usePathname, useRouter } from "next/navigation";
import TourSection from "@/components/sections/tour-section";
import UpTop from "@/components/up-top";
import { useGetProductsQuery } from "@/redux/slices/product/product-slice";
import type { IProduct } from "@/types/product";
import SearchSection from "@/components/sections/search-section";
import { isProductType } from "@/utils";
import {
  parseProductTypeParam,
  productTypeKeyToFormKind,
} from "@/constants/product-type";
import { useAppDispatch, useAppSelector } from "@/redux/store";
import { setProductType } from "@/redux/slices/product/search/search-slice";

function HomeContent() {
  // Filtro de categoría vía ?type=tours|rental (enlazado desde el footer y
  // el buscador del landing). Se valida contra los alias conocidos y se
  // envía al backend como `product_type` para que la paginación traiga solo
  // productos de ese tipo (antes se filtraba solo en el cliente sobre las
  // primeras 20 filas sin filtrar, lo que podía dar "sin resultados" si esa
  // página no traía ningún producto del tipo pedido). isProductType se
  // conserva como filtro de cliente adicional.
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();
  const typeFilter = searchParams.get("type");
  const validatedProductTypeKey = typeFilter
    ? parseProductTypeParam(typeFilter)
    : null;
  const productTypeParam = validatedProductTypeKey
    ? productTypeKeyToFormKind(validatedProductTypeKey)
    : undefined;

  // La pill de tipo de producto (Tours/Rental) debajo del buscador lee y
  // escribe su estado en Redux (search-slice.productType). `activeProductType`
  // es el tipo que realmente respalda `allProducts`/`searchResults` en este
  // componente: arranca igual al ?type= de la URL (o al valor ya guardado en
  // Redux si no hay query param) y luego se resincroniza cada vez que el
  // usuario cambia la pill o el diálogo de filtros, para que la lista y el
  // fetch usen siempre el mismo tipo que el que se ve seleccionado.
  const dispatch = useAppDispatch();
  const selectedProductType = useAppSelector((state) => state.search.productType);
  const [activeProductType, setActiveProductType] = useState<string | undefined>(
    () => productTypeParam ?? selectedProductType
  );

  // Si se llega/navega con un ?type= explícito en la URL, ese valor manda
  // sobre lo que hubiera guardado en Redux (p. ej. de una sesión anterior).
  useEffect(() => {
    if (productTypeParam) {
      dispatch(setProductType(productTypeParam));
    }
  }, [productTypeParam, dispatch]);

  // Al revés: cuando el usuario cambia el tipo desde la pill o el diálogo de
  // filtros (que solo escriben en Redux), se refleja en la URL para que
  // quede como fuente única de verdad y la página sea compartible/recargable.
  useEffect(() => {
    if (selectedProductType && selectedProductType !== typeFilter) {
      router.replace(`${pathname}?type=${selectedProductType}`, { scroll: false });
    }
  }, [selectedProductType, typeFilter, pathname, router]);

  const [allProducts, setAllProducts] = useState<IProduct[]>([]);
  const [searchResults, setSearchResults] = useState<IProduct[]>([]);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [shouldFetchMore, setShouldFetchMore] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [hasMoreProducts, setHasMoreProducts] = useState<boolean>(true);

  // Cuando el tipo seleccionado en Redux (pill o diálogo de filtros) deja de
  // coincidir con el tipo que respalda la lista actual, se resetea la
  // paginación para volver a traer productos desde cero con el nuevo tipo.
  useEffect(() => {
    if (selectedProductType !== activeProductType) {
      setActiveProductType(selectedProductType);
      setAllProducts([]);
      setSearchResults([]);
      setNextCursor(null);
      setHasMoreProducts(true);
      // Cancela cualquier "cargar más" en curso del tipo anterior: si no se
      // limpian estos flags, al resetear nextCursor a null la query de "más
      // productos" queda con `skip: true` para siempre y el spinner de
      // isLoadingMore nunca se apaga.
      setShouldFetchMore(false);
      setIsLoadingMore(false);
    }
  }, [selectedProductType, activeProductType]);

  const { data: initialProductsData, isLoading: isLoadingInitial } =
    useGetProductsQuery(
      {
        limit: 20,
        is_approved: true,
        is_active: true,
        product_type: activeProductType,
      },
      {
        refetchOnMountOrArgChange: false,
        refetchOnFocus: false,
        refetchOnReconnect: false,
      }
    );

  const {
    data: moreProductsData,
    isLoading: isLoadingMoreQuery,
    isFetching: isFetchingMore,
  } = useGetProductsQuery(
    {
      limit: 8,
      cursor: nextCursor || undefined,
      is_approved: true,
      is_active: true,
      product_type: activeProductType,
    },
    {
      skip: !shouldFetchMore || !nextCursor,
      refetchOnMountOrArgChange: false,
      refetchOnFocus: false,
      refetchOnReconnect: false,
    }
  );

  const applyTypeFilter = (products: IProduct[]) =>
    activeProductType
      ? products.filter((p) => isProductType(p, activeProductType))
      : products;

  useEffect(() => {
    if (initialProductsData && allProducts.length === 0) {
      const validData = Array.isArray(initialProductsData.data)
        ? initialProductsData.data
        : [];
      setAllProducts(validData);
      setSearchResults(applyTypeFilter(validData));
      setNextCursor(initialProductsData.pagination.nextCursor);
      setHasMoreProducts(initialProductsData.pagination.hasMore);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialProductsData, allProducts.length, activeProductType]);

  useEffect(() => {
    if (
      shouldFetchMore &&
      moreProductsData &&
      !isLoadingMoreQuery &&
      !isFetchingMore
    ) {
      setAllProducts((prev) => [...prev, ...moreProductsData.data]);
      setSearchResults((prev) => [...prev, ...applyTypeFilter(moreProductsData.data)]);
      setNextCursor(moreProductsData.pagination.nextCursor);
      setHasMoreProducts(moreProductsData.pagination.hasMore);
      setShouldFetchMore(false);
      setIsLoadingMore(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shouldFetchMore, moreProductsData, isLoadingMoreQuery, isFetchingMore]);

  const loadMoreProducts = () => {
    if (isLoadingMore || !nextCursor) return;
    setIsLoadingMore(true);
    setShouldFetchMore(true);
  };

  // Memoizado: SearchSection dispara un efecto cada vez que esta referencia
  // cambia. Sin useCallback, applyTypeFilter generaba un array nuevo en cada
  // render (por el .filter()), lo que rompía el bail-out de React y producía
  // un loop infinito de renders cuando había un ?type= activo.
  const handleSearchResults = useCallback(
    (results: IProduct[]) => {
      const validResults = Array.isArray(results) ? results : [];
      setSearchResults(applyTypeFilter(validResults));
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [activeProductType]
  );

  // Memoizado por la misma razón que handleSearchResults arriba: use-search-logic
  // dispara su efecto de "notificar loading" cada vez que esta referencia cambia
  // (ver use-search-logic.tsx). Sin useCallback, cada render de HomeContent
  // generaba una función nueva y el efecto se re-ejecutaba de inmediato con
  // isSearching/isSearchFetching aún en false (la query de RTK Query todavía no
  // se había disparado), pisando el flag de loading y dejando visible el listado
  // anterior (p. ej. tours) justo cuando se cambiaba a otro tipo de producto,
  // hasta que un segundo cambio de filtro volvía a sincronizar el estado.
  const handleSearchLoading = useCallback((loading: boolean) => {
    setIsSearching(loading);
  }, []);

  return (
    <>
      <UpTop />
      <SearchSection
        products={allProducts}
        onSearchResults={handleSearchResults}
        onSearchLoading={handleSearchLoading}
      />
      <TourSection
        products={searchResults}
        isLoading={isLoadingInitial || isSearching}
        onLoadMore={loadMoreProducts}
        hasMore={hasMoreProducts}
        isLoadingMore={isLoadingMore}
      />
      {/* <PopularDestinations /> */}
    </>
  );
}

export default function Home() {
  return (
    <Suspense fallback={null}>
      <HomeContent />
    </Suspense>
  );
}
