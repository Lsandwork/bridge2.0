"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { useLanguage } from "@/components/LanguageProvider";
import { useAuth } from "@/components/AuthProvider";
import { useProfile } from "@/components/ProfileProvider";
import { BridgeHeader } from "@/components/dashboard/BridgeHeader";
import { AccessibilityToggles } from "@/components/dashboard/AccessibilityToggles";
import { BridgeBottomNav } from "@/components/dashboard/BridgeBottomNav";
import { navItems } from "@/components/dashboard/dashboardMockData";
import { PetSprite } from "@/components/pets/PetSprite";
import { useCompanionPet } from "@/components/pets/CompanionPetProvider";

function isNavActive(pathname: string, href: string) {
  return pathname === href || (href !== "/my-space" && pathname.startsWith(href));
}

export function MySpaceShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { t } = useLanguage();
  const { state } = useCompanionPet();
  const { user } = useAuth();
  const { activeProfile, setActiveProfileId, lowStimulation, setLowStimulation, highContrast, setHighContrast } =
    useProfile();
  const age = activeProfile?.ageGroup ?? "child";
  const isChildAccount = user?.role === "child_user";
  const showParentLink = !isChildAccount;
  const showSwitchProfile = !isChildAccount && Boolean(activeProfile);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const showNav = mounted && activeProfile;
  const profileInitial = activeProfile?.name?.trim().charAt(0).toUpperCase() ?? "B";
  const isHome = pathname === "/my-space";

  return (
    <div
      className={`my-space my-space--nav-bottom bridge-dashboard ${lowStimulation ? "low-stim" : ""} ${highContrast ? "high-contrast" : ""}`}
      data-age={age}
    >
      <div className="sticky top-0 z-20 border-b border-[var(--bd-border)] bg-[var(--bd-bg)]/95 backdrop-blur-sm">
        <BridgeHeader profileInitial={profileInitial} showParentLink={showParentLink} />

        {showNav ? (
          <>
            {!isHome ? (
              <AccessibilityToggles
                calmActive={lowStimulation}
                contrastActive={highContrast}
                onCalmChange={setLowStimulation}
                onContrastChange={setHighContrast}
                showSwitchProfile={showSwitchProfile}
                onSwitchProfile={() => setActiveProfileId(null)}
              />
            ) : null}

            <nav className="ms-top-nav mx-auto max-w-lg px-3 pb-2" aria-label="My Space">
              {navItems.map((item) => {
                const active = isNavActive(pathname, item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`min-w-[4.5rem] shrink-0 rounded-2xl py-2 text-center text-[10px] font-extrabold ${
                      active ? "bg-[#818cf8] text-white" : "bg-white text-[var(--bd-text)]"
                    }`}
                    aria-current={active ? "page" : undefined}
                  >
                    <span className="ms-top-nav__icon" aria-hidden>
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
                    {t(item.labelKey)}
                  </Link>
                );
              })}
            </nav>
          </>
        ) : null}
      </div>

      {children}

      {showNav ? <BridgeBottomNav /> : null}
    </div>
  );
}
