import { SearchX } from "lucide-react";

type EmptyStateProps = {
  title: string;
  description: string;
};

export function EmptyState({ title, description }: EmptyStateProps) {
  return (
    <div className="surface-card flex min-h-56 flex-col items-center justify-center rounded-[28px] px-8 py-12 text-center">
      <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-brand/10 text-brand">
        <SearchX className="h-6 w-6" />
      </div>
      <h3 className="text-xl font-semibold tracking-tight text-foreground">{title}</h3>
      <p className="mt-3 max-w-xl text-base leading-7 text-foreground/70">{description}</p>
    </div>
  );
}
