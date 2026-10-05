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
                aria-controls="review-form"
                onClick={() => {
                    const form = document.getElementById("review-form");
                    if (form) form.classList.toggle("hidden");
                }}
                className="kb-btn kb-btn-secondary w-full"
            >
                Write a customer review
            </button>

            <div
                id="review-form"
                className="hidden rounded-2xl bg-cream-deep/60 p-4"
            >
                <div className="space-y-3">
                    <div>
                        <label
                            htmlFor="review-name"
                            className="mb-1 block text-sm font-bold text-ink"
                        >
                            Your name
                        </label>
                        <input
                            id="review-name"
                            required
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Enter your name"
                            className="kb-input"
                        />
                    </div>

                    <div>
                        <label
                            htmlFor="review-rating"
                            className="mb-1 block text-sm font-bold text-ink"
                        >
                            Rating
                        </label>
                        <select
                            id="review-rating"
                            value={rating}
                            onChange={(e) => setRating(Number(e.target.value))}
                            className="kb-input"
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
                            className="mb-1 block text-sm font-bold text-ink"
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
                            className="kb-input"
                        />
                    </div>

                    <button
                        type="submit"
                        className="kb-btn kb-btn-primary w-full"
                    >
                        Post review
                    </button>

                    {success && (
                        <div role="status" className="text-sm font-bold text-success">
                            Thanks for your review!
                        </div>
                    )}
                </div>
            </div>
        </form>
    );
}
