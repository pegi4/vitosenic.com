const links = [
  { label: "Email", href: "mailto:vito@intheloop.io" },
  { label: "GitHub", href: "https://github.com/pegi4" },
  { label: "LinkedIn", href: "https://linkedin.com/in/vitosenic" },
  { label: "X", href: "https://x.com/vitosenic" },
  { label: "Instagram", href: "https://instagram.com/vitosenic" },
];

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-6">
      <div className="w-full max-w-md">
        <h1
          className="rise text-4xl sm:text-5xl font-semibold tracking-tight"
          style={{ animationDelay: "0.05s" }}
        >
          Vito Senič
        </h1>

        <nav
          className="rise mt-8 flex flex-wrap gap-x-6 gap-y-3 text-sm"
          style={{ animationDelay: "0.2s" }}
        >
          {links.map((link) => (
            <a
              key={link.label}
              href={link.href}
              target={link.href.startsWith("http") ? "_blank" : undefined}
              rel="noopener noreferrer"
              className="text-muted transition-colors duration-200 hover:text-accent"
            >
              {link.label}
            </a>
          ))}
        </nav>
      </div>
    </main>
  );
}
