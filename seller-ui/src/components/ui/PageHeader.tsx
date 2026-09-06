interface PageHeaderProps {
  title: string;
  subtitle: string;
}

export default function PageHeader({
  title,    
  subtitle,
}: PageHeaderProps) {
  return (
    <section>
      <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-neutral-400">
        Seller Center
      </p>

      <h1 className="mt-3 text-3xl font-semibold tracking-[-0.04em] text-neutral-950 sm:text-[34px]">
        {title}
      </h1>

      <p className="mt-2 max-w-2xl text-sm leading-6 text-neutral-500">
        {subtitle}
      </p>
    </section>
  );
}