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
    const featured = books.slice(0, 2);
    const displayed =
        query && searchResults ? searchResults.slice(0, 3) : featured;
    const heading = query ? `Results for "${query}"` : "Featured picks";

    return (
        <section className="relative overflow-hidden rounded-lg md:rounded-3xl p-4 sm:p-6 md:p-8 lg:p-12 bg-linear-to-r from-rose-50 via-white to-cyan-50">
            {/* Decorative background blobs */}
            <div className="pointer-events-none absolute -left-20 -top-16 w-48 h-48 md:w-64 md:h-64 bg-rose-100 rounded-full opacity-60 blur-3xl transform rotate-12" />
            <div className="pointer-events-none absolute -right-24 -bottom-12 w-60 h-60 md:w-80 md:h-80 bg-cyan-50 rounded-full opacity-60 blur-3xl transform -rotate-6" />

            <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8 lg:gap-12 items-center">
                <div className="px-2 sm:px-4 order-2 lg:order-1">
                    <div className="inline-flex items-center gap-2 bg-rose-50 text-rose-600 rounded-full px-3 py-1 text-xs sm:text-sm font-semibold mb-3 md:mb-4">
                        <Star className="w-3 h-3 sm:w-4 sm:h-4 text-yellow-400" />{" "}
                        {heading}
                    </div>

                    <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold text-rose-600 leading-tight">
                        Stories that Spark Imaginations
                    </h1>

                    <p className="mt-3 md:mt-4 text-gray-700 text-base md:text-lg max-w-xl">
                        Bright, gentle tales for early readers — friendly
                        characters, playful learning, and bedtime magic. Curated
                        picks and seasonal collections to make storytime
                        special.
                    </p>

                    <div className="mt-4 md:mt-6 flex flex-wrap gap-2 sm:gap-3 items-center justify-center ">
                        <button
                            onClick={scrollToCatalog}
                            aria-label="Browse books"
                            className="bg-linear-to-r from-indigo-500 to-cyan-500 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-full shadow-md hover:scale-[1.02] transition-transform text-sm sm:text-base"
                        >
                            Browse Books
                        </button>

                        <Link
                            to="/about"
                            className="inline-flex items-center border border-rose-200 px-3 sm:px-4 py-2 sm:py-3 rounded-full text-rose-600 hover:bg-rose-50 text-sm sm:text-base"
                        >
                            Learn More <Info className="ml-1 sm:ml-2 w-4 h-4" />
                        </Link>

                        
                    </div>

                    <div className="mt-6">
                        <SearchBar onSearch={onSearch} />
                    </div>

                    <div className="mt-4 md:mt-6  ">
                        <h4 className="text-xs sm:text-sm font-semibold text-gray-600 mb-2 md:mb-3 ">
                            {query ? `Search results` : "Featured picks"}
                        </h4>
                        <div className="flex gap-2 sm:gap-3 overflow-x-auto pb-2 scrollbar-hide">
                            {displayed.length === 0 ? (
                                <div className="text-sm text-gray-500">
                                    No results found.
                                </div>
                            ) : (
                                displayed.map((b) => (
                                    <Link
                                        key={b.id}
                                        to={`/book/${b.id}`}
                                        className="flex items-center gap-2 sm:gap-3 bg-white rounded-lg sm:rounded-xl p-2 shadow-sm hover:shadow-md shrink-0 min-w-[200px] sm:min-w-0"
                                    >
                                        <img
                                            src={b.coverUrl}
                                            alt={b.title}
                                            className="w-12 h-16 sm:w-14 sm:h-20 object-cover rounded-md"
                                        />
                                        <div className="text-xs sm:text-sm">
                                            <div className="font-semibold text-rose-600 line-clamp-2 w-32 wrap-break-words">
                                                {b.title}
                                            </div>
                                            <div className="text-gray-500 text-xs line-clamp-1">
                                                by {b.author}
                                            </div>
                                        </div>
                                    </Link>
                                ))
                            )}
                        </div>
                    </div>
                </div>

                <div className="relative flex justify-center items-center mt-8 lg:mt-0 order-1 lg:order-2">
                    <div className="relative w-full max-w-sm md:max-w-md">
                        <img
                            src={baby}
                            alt="child reading"
                            className="w-full rounded-xl md:rounded-2xl shadow-2x"
                        />

                        <img
                            src={displaybook}
                            alt="featured book"
                            className="absolute -right-3 sm:-right-8 -bottom-4 sm:-bottom-8 w-32 sm:w-48 md:w-64  rounded-lg shadow-xl transform rotate-6"
                        />

                        {/* floating small covers - hidden on mobile */}
                        <div className="hidden sm:grid absolute left-4 md:left-6 top-4 md:top-6 grid-cols-1 gap-2 md:gap-3">
                            {books.slice(3, 6).map((b) => (
                                <img
                                    key={b.id}
                                    src={b.coverUrl}
                                    alt={b.title}
                                    className="w-16 h-22 md:w-20 md:h-28 object-cover rounded-md shadow"
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
