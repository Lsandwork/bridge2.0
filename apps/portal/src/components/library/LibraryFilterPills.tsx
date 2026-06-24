"use client";

import type { LibraryFilter } from "@family-support/core";
import { libraryFilters, getLocalizedLibraryFilter } from "@family-support/core";
import { useLanguage } from "@/components/LanguageProvider";

type Props = {
  active: LibraryFilter;
  onChange: (filter: LibraryFilter) => void;
};

export function LibraryFilterPills({ active, onChange }: Props) {
  const { t } = useLanguage();

  return (
    <div className="flex flex-wrap gap-2" role="tablist" aria-label={t("library.filterAria")}>
      {libraryFilters.map((filter) => (
        <button
          key={filter}
          role="tab"
          aria-selected={active === filter}
          onClick={() => onChange(filter)}
          className={`rounded-full px-4 py-2 text-sm font-bold transition ${
            active === filter
              ? "bg-brand text-white shadow-sm"
              : "border border-stone-300 bg-white text-stone-900 hover:border-brand/40 hover:bg-stone-50"
          }`}
        >
          {getLocalizedLibraryFilter(t, filter)}
        </button>
      ))}
    </div>
  );
}
