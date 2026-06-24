import "./tess-globals.css";
import "./tess.css";

export default function TessLayout({ children }: { children: React.ReactNode }) {
  return <div className="tess-page">{children}</div>;
}
