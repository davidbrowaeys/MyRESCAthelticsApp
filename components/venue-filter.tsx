// _______________This Code was generated using GenAI tool : Codify, Please check for accuracy_______________
import Link from "next/link";

export type VenueFilterValue = "all" | "outdoor" | "indoor";

export function parseVenue(value: string | undefined): VenueFilterValue {
  return value === "indoor" || value === "outdoor" ? value : "all";
}

/** All / Outdoor / Indoor chips. Plain links (URL state), so it works without client JS. */
export function VenueFilter({
  current,
  basePath,
  labels,
}: {
  current: VenueFilterValue;
  basePath: string;
  labels: { all: string; outdoor: string; indoor: string; filter: string };
}) {
  const options: Array<{ value: VenueFilterValue; label: string }> = [
    { value: "all", label: labels.all },
    { value: "outdoor", label: labels.outdoor },
    { value: "indoor", label: labels.indoor },
  ];
  return (
    <nav aria-label={labels.filter} className="mb-4 flex gap-2">
      {options.map((o) => (
        <Link
          key={o.value}
          href={o.value === "all" ? basePath : `${basePath}?venue=${o.value}`}
          aria-current={current === o.value ? "true" : undefined}
          className={`flex min-h-12 flex-1 items-center justify-center rounded-2xl border px-3 text-sm font-semibold ${
            current === o.value ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card"
          }`}
        >
          {o.label}
        </Link>
      ))}
    </nav>
  );
}
// __________________________GenAI: Generated code ends here______________________________
