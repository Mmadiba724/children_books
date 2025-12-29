import { Star } from "lucide-react";

type Testimonial = {
    name: string;
    role?: string;
    quote: string;
    rating?: number;
};

const testimonials: Testimonial[] = [
    {
        name: "Ava",
        role: "Parent",
        quote: "My little one asks for 'bunny' every night — sweet, short and perfect for bedtime!",
        rating: 5,
    },
    {
        name: "Ethan",
        role: "Teacher",
        quote: "We used 'The Little Chef Club' in class and the kids loved the counting and cooking games.",
        rating: 4,
    },
    {
        name: "Sofia",
        role: "Grandparent",
        quote: "Lovely illustrations and gentle text — a new favorite on our reading shelf.",
        rating: 5,
    },
];

export default function Testimonials() {
    return (
        <section aria-label="Customer testimonials" className="mt-10">
            <div className="max-w-7xl mx-auto px-4 py-8">
                <h2 className="text-2xl font-bold text-rose-600 mb-4">
                    What readers and families say
                </h2>
                <p className="text-sm text-gray-600 mb-6">
                    Trusted by families and teachers — short, gentle stories
                    children love.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {testimonials.map((t) => (
                        <blockquote
                            key={t.name}
                            className="bg-white rounded-lg p-4 shadow-sm"
                        >
                            <div className="flex items-start gap-3">
                                <div className="shrink-0">
                                    <div className="h-12 w-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center font-semibold">
                                        {t.name.charAt(0)}
                                    </div>
                                </div>
                                <div>
                                    <div className="flex items-center gap-2">
                                        <div className="font-semibold">
                                            {t.name}
                                        </div>
                                        {t.role && (
                                            <div className="text-xs text-gray-500">
                                                {t.role}
                                            </div>
                                        )}
                                    </div>
                                    <p className="mt-2 text-sm text-gray-700">
                                        "{t.quote}"
                                    </p>
                                    <div className="mt-3 text-yellow-400">
                                        {Array.from({
                                            length: t.rating ?? 0,
                                        }).map((_, i) => (
                                            <Star
                                                key={`star-${t.name}-${i}`}
                                                className="w-4 h-4 inline"
                                            />
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </blockquote>
                    ))}
                </div>
            </div>
        </section>
    );
}
