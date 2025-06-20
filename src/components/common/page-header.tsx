import type { ReactNode } from 'react';

interface PageHeaderProps {
  title: string;
  description?: string;
  actionButton?: ReactNode;
}

export default function PageHeader({ title, description, actionButton }: PageHeaderProps) {
  return (
    <div className="mb-6 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
      <div>
        <h1 className="font-headline text-3xl font-bold tracking-tight">{title}</h1>
        {description && (
          <p className="mt-1 text-muted-foreground">{description}</p>
        )}
      </div>
      {actionButton && <div className="shrink-0">{actionButton}</div>}
    </div>
  );
}
