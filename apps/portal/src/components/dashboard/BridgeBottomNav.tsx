"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLanguage } from "@/components/LanguageProvider";
import { PetSprite } from "@/components/pets/PetSprite";
import { useCompanionPet } from "@/components/pets/CompanionPetProvider";
import { navItems } from "./dashboardMockData";

function isNavActive(pathname: string, href: string) {
  return pathname === href || (href !== "/my-space" && pathname.startsWith(href));
}

export function BridgeBottomNav() {
  const pathname = usePathname();
  const { t } = useLanguage();
  const { state } = useCompanionPet();

  return (
    <nav className="bridge-bottom-nav" aria-label="My Space navigation">
      {navItems.map((item) => {
        const active = isNavActive(pathname, item.href);
        return (
          <Link
            key={item.id}
            href={item.href}
            className={`bridge-bottom-nav__link ${active ? "bridge-bottom-nav__link--active" : ""}`}
            aria-current={active ? "page" : undefined}
          >
            <span className="bridge-bottom-nav__icon" aria-hidden>
              {item.useTessIcon ? (
                <span className="inline-grid h-6 w-6 place-items-center overflow-visible">
                  <span className="scale-[0.34]">
                    <PetSprite species={state?.pet?.species ?? "spark"} mood={state?.pet?.mood ?? "idle"} size="sm" />
                  </span>
                </span>
              ) : (
                item.icon
              )}
            </span>
            <span>{t(item.labelKey)}</span>
          </Link>
        );
      })}
    </nav>
  );
}
