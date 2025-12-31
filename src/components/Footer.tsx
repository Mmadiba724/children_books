import { Link } from "react-router-dom";
import { Mail } from "lucide-react";

// Facebook icon SVG from simpleicons.org (https://simpleicons.org/icons/facebook.svg)
const FacebookIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg
        {...props}
        viewBox="0 0 24 24"
        fill="currentColor"
        aria-hidden="true"
        width="1em"
        height="1em"
    >
        <path d="M24 12.073C24 5.405 18.627 0 12 0S0 5.405 0 12.073c0 6.019 4.388 10.995 10.125 11.854v-8.385H7.078v-3.47h3.047V9.413c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953h-1.513c-1.491 0-1.953.926-1.953 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.068 24 18.092 24 12.073z" />
    </svg>
);

// Instagram icon SVG from simpleicons.org (https://simpleicons.org/icons/instagram.svg)
const InstagramIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg
        {...props}
        viewBox="0 0 24 24"
        fill="currentColor"
        aria-hidden="true"
        width="1em"
        height="1em"
    >
        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 1.366.062 2.633.334 3.608 1.308.974.974 1.246 2.241 1.308 3.608.058 1.266.069 1.646.069 4.85s-.012 3.584-.07 4.85c-.062 1.366-.334 2.633-1.308 3.608-.974.974-2.241 1.246-3.608 1.308-1.266.058-1.646.069-4.85.069s-3.584-.012-4.85-.07c-1.366-.062-2.633-.334-3.608-1.308-.974-.974-1.246-2.241-1.308-3.608C2.175 15.647 2.163 15.267 2.163 12s.012-3.584.07-4.85c.062-1.366.334-2.633 1.308-3.608C4.515 2.497 5.782 2.225 7.148 2.163 8.414 2.105 8.794 2.094 12 2.094zm0-2.163C8.741 0 8.332.013 7.052.072 5.77.13 4.665.388 3.678 1.375 2.691 2.362 2.433 3.467 2.375 4.749 2.316 6.029 2.304 6.438 2.304 12c0 5.562.012 5.971.071 7.251.058 1.282.316 2.387 1.303 3.374.987.987 2.092 1.245 3.374 1.303 1.28.059 1.689.071 7.251.071s5.971-.012 7.251-.071c1.282-.058 2.387-.316 3.374-1.303.987-.987 1.245-2.092 1.303-3.374.059-1.28.071-1.689.071-7.251s-.012-5.971-.071-7.251c-.058-1.282-.316-2.387-1.303-3.374C21.387.388 20.282.13 19 .072 17.72.013 17.311 0 14.052 0h-4.104zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zm0 10.162a3.999 3.999 0 1 1 0-7.998 3.999 3.999 0 0 1 0 7.998zm6.406-11.845a1.44 1.44 0 1 0 0 2.88 1.44 1.44 0 0 0 0-2.88z" />
    </svg>
);
// Twitter icon SVG from simpleicons.org (https://simpleicons.org/icons/twitter.svg)
const TwitterIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg
        {...props}
        viewBox="0 0 24 24"
        fill="currentColor"
        aria-hidden="true"
        width="1em"
        height="1em"
    >
        <path d="M24 4.557a9.83 9.83 0 0 1-2.828.775 4.932 4.932 0 0 0 2.165-2.724c-.951.564-2.005.974-3.127 1.195A4.916 4.916 0 0 0 16.616 3c-2.717 0-4.924 2.206-4.924 4.924 0 .386.044.763.127 1.124C7.728 8.807 4.1 6.884 1.671 3.965a4.822 4.822 0 0 0-.666 2.475c0 1.708.87 3.216 2.188 4.099a4.904 4.904 0 0 1-2.229-.616c-.054 2.281 1.581 4.415 3.949 4.89a4.936 4.936 0 0 1-2.224.084c.627 1.956 2.444 3.377 4.6 3.417A9.867 9.867 0 0 1 0 21.543a13.94 13.94 0 0 0 7.548 2.212c9.057 0 14.009-7.513 14.009-14.009 0-.213-.005-.425-.014-.636A10.012 10.012 0 0 0 24 4.557z" />
    </svg>
);
import { useState } from "react";

