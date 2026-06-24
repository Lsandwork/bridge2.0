import { ProfileProvider } from "@/components/ProfileProvider";
import { MySpaceShell } from "@/components/my-space/MySpaceShell";
import "@/components/dashboard/dashboard.css";
import "./my-space.css";
import "./premium-games.css";

export default function MySpaceLayout({ children }: { children: React.ReactNode }) {
  return (
    <ProfileProvider>
      <MySpaceShell>{children}</MySpaceShell>
    </ProfileProvider>
  );
}
