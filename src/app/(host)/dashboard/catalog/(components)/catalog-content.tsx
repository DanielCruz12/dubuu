"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DataTable } from "@/components/data-table/datatable";
import { DashboardTitle } from "@/components/dashboard-title";
import { EditDialog } from "./edit-dialog";
import { CategoryDialog } from "./category-dialog";
import { AmenityDialog } from "./amenity-dialog";
import { AudienceDialog } from "./audience-dialog";
import {
  useProductTypeColumns,
  useCategoryColumns,
  useAmenityColumns,
  useAudienceColumns,
} from "./columns";
import { useGetProductTypesQuery } from "@/redux/slices/product/product-types";
import { useGetProductCategoriesQuery } from "@/redux/slices/product/product-category";
import { useGetProductAmenitiesQuery } from "@/redux/slices/product/product-amenity";
import { useGetProductAudiencesQuery } from "@/redux/slices/product/product-audience";
import { useLanguage } from "@/lib/i18n-context";
import type { IProductTypes } from "@/types/product";

type CatalogEntity = "productTypes" | "categories" | "amenities" | "audience";

export function CatalogContent() {
  const { t } = useLanguage();
  const [entity, setEntity] = useState<CatalogEntity>("productTypes");
  const [search, setSearch] = useState("");

  // Product Types state
  const [ptDialogOpen, setPtDialogOpen] = useState(false);
  const [editingProductType, setEditingProductType] =
    useState<IProductTypes | null>(null);
  const { data: productTypes, isLoading: ptLoading } =
    useGetProductTypesQuery();

  // Categories state
  const [catDialogOpen, setCatDialogOpen] = useState(false);
  const { data: categories, isLoading: catLoading } =
    useGetProductCategoriesQuery();

  // Amenities state
  const [amDialogOpen, setAmDialogOpen] = useState(false);
  const { data: amenities, isLoading: amLoading } =
    useGetProductAmenitiesQuery();

  // Audience state
  const [auDialogOpen, setAuDialogOpen] = useState(false);
  const { data: audiences, isLoading: auLoading } =
    useGetProductAudiencesQuery();

  const ptColumns = useProductTypeColumns(
    (item) => {
      setEditingProductType(item);
      setPtDialogOpen(true);
    },
    () => {}
  );
  const catColumns = useCategoryColumns(() => {});
  const amColumns = useAmenityColumns(() => {});
  const auColumns = useAudienceColumns(() => {});

  const handleCreate = () => {
    switch (entity) {
      case "productTypes":
        setEditingProductType(null);
        setPtDialogOpen(true);
        break;
      case "categories":
        setCatDialogOpen(true);
        break;
      case "amenities":
        setAmDialogOpen(true);
        break;
      case "audience":
        setAuDialogOpen(true);
        break;
    }
  };

  const renderTable = () => {
    switch (entity) {
      case "productTypes":
        if (ptLoading)
          return <p className="text-muted-foreground">{t("common.loading")}</p>;
        return (
          <DataTable
            columns={ptColumns}
            data={productTypes ?? []}
            searchKey="name"
            showSearch={false}
            searchValue={search}
          />
        );
      case "categories":
        if (catLoading)
          return <p className="text-muted-foreground">{t("common.loading")}</p>;
        return (
          <DataTable
            columns={catColumns}
            data={categories ?? []}
            searchKey="name"
            showSearch={false}
            searchValue={search}
          />
        );
      case "amenities":
        if (amLoading)
          return <p className="text-muted-foreground">{t("common.loading")}</p>;
        return (
          <DataTable
            columns={amColumns}
            data={amenities ?? []}
            searchKey="name"
            showSearch={false}
            searchValue={search}
          />
        );
      case "audience":
        if (auLoading)
          return <p className="text-muted-foreground">{t("common.loading")}</p>;
        return (
          <DataTable
            columns={auColumns}
            data={audiences ?? []}
            searchKey="name"
            showSearch={false}
            searchValue={search}
          />
        );
      default:
        return (
          <p className="text-muted-foreground text-center py-8">
            Próximamente
          </p>
        );
    }
  };

  return (
    <div className="flex flex-col gap-4 px-3 md:px-0">
      <DashboardTitle
        heading={t("catalog.title")}
        description={t("catalog.description")}
      />

      <div className="space-y-2">
        <h3 className="text-sm font-semibold">{t("catalog.selectLabel")}</h3>
        <Select
          value={entity}
          onValueChange={(v) => {
            setEntity(v as CatalogEntity);
            setSearch("");
          }}
        >
          <SelectTrigger className="w-[280px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="productTypes">
              {t("catalog.tabs.productTypes")}
            </SelectItem>
            <SelectItem value="categories">
              {t("catalog.tabs.categories")}
            </SelectItem>
            <SelectItem value="amenities">
              {t("catalog.tabs.amenities")}
            </SelectItem>
            <SelectItem value="audience">
              {t("catalog.tabs.audience")}
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center gap-3">
        <Input
          placeholder={t("dashboard.dataTable.searchPlaceholder")}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-[80%]"
        />
        <Button onClick={handleCreate} className="shrink-0">
          <Plus className="mr-2 h-4 w-4" />
          {t("catalog.create")}
        </Button>
      </div>

      {renderTable()}

      <EditDialog
        open={ptDialogOpen}
        onOpenChange={setPtDialogOpen}
        item={editingProductType}
      />
      <CategoryDialog open={catDialogOpen} onOpenChange={setCatDialogOpen} />
      <AmenityDialog open={amDialogOpen} onOpenChange={setAmDialogOpen} />
      <AudienceDialog open={auDialogOpen} onOpenChange={setAuDialogOpen} />
    </div>
  );
}