const Footer = () => {
    const [email, setEmail] = useState("");
    const [subscribed, setSubscribed] = useState(false);

    function handleSubscribe(e: React.FormEvent) {
        e.preventDefault();
        // For demo: simulate subscribe
        if (email.trim()) {
            setSubscribed(true);
            setEmail("");
            setTimeout(() => setSubscribed(false), 3000);
        }
    }

    return (
        <footer className="mt-12">
            <div className="bg-rose-50 border-t border-rose-100">
                <div className="max-w-7xl mx-auto py-8 md:py-10 px-4 sm:px-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 items-start">
                        <div className="flex flex-col gap-3 md:gap-4">
                            <Link
                                to="/"
                                className="flex items-center gap-2 sm:gap-3"
                            >
                                <div className="text-3xl">📚</div>
                                <span className="font-extrabold text-rose-600 text-base sm:text-lg">
                                    KidsBooks
                                </span>
                            </Link>

                            <p className="text-xs sm:text-sm text-gray-700 max-w-sm">
                                Cozy stories and playful learning for early
                                readers. Join our community of little readers
                                and big imaginations.
                            </p>

                            <div className="flex items-center space-x-3 sm:space-x-4 mt-1 md:mt-2">
                                <a
                                    href="https://twitter.com/"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    aria-label="Twitter"
                                    className="text-rose-600 hover:text-rose-500 text-lg sm:text-xl"
                                >
                                    <TwitterIcon />
                                </a>
                                <a
                                    href="https://instagram.com/"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    aria-label="Instagram"
                                    className="text-rose-600 hover:text-rose-500 text-lg sm:text-xl"
                                >
                                    <InstagramIcon />
                                </a>
                                <a
                                    href="https://facebook.com/"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    aria-label="Facebook"
                                    className="text-rose-600 hover:text-rose-500 text-lg sm:text-xl"
                                >
                                    <FacebookIcon />
                                </a>
                                <a
                                    href="mailto:info@kidsbooks.com"
                                    aria-label="Email"
                                    className="text-rose-600 hover:text-rose-500 text-lg sm:text-xl"
                                >
                                    <Mail />
                                </a>
                            </div>
                        </div>

                        <div className="md:col-span-2 grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6 mt-6 md:mt-0">
                            <div>
                                <h4 className="font-semibold text-gray-800 text-sm sm:text-base mb-2 sm:mb-3">
                                    Shop
                                </h4>
                                <ul className="space-y-1.5 sm:space-y-2 text-xs sm:text-sm text-gray-600">
                                    <li>
                                        <Link
                                            to="/"
                                            className="hover:text-rose-600"
                                        >
                                            Catalog
                                        </Link>
                                    </li>
                                    <li>
                                        <Link
                                            to="/about"
                                            className="hover:text-rose-600"
                                        >
                                            About
                                        </Link>
                                    </li>
                                    <li>
                                        <Link
                                            to="/cart"
                                            className="hover:text-rose-600"
                                        >
                                            Cart
                                        </Link>
                                    </li>
                                    <li>
                                        <Link
                                            to="/checkout"
                                            className="hover:text-rose-600"
                                        >
                                            Checkout
                                        </Link>
                                    </li>
                                </ul>
                            </div>

                            <div>
                                <h4 className="font-semibold text-gray-800 text-sm sm:text-base mb-2 sm:mb-3">
                                    Resources
                                </h4>
                                <ul className="space-y-1.5 sm:space-y-2 text-xs sm:text-sm text-gray-600">
                                    <li>
                                        <Link
                                            to="/about"
                                            className="hover:text-rose-600"
                                        >
                                            Our Story
                                        </Link>
                                    </li>
                                    <li>
                                        <Link
                                            to="/"
                                            className="hover:text-rose-600"
                                        >
                                            Gift Cards
                                        </Link>
                                    </li>
                                    <li>
                                        <Link
                                            to="/"
                                            className="hover:text-rose-600"
                                        >
                                            Help Center
                                        </Link>
                                    </li>
                                </ul>
                            </div>

                            <div>
                                <h4 className="font-semibold text-gray-800 text-sm sm:text-base mb-2 sm:mb-3">
                                    Family
                                </h4>
                                <ul className="space-y-1.5 sm:space-y-2 text-xs sm:text-sm text-gray-600">
                                    <li>
                                        <Link
                                            to="/"
                                            className="hover:text-rose-600"
                                        >
                                            Reading Tips
                                        </Link>
                                    </li>
                                    <li>
                                        <Link
                                            to="/"
                                            className="hover:text-rose-600"
                                        >
                                            Age Guides
                                        </Link>
                                    </li>
                                    <li>
                                        <Link
                                            to="/"
                                            className="hover:text-rose-600"
                                        >
                                            Parental Controls
                                        </Link>
                                    </li>
                                </ul>
                            </div>

                            <div className="col-span-2 sm:col-span-1">
                                <h4 className="font-semibold text-gray-800 text-sm sm:text-base mb-2 sm:mb-3">
                                    Subscribe
                                </h4>
                                <p className="text-xs sm:text-sm text-gray-600 mb-3">
                                    Join our newsletter for storytime picks and
                                    special offers.
                                </p>
                                <form
                                    onSubmit={handleSubscribe}
                                    className="flex flex-col gap-2"
                                >
                                    <label
                                        htmlFor="newsletter"
                                        className="sr-only"
                                    >
                                        Email
                                    </label>
                                    <input
                                        id="newsletter"
                                        type="email"
                                        required
                                        value={email}
                                        onChange={(e) =>
                                            setEmail(e.target.value)
                                        }
                                        placeholder="your@email.com"
                                        className="px-3 py-2 rounded-lg border w-full text-xs sm:text-sm focus:ring-2 focus:ring-rose-100 focus:outline-none"
                                    />
                                    <button
                                        type="submit"
                                        className="bg-rose-600 text-white px-4 py-2 rounded-lg text-xs sm:text-sm hover:bg-rose-700 transition-colors w-full sm:w-auto"
                                    >
                                        Subscribe
                                    </button>
                                </form>
                                {subscribed && (
                                    <div className="mt-2 text-xs sm:text-sm text-rose-600">
                                        Thanks for subscribing!
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="mt-6 md:mt-8 border-t border-rose-100 pt-4 md:pt-6 flex flex-col md:flex-row items-center justify-between text-xs sm:text-sm text-gray-600">
                        <div className="text-center md:text-left">
                            © {new Date().getFullYear()} KidsBooks — Made with
                            ❤️ for little readers.
                        </div>
                        <div className="flex space-x-3 sm:space-x-4 mt-3 md:mt-0">
                            <Link to="/terms" className="hover:text-rose-600">
                                Terms
                            </Link>
                            <Link to="/privacy" className="hover:text-rose-600">
                                Privacy
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
};
export default Footer;
