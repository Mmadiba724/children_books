import baby from "../assets/baby_reading.png";
import displaybook from "../assets/15frt.jpg";
import { Info, Star } from "lucide-react";
import SearchBar from "./SearchBar";
import { books, type Book } from "../data/books";
import { Link } from "react-router-dom";

function scrollToCatalog() {
    const el = document.getElementById("catalog-grid");
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
}

type HeroProps = {
    onSearch?: (q: string) => void;
    query?: string;
    searchResults?: Book[];
};

const Hero = ({ onSearch, query, searchResults }: HeroProps) => {
    const featured = books.slice(0, 3);
    const displayed =
        query && searchResults ? searchResults.slice(0, 3) : featured;
    const heading = query ? `Results for "${query}"` : "Featured picks";

    return (
        <section className="relative overflow-hidden rounded-3xl p-8 md:p-12 bg-linear-to-r from-rose-50 via-white to-cyan-50">
            {/* Decorative background blobs */}
            <div className="pointer-events-none absolute -left-20 -top-16 w-64 h-64 bg-rose-100 rounded-full opacity-60 blur-3xl transform rotate-12" />
            <div className="pointer-events-none absolute -right-24 -bottom-12 w-80 h-80 bg-cyan-50 rounded-full opacity-60 blur-3xl transform -rotate-6" />

            <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
                <div className="px-4">
                    <div className="inline-flex items-center gap-3 bg-rose-50 text-rose-600 rounded-full px-3 py-1 text-sm font-semibold mb-4">
                        <Star className="w-4 h-4 text-yellow-400" /> {heading}
                    </div>

                    <h1 className="text-4xl md:text-6xl font-extrabold text-rose-600 leading-tight">
                        Stories that Spark Imaginations
                    </h1>

                    <p className="mt-4 text-gray-700 text-lg max-w-xl">
                        Bright, gentle tales for early readers — friendly
                        characters, playful learning, and bedtime magic. Curated
                        picks and seasonal collections to make storytime
                        special.
                    </p>

                    <div className="mt-6 flex flex-wrap gap-3 items-center">
                        <button
                            onClick={scrollToCatalog}
                            aria-label="Browse books"
                            className="bg-linear-to-r from-indigo-500 to-cyan-500 text-white px-6 py-3 rounded-full shadow-md hover:scale-[1.02] transition-transform"
                        >
                            Browse Books
                        </button>

                        <Link
                            to="/about"
                            className="inline-flex items-center border border-rose-200 px-4 py-3 rounded-full text-rose-600 hover:bg-rose-50"
                        >
                            Learn More <Info className="ml-2" />
                        </Link>

                        <Link
                            to="/cart"
                            className="ml-2 inline-flex items-center text-sm text-gray-600 hover:text-rose-600"
                        >
                            View Cart
                        </Link>
                    </div>

                    <div className="mt-6">
                        <SearchBar onSearch={onSearch} />
                    </div>

                    <div className="mt-6">
                        <h4 className="text-sm font-semibold text-gray-600 mb-3">
                            {query ? `Search results` : "Featured picks"}
                        </h4>
                        <div className="flex gap-3">
                            {displayed.length === 0 ? (
                                <div className="text-sm text-gray-500">
                                    No results found.
                                </div>
                            ) : (
                                displayed.map((b) => (
                                    <Link
                                        key={b.id}
                                        to={`/book/${b.id}`}
                                        className="flex items-center gap-3 bg-white rounded-xl p-2 shadow-sm hover:shadow-md"
                                    >
                                        <img
                                            src={b.coverUrl}
                                            alt={b.title}
                                            className="w-14 h-20 object-cover rounded-md"
                                        />
                                        <div className="text-sm">
                                            <div className="font-semibold text-rose-600">
                                                {b.title}
                                            </div>
                                            <div className="text-gray-500 text-xs">
                                                by {b.author}
                                            </div>
                                        </div>
                                    </Link>
                                ))
                            )}
                        </div>
                    </div>
                </div>

                <div className="relative flex justify-center items-center">
                    <div className="relative w-full max-w-md">
                        <img
                            src={baby}
                            alt="child reading"
                            className="w-full rounded-2xl shadow-2xl"
                        />

                        <img
                            src={displaybook}
                            alt="featured book"
                            className="absolute -right-8 -bottom-8 w-48 md:w-64 rounded-lg shadow-xl transform rotate-6"
                        />

                        {/* floating small covers */}
                        <div className="absolute left-6 top-6 grid grid-cols-1 gap-3">
                            {books.slice(3, 6).map((b) => (
                                <img
                                    key={b.id}
                                    src={b.coverUrl}
                                    alt={b.title}
                                    className="w-20 h-28 object-cover rounded-md shadow"
                                />
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Hero;
