"use client";

import Link from "next/link";
import { useLanguage } from "@/components/LanguageProvider";
import { PetSprite } from "@/components/pets/PetSprite";
import { useCompanionPet } from "@/components/pets/CompanionPetProvider";

type Props = {
  href?: string;
};

export function TessFloatingButton({ href = "/my-space/tess/chat?talk=1" }: Props) {
  const { t } = useLanguage();
  const { state } = useCompanionPet();

  return (
    <Link href={href} className="bridge-tess-fab" aria-label={t("myspace.tess")}>
      <span className="bridge-tess-fab__orb">
        <span className="bridge-tess-fab__glow" aria-hidden />
        <span className="scale-[0.62]">
          <PetSprite species={state?.pet?.species ?? "spark"} mood={state?.pet?.mood ?? "idle"} size="sm" />
        </span>
      </span>
      <span className="bridge-tess-fab__label">{t("myspace.tess")}</span>
    </Link>
  );
}
