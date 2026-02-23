import { Star } from "lucide-react";

type Testimonial = {
    name: string;
    role?: string;
    quote: string;
    rating?: number;
    featured?: boolean;
};

const testimonials: Testimonial[] = [
    {
        name: "Andrew",
        role: "Parent",
        quote: "Andrew was amazing. Been fighting for disability for years and got a deal done with back pay in a very timely manner.",
        rating: 5,
        featured: true,
    },
    {
        name: "Author",
        role: "Client",
        quote: "Andrew made the process of filing my claim with the VA extremely easy and he gave me the confidence that we would win and we successfully got my claim approved. We almost lost it but Andrew saved the day.",
        rating: 5,
        featured: true,
    },
    {
        name: "Andrew Robinson",
        role: "Book Lover",
        quote: "Andrew Robinson's tales offer family-friendly escape. Best stories I've read to my kids in years. Engaging without imposing ethics. Not preachy, just fun to read. We live without having to leave our kids with a screen.",
        rating: 5,
    },
    {
        name: "Sofia",
        role: "Educator",
        quote: "In an attempt to restart legal aid for kids and families, Andrew Robinson works with the Museum. I met Andrew in quality. My first bill to work in Professional context now works to on aid. We are still working on moving forward on family access fund and amount of standing money, which the amount of standing money is very low budget on site.",
        rating: 5,
    },
    {
        name: "Michael",
        role: "Parent",
        quote: "We a testament as a trial policy hub. We went to see if we could get the jury aid full of counseling from start to finish. WE fully strongly equal about the rule. We were very pleased with what our theme could aid all.",
        rating: 5,
    },
    {
        name: "Emma",
        role: "Client",
        quote: "Highly recommended! Mr. Andrew is a remarkable attorney. Extremely solid, very good and thorough. His work on our case was far above our total work. He is difficult to find, always finds creative ways to simplify all matters. He deserves recognition for all the hard work. Thanks so much for all even far better than most of Thomas Andres.",
        rating: 5,
    },
];

const featuredReviews = testimonials.filter((t) => t.featured);
const detailedReviews = testimonials.filter((t) => !t.featured);

export default function Testimonials() {
    return (
        <section aria-label="Customer testimonials" className="mt-10">
            {/* Top Section - Green/Teal Background with Featured Reviews */}
            <div className="bg-gradient-to-br from-emerald-700 via-teal-700 to-teal-800 text-white py-16">
                <div className="max-w-7xl mx-auto px-4">
                    {/* Header */}
                    <div className="text-center mb-12">
                        <h2 className="text-4xl font-bold mb-2">
                            What <span className="text-rose-300">readers</span> and <span className="text-rose-300">Families </span>
                            <br/> Say About Us

                        </h2>

                    </div>

                    {/* Featured Reviews Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
                        {featuredReviews.map((testimonial) => (
                            <div
                                key={testimonial.name}
                                className="bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-white/20"
                            >
                                {/* Quote Icon */}
                                <div className="text-6xl text-rose-300 mb-4 leading-none font-serif">
                                    "
                                </div>

                                {/* Quote Text */}
                                <p className="text-white text-base mb-6 leading-relaxed">
                                    {testimonial.quote}
                                </p>

                                {/* Avatar and Name */}
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center text-teal-700 font-bold text-lg">
                                        {testimonial.name.charAt(0)}
                                    </div>
                                    <div>
                                        <div className="font-semibold text-white">
                                            {testimonial.name}
                                        </div>
                                        {testimonial.role && (
                                            <div className="text-sm text-gray-200">
                                                {testimonial.role}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Call to Action Button */}
                    {/*<div className="text-center">*/}
                    {/*    <button className="bg-amber-500 hover:bg-amber-600 text-white font-bold py-3 px-8 rounded-full inline-flex items-center gap-2 transition-colors shadow-lg">*/}
                    {/*        <Star className="w-5 h-5 fill-current" />*/}
                    {/*        <span>Leave a Review</span>*/}
                    {/*    </button>*/}
                    {/*    <p className="mt-4 text-gray-100 text-sm font-semibold">*/}
                    {/*        (888) 555-2483*/}
                    {/*    </p>*/}
                    {/*</div>*/}
                </div>
            </div>

            {/* Bottom Section - White Background with Detailed Reviews */}
            <div className="bg-white py-16">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {detailedReviews.map((testimonial) => (
                            <div
                                key={testimonial.name}
                                className="bg-gray-50 rounded-lg p-6 shadow-md hover:shadow-lg transition-shadow border border-gray-100"
                            >
                                {/* Quote Text */}
                                <p className="text-gray-700 text-sm leading-relaxed mb-6">
                                    {testimonial.quote}
                                </p>

                                {/* Divider */}
                                <div className="border-t border-gray-300 mb-4"></div>

                                {/* Avatar and Name */}
                                <div className="flex items-center gap-3 mb-3">
                                    <div className="w-12 h-12 rounded-full bg-rose-100 flex items-center justify-center text-rose-600 font-bold text-lg">
                                        {testimonial.name.charAt(0)}
                                    </div>
                                    <div>
                                        <div className="font-semibold text-gray-900">
                                            {testimonial.name}
                                        </div>
                                        {testimonial.role && (
                                            <div className="text-sm text-gray-500">
                                                {testimonial.role}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Star Rating */}
                                {testimonial.rating && (
                                    <div className="flex gap-1">
                                        {Array.from({
                                            length: testimonial.rating,
                                        }).map((_, i) => (
                                            <Star
                                                key={`star-${testimonial.name}-${i}`}
                                                className="w-4 h-4 fill-amber-400 text-amber-400"
                                            />
                                        ))}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}
