import type { Locale } from "../i18n";
import { en } from "./en";
import { es } from "./es";
import { zh } from "./zh";
import { fr } from "./fr";
import { de } from "./de";
import { pt } from "./pt";
import { vi } from "./vi";
import { ko } from "./ko";
import { ar } from "./ar";
import { ja } from "./ja";
import { hi } from "./hi";
import { ru } from "./ru";
import type { Messages } from "./types";

export const bundles: Record<Locale, Messages> = { en, es, zh, fr, de, pt, vi, ko, ar, ja, hi, ru };
