"use client";

import { ExternalLink, MapPin, Phone, Star } from "lucide-react";
import type { RecommendationItem } from "@/lib/tess/recommendations-types";

type Props = {
  items: RecommendationItem[];
  sourcesUsed?: string[];
  isFallback?: boolean;
};

function sourceLabel(source: RecommendationItem["source"]) {
  if (source === "google_places") return "Google Places";
  if (source === "yelp") return "Yelp";
  if (source === "web") return "Website";
  return "Source";
}

export function TessRecommendationCards({ items, sourcesUsed, isFallback }: Props) {
  if (!items.length || isFallback) return null;

  return (
    <div className="space-y-3 px-4 pb-2">
      {sourcesUsed?.length ? (
        <p className="text-[10px] font-bold uppercase tracking-wide text-[var(--text-tertiary)]">
          Sources:{" "}
          {sourcesUsed
            .map((s) => (s === "google_places" ? "Google Places" : s === "yelp" ? "Yelp" : s))
            .join(" · ")}
        </p>
      ) : null}
      {items.map((item) => (
        <article
          key={`${item.name}-${item.source}`}
          className="rounded-2xl border border-[var(--border)] bg-white p-4 shadow-sm"
        >
          <div className="flex flex-wrap items-start justify-between gap-2">
            <h3 className="text-sm font-extrabold text-[var(--text-primary)]">{item.name}</h3>
            <span className="rounded-full bg-[var(--brand-light)] px-2 py-0.5 text-[10px] font-bold text-[var(--brand-dark)]">
              {sourceLabel(item.source)}
              {(item.matchedSources ?? 1) > 1 ? " + match" : ""}
            </span>
          </div>

          {item.rating != null ? (
            <p className="mt-1 flex items-center gap-1 text-xs font-semibold text-[var(--text-secondary)]">
              <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
              {item.rating.toFixed(1)}
              {item.reviewCount != null ? ` · ${item.reviewCount} reviews` : null}
            </p>
          ) : null}

          {item.reasons.length ? (
            <ul className="mt-2 space-y-1 text-xs leading-relaxed text-[var(--text-secondary)]">
              {item.reasons.slice(0, 2).map((reason) => (
                <li key={reason}>• {reason}</li>
              ))}
            </ul>
          ) : null}

          {item.address ? (
            <p className="mt-2 flex items-start gap-1.5 text-xs text-[var(--text-secondary)]">
              <MapPin className="mt-0.5 h-3 w-3 shrink-0" />
              {item.address}
            </p>
          ) : null}

          <div className="mt-3 flex flex-wrap gap-2">
            {item.phone ? (
              <a
                href={`tel:${item.phone.replace(/\s/g, "")}`}
                className="inline-flex items-center gap-1 rounded-full border border-[var(--border)] px-2.5 py-1 text-[10px] font-bold text-[var(--brand)]"
              >
                <Phone className="h-3 w-3" /> Call
              </a>
            ) : null}
            {item.website ? (
              <a
                href={item.website}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 rounded-full border border-[var(--border)] px-2.5 py-1 text-[10px] font-bold text-[var(--brand)]"
              >
                <ExternalLink className="h-3 w-3" /> Website
              </a>
            ) : null}
            {item.mapsUrl ? (
              <a
                href={item.mapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 rounded-full border border-[var(--border)] px-2.5 py-1 text-[10px] font-bold text-[var(--brand)]"
              >
                <MapPin className="h-3 w-3" /> Directions
              </a>
            ) : null}
            {item.yelpUrl ? (
              <a
                href={item.yelpUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 rounded-full border border-[var(--border)] px-2.5 py-1 text-[10px] font-bold text-[var(--brand)]"
              >
                <ExternalLink className="h-3 w-3" /> Yelp
              </a>
            ) : null}
          </div>

          {item.cautions?.length ? (
            <p className="mt-2 text-[10px] leading-relaxed text-amber-800">{item.cautions[0]}</p>
          ) : null}
        </article>
      ))}
    </div>
  );
}
