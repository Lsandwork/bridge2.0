export function LoadingBlock({ label }: { label: string }) {
  return <p className="py-8 text-center text-sm text-slate-500">{label}</p>;
}

export function EmptyBlock({ title, description }: { title: string; description: string }) {
  return (
    <div className="py-12 text-center">
      <p className="font-semibold">{title}</p>
      <p className="mt-1 text-sm text-slate-500">{description}</p>
    </div>
  );
}
