import { notFound } from "next/navigation";
import { findCountryFromNormalizedName, getAvailableCountries } from "@/utils";
import { sampleTours } from "@/utils/data";
import ToursPage from "@/components/modules/tours";

// This handles /home/tours/japan or any other country
export default function CountryPage({
  params,
}: {
  params: { category: string; country: string };
}) {
  const { country: normalizedCountry } = params;

  // Special case for 'all' to show all countries
  if (normalizedCountry === "all") {
    return <ToursPage />;
  }

  // Get all available countries from our data
  const availableCountries = getAvailableCountries(sampleTours);

  // Find the original country name from the normalized URL version
  const countryName = findCountryFromNormalizedName(
    normalizedCountry,
    availableCountries
  );

  // If we can't find a matching country, return 404
  if (!countryName) {
    return notFound();
  }

  return <ToursPage countryFilter={countryName} />;
}
