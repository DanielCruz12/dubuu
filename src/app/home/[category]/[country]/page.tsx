// This handles /home/tours/spain or /home/rental/italy
export default function CountryPage({
  params,
}: {
  params: { category: string; country: string };
}) {
  const { category, country } = params;

  // Handle "all" as a special case
  if (country === "all") {
    return (
      <div>
        <h1>All {category} from all countries</h1>
        {/* List all items */}
      </div>
    );
  }

  return (
    <div>
      <h1>
        {category} in {country}
      </h1>
      {/* List items filtered by country */}
    </div>
  );
}
