import type { DashboardUser } from "./dashboardMockData";

type Props = {
  user: DashboardUser;
};

export function HeroCard({ user }: Props) {
  return (
    <section className="bridge-hero" aria-label={`${user.greeting}, ${user.name}`}>
      <span className="bridge-hero__decor bridge-hero__decor--cloud" aria-hidden />
      <span className="bridge-hero__decor bridge-hero__decor--sun" aria-hidden />
      <div className="bridge-hero__stars" aria-label={`${user.stars} stars`}>
        <span aria-hidden>⭐</span>
        <span>{user.stars} stars</span>
      </div>
      <h2 className="bridge-hero__greeting">
        {user.greeting}, {user.name}
      </h2>
      <p className="bridge-hero__encouragement">{user.encouragement}</p>
    </section>
  );
}
