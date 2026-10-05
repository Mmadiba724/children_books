import type { ReactNode } from "react";

type SectionHeadingProps = {
  readonly id?: string;
  readonly eyebrow?: string;
  readonly title: string;
  readonly description?: string;
  readonly action?: ReactNode;
  readonly as?: "h1" | "h2";
};

export default function SectionHeading({
  id,
  eyebrow,
  title,
  description,
  action,
  as: Tag = "h2",
}: SectionHeadingProps) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-x-6 gap-y-3 md:mb-8">
      <div className="max-w-2xl text-left">
        {eyebrow && <p className="kb-eyebrow mb-1">{eyebrow}</p>}
        <Tag id={id} className="kb-section-title">
          {title}
        </Tag>
        {description && <p className="mt-2 text-ink-soft">{description}</p>}
      </div>
      {action}
    </div>
  );
}
