import { useState } from "react";
import { type Review } from "./ReviewsList";

type AddReviewFormProps = {
    onAdd: (r: Review) => void;
};

export default function AddReviewForm({ onAdd }: Readonly<AddReviewFormProps>) {
    const [name, setName] = useState("");
    const [rating, setRating] = useState(5);
    const [text, setText] = useState("");
    const [success, setSuccess] = useState(false);

    function submit(e: React.FormEvent) {
        e.preventDefault();
        if (!name.trim() || !text.trim()) return;
        onAdd({
            name: name.trim(),
            rating,
            text: text.trim(),
            date: new Date().toISOString(),
        });
        setName("");
        setRating(5);
        setText("");
        setSuccess(true);
        setTimeout(() => setSuccess(false), 2500);
    }

    return (
        <form onSubmit={submit} className="space-y-3">
            <button
                type="button"
                onClick={() => {
                    const form = document.getElementById("review-form");
                    if (form) form.classList.toggle("hidden");
                }}
                className="w-full bg-white hover:bg-gray-50 border border-gray-300 text-gray-900 font-normal py-2 px-4 rounded text-sm transition-colors"
            >
                Write a customer review
            </button>

            <div
                id="review-form"
                className="hidden bg-gray-50 border border-gray-300 rounded p-4"
            >
                <div className="space-y-3">
                    <div>
                        <label
                            htmlFor="review-name"
                            className="block text-sm font-medium text-gray-700 mb-1"
                        >
                            Your name
                        </label>
                        <input
                            id="review-name"
                            required
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Enter your name"
                            className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    <div>
                        <label
                            htmlFor="review-rating"
                            className="block text-sm font-medium text-gray-700 mb-1"
                        >
                            Rating
                        </label>
                        <select
                            id="review-rating"
                            value={rating}
                            onChange={(e) => setRating(Number(e.target.value))}
                            className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            {[5, 4, 3, 2, 1].map((r) => (
                                <option key={r} value={r}>
                                    {r} stars
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label
                            htmlFor="review-text"
                            className="block text-sm font-medium text-gray-700 mb-1"
                        >
                            Your review
                        </label>
                        <textarea
                            id="review-text"
                            required
                            value={text}
                            onChange={(e) => setText(e.target.value)}
                            placeholder="What did you like or dislike? What did you use this product for?"
                            rows={4}
                            className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    <button
                        type="submit"
                        className="bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-medium py-2 px-6 rounded text-sm transition-colors"
                    >
                        Submit
                    </button>

                    {success && (
                        <div className="text-sm text-green-600 font-medium">
                            Thanks for your review!
                        </div>
                    )}
                </div>
            </div>
        </form>
    );
}
