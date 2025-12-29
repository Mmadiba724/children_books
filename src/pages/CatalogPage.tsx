import { useMemo, useState } from "react";
import { books } from "../data/books";
import BookCard from "../components/BookCard";
import Carousel from "../components/Carousel";
import Hero from "../components/Hero";
import Testimonials from "../components/Testimonials";

export default function CatalogPage() {
    const [query, setQuery] = useState("");

    const normalized = (s: string) => s.trim().toLowerCase();

    const filtered = useMemo(() => {
        if (!query) return books;
        const q = normalized(query);
        return books.filter((b) => {
            return (
                normalized(b.title).includes(q) ||
                normalized(b.author).includes(q) ||
                (b.categories || []).some((c) => normalized(c).includes(q))
            );
        });
    }, [query]);

    return (
        <div className="max-w-8xl mx-auto p-6">
            <Hero
                onSearch={(q) => setQuery(q)}
                query={query}
                searchResults={filtered}
            />

            <Testimonials />

            <main className="mt-10">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-2xl font-bold">All Books</h2>
                    {query && (
                        <div className="text-sm text-gray-600">
                            Found {filtered.length} matches
                            <button
                                onClick={() => setQuery("")}
                                className="ml-3 text-rose-600 underline"
                            >
                                Clear
                            </button>
                        </div>
                    )}
                </div>

                <div
                    id="catalog-grid"
                    className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6"
                >
                    {books.map((b) => (
                        <BookCard key={b.id} book={b} />
                    ))}
                </div>
            </main>

            <section className="mt-6">
                <Carousel />
            </section>
        </div>
    );
}
