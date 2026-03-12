import baby from "../assets/baby_reading.png";
import displaybook from "../assets/15frt.jpg";
import { Info, Star } from "lucide-react";
import { getImageUrl } from "../utils/imageUtils";
import type { Book } from "../types/book";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { slideInLeftVariants, slideInRightVariants } from "../utils/animations";

function scrollToCatalog() {
    const el = document.getElementById("catalog-grid");
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
}

type HeroProps = {
    query?: string;
    books?: Book[];
    onSearch: (newQuery: string) => void;
    searchResults: Book[];
};

const Hero = ({ query, books = [] }: HeroProps) => {
    const heading = query ? `Results for "${query}"` : "Featured picks";

    return (
        <section className="relative overflow-hidden  md:h-[600px]  md:rounded-3xl p-6 sm:p-8 md:p-10 lg:p-12 bg-linear-to-br from-rose-50 via-white to-pink-50  mt-8">
            {/* Decorative background blobs */}
            <div className="pointer-events-none absolute -left-20 -top-16 w-48 h-48 md:w-64 md:h-64 bg-rose-200  opacity-40 blur-3xl transform rotate-12" />
            <div className="pointer-events-none absolute -right-24 -bottom-12 w-60 h-60 md:w-80 md:h-80 bg-pink-100  opacity-40 blur-3xl transform -rotate-6" />

            <div className="relative max-w-7xl mx-auto h-full grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-10 lg:gap-12 items-center">
                <motion.div
                    initial="hidden"
                    animate="visible"
                    variants={slideInLeftVariants}
                    className="order-2 lg:order-1 z-10"
                >
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.2, duration: 0.5 }}
                        className="inline-flex items-center gap-2 bg-rose-100 text-rose-600 rounded-full px-4 py-2 text-sm font-semibold mb-6 shadow-sm"
                    >
                        <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                        {heading}
                    </motion.div>

                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3, duration: 0.6 }}
                        className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-gray-900 leading-tight mb-4"
                    >
                        Stories that Spark{" "}
                        <span className="text-rose-600">Imaginations</span>
                    </motion.h1>

                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4, duration: 0.6 }}
                        className="mt-4 text-gray-700 text-lg leading-relaxed max-w-xl"
                    >
                        Bright, gentle tales for early readers — friendly
                        characters, playful learning, and bedtime magic. Curated
                        picks and seasonal collections to make storytime
                        special.
                    </motion.p>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5, duration: 0.6 }}
                        className="mt-8 flex md:flex-wrap gap-4 w-full items-center"
                    >
                        <motion.button
                            onClick={scrollToCatalog}
                            aria-label="Browse books"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="bg-rose-600 hover:bg-rose-700 text-white font-semibold px-8 py-3.5 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 text-base"
                        >
                            Browse Books
                        </motion.button>

                        <Link to="/about">
                            <motion.div
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                className="inline-flex items-center gap-2 bg-white border-2 border-rose-200 px-7 py-3.5 rounded-full text-rose-600 font-semibold hover:bg-rose-50 hover:border-rose-300 transition-all duration-200 text-base shadow-md"
                            >
                                Learn More
                                <Info className="w-4 h-4" />
                            </motion.div>
                        </Link>
                    </motion.div>
                </motion.div>

                <motion.div
                    initial="hidden"
                    animate="visible"
                    variants={slideInRightVariants}
                    className="relative md:flex justify-center items-center order-1 hidden lg:order-2 z-10"
                >
                    <div className="relative w-full max-w-sm md:max-w-md">
                        <motion.img
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.3, duration: 0.6 }}
                            src={baby}
                            alt="child reading"
                            className="w-full rounded-2xl shadow-2x border-4 border-white"
                        />

                        <motion.img
                            initial={{ opacity: 0, rotate: 0, scale: 0.8 }}
                            animate={{ opacity: 1, rotate: 6, scale: 1 }}
                            transition={{ delay: 0.5, duration: 0.6 }}
                            whileHover={{ scale: 1.05, rotate: 3 }}
                            src={displaybook}
                            alt="featured book"
                            className="absolute -right-14 sm:-right-18 -bottom-6 sm:-bottom-8 w-32 sm:w-48 md:w-64 rounded-lg shadow-2xl border-4 border-white"
                        />

                        {/* floating small covers - hidden on mobile */}
                        <div className="hidden sm:grid absolute right-4 md:right-6 top-4 md:top-6 grid-cols-1 gap-3">
                            {books.slice(3, 6).map((b, index) => (
                                <motion.img
                                    key={b.id}
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{
                                        delay: 0.6 + index * 0.1,
                                        duration: 0.5,
                                    }}
                                    whileHover={{ scale: 1.1, zIndex: 10 }}
                                    src={getImageUrl(b.coverImageUrl)}
                                    alt={b.title}
                                    className="w-16 h-22 md:w-20 md:h-28 object-cover rounded-md shadow-lg border-2 border-white"
                                />
                            ))}
                        </div>
                    </div>
                </motion.div>
            </div>
        </section>
    );
};

export default Hero;
