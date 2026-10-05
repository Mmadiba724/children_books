import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { Book } from "../types/book";
import BookCard from "./BookCard";

type BookRailProps = {
  readonly books: readonly Book[];
  readonly label: string;
};

/** Horizontally scrolling shelf with snap points and prev/next controls. */
export default function BookRail({ books, label }: BookRailProps) {
  const trackRef = useRef<HTMLUListElement>(null);
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(false);

  const update = useCallback(() => {
    const el = trackRef.current;
    if (!el) return;
    setCanPrev(el.scrollLeft > 4);
    setCanNext(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
  }, []);

  useEffect(() => {
    update();
    const el = trackRef.current;
    if (!el) return;
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, [update, books.length]);

  const scrollByPage = (dir: 1 | -1) => {
    const el = trackRef.current;
    if (!el) return;
    el.scrollBy({ left: dir * el.clientWidth * 0.85, behavior: "smooth" });
  };

  const arrow =
    "absolute top-1/3 z-10 hidden h-11 w-11 items-center justify-center rounded-full border border-line bg-white text-ink shadow-(--shadow-soft) transition hover:border-brand hover:text-brand disabled:pointer-events-none disabled:opacity-0 md:flex";

  return (
    <div className="relative" role="region" aria-label={label}>
      <button
        type="button"
        aria-label={`Scroll ${label} left`}
        disabled={!canPrev}
        onClick={() => scrollByPage(-1)}
        className={`${arrow} -left-5`}
      >
        <ChevronLeft className="h-5 w-5" aria-hidden="true" />
      </button>

      <ul
        ref={trackRef}
        onScroll={update}
        className="hide-scrollbar -mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-smooth px-4 pt-2 pb-6 sm:-mx-6 sm:gap-6 sm:px-6 lg:mx-0 lg:px-1"
      >
        {books.map((book) => (
          <li
            key={book.id}
            className="w-[44%] shrink-0 snap-start sm:w-[30%] lg:w-[calc(25%-1.125rem)]"
          >
            <BookCard book={book} />
          </li>
        ))}
      </ul>

      <button
        type="button"
        aria-label={`Scroll ${label} right`}
        disabled={!canNext}
        onClick={() => scrollByPage(1)}
        className={`${arrow} -right-5`}
      >
        <ChevronRight className="h-5 w-5" aria-hidden="true" />
      </button>
    </div>
  );
}
