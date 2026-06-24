"use client";

import Image from "next/image";
import { useState } from "react";

type Props = {
  src: string;
  alt: string;
  className?: string;
  priority?: boolean;
  sizes?: string;
  fill?: boolean;
  /** SVG or JPG fallback if primary image fails to load */
  fallbackSrc?: string;
};

export function LibraryImage({ src, alt, className = "", priority = false, sizes, fill, fallbackSrc }: Props) {
  const [imgSrc, setImgSrc] = useState(src);

  const handleError = () => {
    if (fallbackSrc && imgSrc !== fallbackSrc) {
      setImgSrc(fallbackSrc);
    }
  };

  if (fill) {
    return (
      <Image
        src={imgSrc}
        alt={alt}
        fill
        priority={priority}
        sizes={sizes ?? "100vw"}
        className={`object-cover ${className}`}
        onError={handleError}
      />
    );
  }

  return (
    <Image
      src={imgSrc}
      alt={alt}
      width={800}
      height={450}
      priority={priority}
      sizes={sizes ?? "(max-width:768px) 100vw, 50vw"}
      className={`h-auto w-full object-cover ${className}`}
      onError={handleError}
    />
  );
}
