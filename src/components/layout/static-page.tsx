import { Container } from "./section";

export function StaticPage({ title, lead, children }: { title: string; lead?: string; children: React.ReactNode }) {
  return (
    <Container className="max-w-3xl py-14">
      <header className="mb-10 space-y-3 border-b pb-8">
        <h1 className="text-3xl font-semibold tracking-tight">{title}</h1>
        {lead && <p className="text-lg text-muted-foreground">{lead}</p>}
      </header>
      <div className="cq-prose">{children}</div>
    </Container>
  );
}
