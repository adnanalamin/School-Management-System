import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Logo } from '@/components/common/Logo';
import { SkipLink } from '@/components/common/SkipLink';
import { ThemeToggle } from '@/components/common/ThemeToggle';
import { Button } from '@/components/ui/button';
import { SystemStatusCard } from '@/features/system/SystemStatusCard';
import { usePageTitle } from '@/hooks/use-page-title';
import { env } from '@/lib/env';

const principles = [
  {
    title: 'Everyone sees what they need',
    body: 'Access follows each person’s role, so staff, students and parents only see the information that is theirs to see.',
  },
  {
    title: 'Works on every screen',
    body: 'Layouts adapt from phones to wide monitors, with keyboard navigation and screen-reader labels throughout.',
  },
  {
    title: 'Student data stays protected',
    body: 'Records are handled as sensitive information and kept limited to the people who need them.',
  },
];

export function LandingPage() {
  usePageTitle();

  return (
    <div className="min-h-dvh bg-background">
      <SkipLink />

      <header className="border-b bg-background/90 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5 sm:px-6 lg:px-8">
          <Link to="/" aria-label={`${env.VITE_APP_NAME} home`} className="rounded-md">
            <Logo />
          </Link>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Button asChild size="sm">
              <Link to="/app">Open workspace</Link>
            </Button>
          </div>
        </div>
      </header>

      <main id="main" tabIndex={-1} className="focus:outline-none">
        <section className="ruled-paper border-b">
          <div className="mx-auto grid max-w-6xl gap-10 px-5 py-14 sm:px-6 sm:py-20 lg:grid-cols-[minmax(0,1.25fr)_minmax(0,1fr)] lg:items-center lg:gap-16 lg:px-8 lg:py-28">
            <div className="space-y-6">
              <h1 className="font-display text-4xl font-semibold leading-[1.08] tracking-tight sm:text-5xl lg:text-6xl">
                Run the whole school from one secure workspace.
              </h1>
              <p className="max-w-xl text-lg text-muted-foreground">
                Built for administrators, teachers, students and parents, and designed to work as well on a phone as on a desk.
              </p>
              <div className="flex flex-wrap gap-3 pt-2">
                <Button asChild size="lg">
                  <Link to="/app">
                    Open workspace
                    <ArrowRight aria-hidden="true" />
                  </Link>
                </Button>
                <Button asChild size="lg" variant="outline" className="bg-card">
                  <Link to="/app/system">View system status</Link>
                </Button>
              </div>
            </div>

            <SystemStatusCard />
          </div>
        </section>

        <section aria-labelledby="principles-heading" className="mx-auto max-w-6xl px-5 py-14 sm:px-6 sm:py-20 lg:px-8">
          <h2 id="principles-heading" className="font-display text-2xl font-semibold tracking-tight sm:text-3xl">
            Designed for how schools work
          </h2>
          <div className="mt-8 grid gap-8 md:grid-cols-3 md:gap-10">
            {principles.map((item) => (
              <div key={item.title} className="space-y-2">
                <h3 className="text-base font-semibold">{item.title}</h3>
                <p className="text-sm leading-relaxed text-muted-foreground">{item.body}</p>
              </div>
            ))}
          </div>
        </section>
      </main>

      <footer className="border-t">
        <div className="mx-auto max-w-6xl px-5 py-6 text-sm text-muted-foreground sm:px-6 lg:px-8">
          © {new Date().getFullYear()} {env.VITE_APP_NAME}
        </div>
      </footer>
    </div>
  );
}
