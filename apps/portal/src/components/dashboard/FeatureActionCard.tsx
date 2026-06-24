import Link from "next/link";
import type { FeatureCard } from "./dashboardMockData";

type Props = {
  card: FeatureCard;
  title: string;
  description: string;
};

export function FeatureActionCard({ card, title, description }: Props) {
  return (
    <Link
      href={card.href}
      className="bridge-feature-card"
      style={{ background: `linear-gradient(145deg, ${card.gradient[0]}, ${card.gradient[1]})` }}
      aria-label={`${title}: ${description}`}
    >
      <div>
        <span className="bridge-feature-card__icon" aria-hidden>
          {card.icon}
        </span>
        <h3 className="bridge-feature-card__title">{title}</h3>
        <p className="bridge-feature-card__desc">{description}</p>
      </div>
      <span className="bridge-feature-card__cta" aria-hidden>
        →
      </span>
    </Link>
  );
}
