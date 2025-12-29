import { useEffect, useState } from "react";

type Props = {
    initialQuery?: string;
    onSearch?: (query: string) => void;
};

const SearchBar = ({ initialQuery = "", onSearch }: Props) => {
    const [q, setQ] = useState(initialQuery);

    useEffect(() => {
        onSearch?.(q);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [q]);

    return (
        <div className=" mx-auto rounded-lg w-full sm:w-3/4 py-4 bg-white shadow-md">
            <form
                onSubmit={(e) => {
                    e.preventDefault();
                    onSearch?.(q);
                }}
                className="relative mx-auto w-full max-w-3xl px-4"
            >
                <label htmlFor="hero-search" className="sr-only">
                    Search books, authors, and genres
                </label>
                <svg
                    className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                >
                    <g
                        strokeLinejoin="round"
                        strokeLinecap="round"
                        strokeWidth="2.5"
                        fill="none"
                        stroke="currentColor"
                    >
                        <circle cx="11" cy="11" r="8"></circle>
                        <path d="m21 21-4.3-4.3"></path>
                    </g>
                </svg>
                <input
                    id="hero-search"
                    type="search"
                    value={q}
                    onChange={(e) => setQ(e.target.value)}
                    placeholder="Search books, authors, and genres"
                    className="input input-bordered w-full pl-12 pr-28"
                />
                <button
                    type="submit"
                    className="btn btn-primary absolute right-2 top-1/2 -translate-y-1/2 py-2 px-4"
                    aria-label="Search"
                >
                    Search
                </button>
            </form>
        </div>
    );
};

export default SearchBar;
