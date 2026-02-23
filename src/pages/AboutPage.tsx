import { BookOpen, Heart, Users, Award, Sparkles, Shield } from "lucide-react";

export default function AboutPage() {
    return (
        <div className="min-h-screen bg-gradient-to-b from-rose-50 to-white">
            {/* Hero Section */}
            <div className="bg-gradient-to-r from-rose-600 to-pink-600 text-white py-16">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center">
                        <h1 className="text-4xl md:text-5xl font-extrabold mb-4">
                            About KidsBooks
                        </h1>
                        <p className="text-xl md:text-2xl text-rose-100 max-w-3xl mx-auto">
                            A playful collection of stories, designed for early
                            readers and bedtime magic.
                        </p>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                {/* Navigation Sidebar & Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                    {/* Sidebar Navigation */}
                    <aside className="lg:col-span-1">
                        <div className="bg-white rounded-lg shadow-md p-6 sticky top-24">
                            <h3 className="text-lg font-bold text-gray-900 mb-4">
                                About
                            </h3>
                            <nav className="space-y-2">
                                <a
                                    href="#our-story"
                                    className="block text-rose-600 hover:text-rose-700 font-medium py-2 px-3 rounded hover:bg-rose-50 transition-colors"
                                >
                                    Our Story
                                </a>
                                <a
                                    href="#mission"
                                    className="block text-gray-700 hover:text-rose-600 py-2 px-3 rounded hover:bg-rose-50 transition-colors"
                                >
                                    Our Mission
                                </a>
                                <a
                                    href="#values"
                                    className="block text-gray-700 hover:text-rose-600 py-2 px-3 rounded hover:bg-rose-50 transition-colors"
                                >
                                    Our Values
                                </a>
                                <a
                                    href="#team"
                                    className="block text-gray-700 hover:text-rose-600 py-2 px-3 rounded hover:bg-rose-50 transition-colors"
                                >
                                    Our Team
                                </a>
                                <a
                                    href="#impact"
                                    className="block text-gray-700 hover:text-rose-600 py-2 px-3 rounded hover:bg-rose-50 transition-colors"
                                >
                                    Our Impact
                                </a>
                            </nav>
                        </div>
                    </aside>

                    {/* Main Content Area */}
                    <main className="lg:col-span-3">
                        {/* Our Story Section */}
                        <section id="our-story" className="mb-12">
                            <div className="bg-white rounded-lg shadow-md p-8">
                                <h2 className="text-3xl font-bold text-gray-900 mb-6">
                                    Our Story
                                </h2>
                                <div className="prose max-w-none text-gray-700">
                                    <p className="text-lg leading-relaxed mb-4">
                                        KidsBooks began with a simple mission: to
                                        create enchanting stories that spark young
                                        imaginations and foster a lifelong love of
                                        reading. Founded by parents and educators who
                                        believe in the power of storytelling, we've
                                        grown into a trusted source for quality
                                        children's literature.
                                    </p>
                                    <p className="text-lg leading-relaxed mb-4">
                                        Our collection features carefully curated tales
                                        that blend entertainment with gentle learning,
                                        perfect for bedtime, classroom reading, or
                                        anytime adventures. Each book is crafted with
                                        colorful illustrations, engaging characters, and
                                        age-appropriate themes that resonate with young
                                        readers.
                                    </p>
                                    <p className="text-lg leading-relaxed">
                                        We partner with talented authors and
                                        illustrators who share our vision of making
                                        reading a joyful experience. From picture books
                                        to early readers, our diverse catalog ensures
                                        there's something special for every child.
                                    </p>
                                </div>
                            </div>
                        </section>

                        {/* Mission Section */}
                        <section id="mission" className="mb-12">
                            <div className="bg-gradient-to-br from-rose-50 to-pink-50 rounded-lg shadow-md p-8 border-2 border-rose-200">
                                <div className="flex items-start gap-4 mb-4">
                                    <div className="bg-rose-600 rounded-full p-3">
                                        <BookOpen className="w-6 h-6 text-white" />
                                    </div>
                                    <div>
                                        <h2 className="text-3xl font-bold text-gray-900 mb-2">
                                            Our Mission
                                        </h2>
                                        <p className="text-xl text-rose-700 font-semibold">
                                            Inspiring Young Minds Through Stories
                                        </p>
                                    </div>
                                </div>
                                <p className="text-lg text-gray-700 leading-relaxed">
                                    We believe every child deserves access to quality
                                    literature that entertains, educates, and
                                    inspires. Our mission is to make reading
                                    accessible, enjoyable, and meaningful for families
                                    everywhere. We strive to create books that parents
                                    love to read and children never want to put down.
                                </p>
                            </div>
                        </section>

                        {/* Values Section */}
                        <section id="values" className="mb-12">
                            <div className="bg-white rounded-lg shadow-md p-8">
                                <h2 className="text-3xl font-bold text-gray-900 mb-8">
                                    Our Values
                                </h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="flex gap-4">
                                        <div className="bg-rose-100 rounded-lg p-3 h-fit">
                                            <Heart className="w-6 h-6 text-rose-600" />
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-bold text-gray-900 mb-2">
                                                Quality First
                                            </h3>
                                            <p className="text-gray-700">
                                                Every book is carefully reviewed to
                                                ensure age-appropriate content,
                                                engaging narratives, and beautiful
                                                illustrations.
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex gap-4">
                                        <div className="bg-pink-100 rounded-lg p-3 h-fit">
                                            <Sparkles className="w-6 h-6 text-pink-600" />
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-bold text-gray-900 mb-2">
                                                Imagination & Creativity
                                            </h3>
                                            <p className="text-gray-700">
                                                We celebrate creativity and
                                                imagination, encouraging children to
                                                explore new worlds through reading.
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex gap-4">
                                        <div className="bg-amber-100 rounded-lg p-3 h-fit">
                                            <Users className="w-6 h-6 text-amber-600" />
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-bold text-gray-900 mb-2">
                                                Inclusivity
                                            </h3>
                                            <p className="text-gray-700">
                                                Our diverse collection represents
                                                different cultures, backgrounds, and
                                                experiences to reflect the world
                                                around us.
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex gap-4">
                                        <div className="bg-emerald-100 rounded-lg p-3 h-fit">
                                            <Shield className="w-6 h-6 text-emerald-600" />
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-bold text-gray-900 mb-2">
                                                Safety & Trust
                                            </h3>
                                            <p className="text-gray-700">
                                                Parents can trust that every book in
                                                our collection is safe, appropriate,
                                                and enriching for young readers.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </section>

                        {/* Team Section */}
                        <section id="team" className="mb-12">
                            <div className="bg-white rounded-lg shadow-md p-8">
                                <h2 className="text-3xl font-bold text-gray-900 mb-6">
                                    Our Team
                                </h2>
                                <p className="text-lg text-gray-700 leading-relaxed mb-6">
                                    KidsBooks is powered by a passionate team of
                                    parents, educators, writers, and book lovers. Our
                                    diverse team brings decades of combined experience
                                    in children's literature, education, and
                                    publishing. We work closely with authors,
                                    illustrators, and child development experts to
                                    ensure every book meets our high standards.
                                </p>
                                <div className="bg-rose-50 rounded-lg p-6 border-l-4 border-rose-600">
                                    <p className="text-gray-700 italic">
                                        "We're not just selling books—we're nurturing
                                        the next generation of readers, thinkers, and
                                        dreamers. Every story we share is an
                                        investment in a child's future."
                                    </p>
                                    <p className="text-rose-600 font-semibold mt-2">
                                        — The KidsBooks Team
                                    </p>
                                </div>
                            </div>
                        </section>

                        {/* Impact Section */}
                        <section id="impact" className="mb-12">
                            <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-lg shadow-md p-8 border-2 border-emerald-200">
                                <div className="flex items-start gap-4 mb-6">
                                    <div className="bg-emerald-600 rounded-full p-3">
                                        <Award className="w-6 h-6 text-white" />
                                    </div>
                                    <h2 className="text-3xl font-bold text-gray-900">
                                        Our Impact
                                    </h2>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                                    <div className="text-center">
                                        <div className="text-4xl font-extrabold text-emerald-600 mb-2">
                                            10K+
                                        </div>
                                        <div className="text-gray-700 font-medium">
                                            Happy Families
                                        </div>
                                    </div>
                                    <div className="text-center">
                                        <div className="text-4xl font-extrabold text-emerald-600 mb-2">
                                            500+
                                        </div>
                                        <div className="text-gray-700 font-medium">
                                            Books in Collection
                                        </div>
                                    </div>
                                    <div className="text-center">
                                        <div className="text-4xl font-extrabold text-emerald-600 mb-2">
                                            4.8★
                                        </div>
                                        <div className="text-gray-700 font-medium">
                                            Average Rating
                                        </div>
                                    </div>
                                </div>
                                <p className="text-lg text-gray-700 leading-relaxed">
                                    Through partnerships with schools and libraries,
                                    we've helped bring quality literature to thousands
                                    of children. Our commitment to literacy extends
                                    beyond sales—we regularly donate books to
                                    underprivileged communities and support reading
                                    programs nationwide.
                                </p>
                            </div>
                        </section>

                        {/* Call to Action */}
                        <section className="bg-gradient-to-r from-rose-600 to-pink-600 rounded-lg shadow-xl p-8 text-white text-center">
                            <h2 className="text-3xl font-bold mb-4">
                                Join Our Reading Community
                            </h2>
                            <p className="text-xl text-rose-100 mb-6 max-w-2xl mx-auto">
                                Discover stories that will inspire, educate, and
                                delight young readers in your family.
                            </p>
                            <button
                                onClick={() =>
                                    document
                                        .getElementById("catalog-grid")
                                        ?.scrollIntoView({ behavior: "smooth" })
                                }
                                className="bg-white text-rose-600 font-bold px-8 py-3.5 rounded-full shadow-lg hover:bg-rose-50 transition-all duration-200 text-lg"
                            >
                                Browse Our Collection
                            </button>
                        </section>
                    </main>
                </div>
            </div>
        </div>
    );
}
