"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLanguage } from "@/components/LanguageProvider";
import { TessIcon } from "@/components/tess/TessIcon";
import { navItems } from "./dashboardMockData";

function isNavActive(pathname: string, href: string) {
  return pathname === href || (href !== "/my-space" && pathname.startsWith(href));
}

export function BridgeBottomNav() {
  const pathname = usePathname();
  const { t } = useLanguage();

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
                <TessIcon size={22} decorative className="bridge-bottom-nav__tess-icon" />
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
