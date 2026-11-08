import { FileQuestion } from "lucide-react";
import Link from "next/link";
import { Container } from "@/components/layout/section";

export default function NotFound() {
  return (
    <Container className="flex flex-col items-center gap-4 py-28 text-center">
      <FileQuestion className="size-10 text-muted-foreground" aria-hidden="true" />
      <p className="font-mono text-sm text-brand">404</p>
      <h1 className="text-3xl font-semibold tracking-tight">Nothing quarried here</h1>
      <p className="max-w-md text-muted-foreground">The page you are looking for doesn&apos;t exist or has been moved.</p>
      <div className="flex gap-4 text-sm font-medium">
        <Link href="/explore" className="text-brand hover:underline">Explore cheatsheets</Link>
        <Link href="/" className="text-muted-foreground hover:text-foreground">Go home</Link>
      </div>
    </Container>
  );
}
