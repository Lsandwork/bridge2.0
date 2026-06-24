"use client";

import Link from "next/link";
import { useLanguage } from "@/components/LanguageProvider";
import { TessIcon } from "@/components/tess/TessIcon";

type Props = {
  href?: string;
};

export function TessFloatingButton({ href = "/my-space/tess/chat?talk=1" }: Props) {
  const { t } = useLanguage();

  return (
    <Link href={href} className="bridge-tess-fab" aria-label={t("myspace.tess")}>
      <span className="bridge-tess-fab__orb">
        <span className="bridge-tess-fab__glow" aria-hidden />
        <TessIcon size={36} decorative className="bridge-tess-fab__icon" />
      </span>
      <span className="bridge-tess-fab__label">{t("myspace.tess")}</span>
    </Link>
  );
}
