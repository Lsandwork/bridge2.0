import Image from "next/image";

export const TESS_ICON_PATH = "/tess/tess-icon.png";
export const TESS_AVATAR_PATH = "/tess/tess-avatar.png";
export const TESS_REFERENCE_PATH = "/tess/tess-reference.png";
export const TESS_ICON_ALT = "Nuvio support companion";

type Props = {
  size?: number;
  className?: string;
  alt?: string;
  decorative?: boolean;
  /** Use full character reference art for animated companion. */
  variant?: "icon" | "avatar";
};

export function TessIcon({
  size = 40,
  className = "",
  alt = TESS_ICON_ALT,
  decorative = false,
  variant = "icon",
}: Props) {
  const src = variant === "avatar" ? TESS_AVATAR_PATH : TESS_ICON_PATH;
  return (
    <Image
      src={src}
      alt={decorative ? "" : alt}
      width={size}
      height={size}
      className={`tess-icon ${className}`.trim()}
      aria-hidden={decorative ? true : undefined}
      priority={size >= 48}
    />
  );
}

export function TessNavIcon({ className }: { className?: string }) {
  return <TessIcon size={16} className={className} decorative />;
}
