import { Link } from "react-router-dom";
import logo from "/logo-main.png";

const columns = [
  {
    title: "Explore",
    links: [
      { to: "/books", label: "All books" },
      { to: "/about", label: "Our story" },
    ],
  },
  {
    title: "Your account",
    links: [
      { to: "/library", label: "My library" },
      { to: "/orders", label: "My orders" },
    ],
  },
];

const Footer = () => (
  <footer className="mt-0 border-t border-line bg-white">
    <div className="kb-container py-12 md:py-14">
      <div className="grid gap-10 text-left md:grid-cols-[1.5fr_1fr_1fr]">
        <div className="max-w-sm">
          <Link
            to="/"
            className="inline-flex items-center gap-1"
            aria-label="Book Jungle home"
          >
            <img src={logo} alt="" className="h-11 w-auto" />
            <img
              src="/logo-text.png"
              alt="Book Jungle"
              className="h-11 w-auto"
            />
          </Link>
          <p className="mt-4 leading-relaxed text-ink-soft">
            A children&apos;s digital library of gentle stories and early
            learning reads, made for curious young readers and the grown-ups who
            read with them.
          </p>
        </div>

        {columns.map((col) => (
          <nav key={col.title} aria-label={col.title}>
            <h2 className="mb-4 font-body text-xs font-extrabold tracking-[0.12em] text-muted uppercase">
              {col.title}
            </h2>
            <ul className="space-y-1">
              {col.links.map((link) => (
                <li key={link.to}>
                  <Link
                    to={link.to}
                    className="inline-flex min-h-10 items-center font-bold text-ink-soft transition-colors hover:text-brand-dark"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        ))}
      </div>

      <div className="mt-10 border-t border-line pt-6 text-left text-sm text-muted">
        © {new Date().getFullYear()} Book Jungle. All rights reserved.
      </div>
    </div>
  </footer>
);

export default Footer;
