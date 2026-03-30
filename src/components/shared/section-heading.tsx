type SectionHeadingProps = {
  eyebrow?: string;
  title: string;
  description?: string;
};

export function SectionHeading({ eyebrow, title, description }: SectionHeadingProps) {
  return (
    <div className="max-w-3xl">
      {eyebrow ? (
        <p className="mb-3 text-sm font-semibold uppercase tracking-[0.24em] text-brand">{eyebrow}</p>
      ) : null}
      <h2 className="text-3xl font-bold tracking-tight text-foreground lg:text-4xl">{title}</h2>
      {description ? <p className="mt-4 text-base leading-7 text-foreground/70">{description}</p> : null}
    </div>
  );
}
