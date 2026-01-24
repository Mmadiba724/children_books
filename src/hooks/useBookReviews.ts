import { useState } from "react";
import { type Review } from "../components/ReviewsList";

// Mock reviews data - can be replaced with API calls later
const INITIAL_REVIEWS: Record<string, Review[]> = {
    "bunny-adventure": [
        {
            name: "Ava",
            rating: 5,
            text: "My toddler loves the bunny—so gentle and fun!",
            date: new Date().toISOString(),
        },
        {
            name: "Noah",
            rating: 4,
            text: "Great pictures and rhythm; bedtime winner.",
            date: new Date().toISOString(),
        },
    ],
};

export function useBookReviews() {
    // Persisted reviews (localStorage). Merge saved reviews with built-in ones.
    const [reviewsMap, setReviewsMap] = useState<Record<string, Review[]>>(
        () => {
            let parsed: Record<string, Review[]> = {};
            try {
                parsed = JSON.parse(
                    localStorage.getItem("bookReviews") || "{}"
                );
            } catch (e) {
                console.warn("Failed to parse saved reviews", e);
                parsed = {};
            }
            const merged: Record<string, Review[]> = { ...INITIAL_REVIEWS };
            Object.keys(parsed).forEach((k) => {
                merged[k] = [...(merged[k] || []), ...parsed[k]];
            });
            return merged;
        }
    );

    const addReview = (bookId: string, review: Review) => {
        setReviewsMap((prev) => {
            const next = {
                ...prev,
                [bookId]: [
                    ...(prev[bookId] || []),
                    { ...review, date: new Date().toISOString() },
                ],
            };
            try {
                // Save only user-added reviews to localStorage to avoid duplicating built-ins
                const saved: Record<string, Review[]> = {};
                Object.keys(next).forEach((id) => {
                    // to preserve built-ins, save only items beyond the built-in count
                    const built = INITIAL_REVIEWS[id] || [];
                    if (next[id].length > built.length) {
                        saved[id] = next[id].slice(built.length);
                    }
                });
                localStorage.setItem("bookReviews", JSON.stringify(saved));
            } catch (e) {
                console.warn("Failed to save reviews", e);
            }
            return next;
        });
    };

    const getReviewsForBook = (bookId: string): Review[] => {
        return reviewsMap[bookId] || INITIAL_REVIEWS[bookId] || [];
    };

    return {
        addReview,
        getReviewsForBook,
    };
}
