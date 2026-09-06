interface SectionHeaderProps {
  title: string;
  description?: string;
}

export default function SectionHeader({
  title,
  description,
}: SectionHeaderProps) {    
  return (
    <div className="min-w-0">
      <h2 className="text-sm font-semibold tracking-[-0.02em] text-neutral-950">
        {title}
      </h2>

      {description && (
        <p className="mt-1 text-xs leading-5 text-neutral-500">
          {description}
        </p>
      )}
    </div>
  );
}