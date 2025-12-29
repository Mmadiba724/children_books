import type { Book } from "../data/books";

export default function BookPreview({ book }: { book: Book }) {
    return (
        <aside className="p-4 bg-gradient-to-r from-white to-rose-50 rounded-2xl shadow-inner border border-rose-100">
            <h4 className="text-lg font-bold mb-2 text-rose-600">
                Peek a Page
            </h4>
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
