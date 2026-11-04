// _______________This Code was generated using GenAI tool : Codify, Please check for accuracy_______________
export function PageHeader({ title }: { title: string }) {
  return <h1 className="mb-4 text-3xl font-bold tracking-tight">{title}</h1>;
}

export function EmptyState({ message }: { message: string }) {
  return (
    <div className="rounded-3xl border border-border bg-card p-6 text-center text-muted" role="status">
      {message}
    </div>
  );
}
// __________________________GenAI: Generated code ends here______________________________
