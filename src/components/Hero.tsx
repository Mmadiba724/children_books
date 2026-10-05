import { Link } from "react-router-dom";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight, BookOpenCheck, Sparkles, Tablet } from "lucide-react";
import baby from "../assets/baby_reading.png";
import fallbackCover from "../assets/15frt.jpg";
import { getImageUrl } from "../utils/imageUtils";
import type { Book } from "../types/book";

type HeroProps = {
  readonly books?: readonly Book[];
};

const perks = [
  { icon: Tablet, label: "Digital & print editions" },
  { icon: BookOpenCheck, label: "Read in your own library" },
  { icon: Sparkles, label: "Made for early readers" },
];

export default function Hero({ books = [] }: HeroProps) {
  const reduce = useReducedMotion();
  const covers = books.filter((b) => b.coverImageUrl).slice(0, 2);
  const rise = (delay: number) =>
    reduce
      ? {}
      : {
          initial: { opacity: 0, y: 16 },
          animate: { opacity: 1, y: 0 },
          transition: { delay, duration: 0.5, ease: "easeOut" as const },
        };

  return (
    <section
      aria-labelledby="hero-title"
      className="kb-paper relative overflow-hidden border-b border-line"
    >
      <div className="kb-container grid items-center gap-8 py-10 sm:py-14 lg:grid-cols-[1.05fr_0.95fr] lg:gap-12 lg:py-20">
        <div className="text-left">
          <motion.p
            {...rise(0)}
            className="kb-badge mb-5 border border-sun/60 bg-sun-light px-3.5 py-1 text-sm text-ink"
          >
            <Sparkles className="h-4 w-4 text-warning" aria-hidden="true" />
            Children&apos;s digital library
          </motion.p>

          <motion.h1
            {...rise(0.08)}
            id="hero-title"
            className="font-display text-[2.5rem] leading-[1.05] font-extrabold tracking-tight text-ink sm:text-6xl lg:text-[4.25rem]"
          >
            Stories that spark{" "}
            <span className="relative whitespace-nowrap text-brand">
              little imaginations
              <svg
                aria-hidden="true"
                viewBox="0 0 300 12"
                preserveAspectRatio="none"
                className="absolute -bottom-1.5 left-0 h-2.5 w-full text-sun"
              >
                <path
                  d="M2 8 C 60 2, 120 12, 180 5 S 270 3, 298 7"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="4"
                  strokeLinecap="round"
                />
              </svg>
            </span>
          </motion.h1>

          <motion.p
            {...rise(0.16)}
            className="mt-6 max-w-xl text-lg leading-relaxed text-ink-soft sm:text-xl"
          >
            Gentle tales, playful learning and bedtime magic, picked for early
            readers and trusted by the grown-ups reading beside them.
          </motion.p>

          <motion.div
            {...rise(0.24)}
            className="mt-8 flex flex-col gap-3 sm:flex-row"
          >
            <Link
              to="/books"
              className="kb-btn kb-btn-primary px-8 py-3.5 text-base"
            >
              Browse all books
              <ArrowRight className="h-5 w-5" aria-hidden="true" />
            </Link>
            <Link
              to="/about"
              className="kb-btn kb-btn-secondary px-8 py-3.5 text-base"
            >
              Our story
            </Link>
          </motion.div>

          <motion.ul
            {...rise(0.32)}
            className="mt-8 flex flex-wrap gap-x-6 gap-y-3 text-sm font-bold text-ink-soft"
          >
            {perks.map(({ icon: Icon, label }) => (
              <li key={label} className="flex items-center gap-2">
                <Icon className="h-5 w-5 text-accent" aria-hidden="true" />
                {label}
              </li>
            ))}
          </motion.ul>
        </div>

        {/* Illustration: reader + real covers from the catalogue */}
        <motion.div
          {...rise(0.15)}
          className="relative mx-auto w-full max-w-md lg:max-w-none"
        >
          <div className="absolute inset-x-6 top-6 bottom-0 rounded-[3rem] bg-sun-light" />
          <div className="absolute top-0 -right-2 h-24 w-24 rounded-full bg-brand-light sm:h-32 sm:w-32" />
          <div className="absolute bottom-10 -left-2 h-16 w-16 rounded-full bg-accent-light sm:h-20 sm:w-20" />
          <img
            src={baby}
            alt="A toddler sitting and reading a colourful picture book"
            className="relative z-10 mx-auto w-4/5 max-w-sm drop-shadow-xl"
            width={600}
            height={600}
          />
          <img
            src={
              covers[0] ? getImageUrl(covers[0].coverImageUrl) : fallbackCover
            }
            alt={
              covers[0]
                ? `Cover of ${covers[0].title}`
                : "Featured picture book cover"
            }
            className="absolute right-0 bottom-2 z-20 w-[34%] -rotate-6 rounded-r-lg rounded-l-sm border-4 border-white shadow-(--shadow-book) sm:bottom-4"
          />
          {covers[1] && (
            <img
              src={getImageUrl(covers[1].coverImageUrl)}
              alt={`Cover of ${covers[1].title}`}
              className="absolute top-8 left-0 z-20 hidden w-[24%] rotate-6 rounded-r-lg rounded-l-sm border-4 border-white shadow-(--shadow-book) sm:block"
            />
          )}
        </motion.div>
      </div>
    </section>
  );
}
