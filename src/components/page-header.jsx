import { SidebarTrigger } from "./ui/sidebar";

export function PageHeader({ title, description, action }) {
  return (
    <div className="flex items-center justify-start gap-3 border-b border-border bg-card pl-3 py-6">
      <SidebarTrigger />
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
        {description && (
          <p className="mt-1 text-sm text-muted-foreground">{description}</p>
        )}
      </div>
      {action && <div>{action}</div>}
    </div>
  );
}
