import type { LocalBook } from "../data/books";

export default function BookPreview({ book }: { book: LocalBook }) {
  return (
    <aside className="p-4 bg-gradient-to-r from-white to-brand-light rounded-2xl shadow-inner border border-brand-light">
      <h4 className="text-lg font-bold mb-2 text-brand">Peek a Page</h4>
      <div className="space-y-3 text-left">
        {book.previewPages.map((p, i) => (
          <p
            key={i}
            className="text-sm leading-relaxed bg-white/60 p-2 rounded"
          >
            {p}
          </p>
        ))}
      </div>
    </aside>
  );
}
