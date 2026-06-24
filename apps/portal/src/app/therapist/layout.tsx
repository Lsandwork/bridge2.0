import { TherapistShell } from "@/components/therapist/TherapistShell";
import "./therapist.css";

export default function TherapistLayout({ children }: { children: React.ReactNode }) {
  return <TherapistShell>{children}</TherapistShell>;
}
