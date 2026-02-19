import { Link } from "react-router-dom";
import { useState } from "react";

// Social Media Icons
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

const PinterestIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg
        {...props}
        viewBox="0 0 24 24"
        fill="currentColor"
        aria-hidden="true"
        width="1em"
        height="1em"
    >
        <path d="M12 0C5.373 0 0 5.372 0 12c0 5.084 3.163 9.426 7.627 11.174-.105-.949-.2-2.405.042-3.441.218-.937 1.407-5.965 1.407-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738.098.119.112.224.083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.359-.631-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24 12 24c6.627 0 12-5.373 12-12 0-6.628-5.373-12-12-12z" />
    </svg>
);

const TikTokIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg
        {...props}
        viewBox="0 0 24 24"
        fill="currentColor"
        aria-hidden="true"
        width="1em"
        height="1em"
    >
        <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z" />
    </svg>
);

const YouTubeIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg
        {...props}
        viewBox="0 0 24 24"
        fill="currentColor"
        aria-hidden="true"
        width="1em"
        height="1em"
    >
        <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
    </svg>
);

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
        <footer className="mt-12 bg-white border-t border-gray-200">
            <div className="max-w-7xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
                {/* Main Footer Grid */}
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8 mb-10">
                    {/* Services Column */}
                    <div>
                        <h4 className="font-bold text-gray-900 text-sm uppercase mb-4 tracking-wide">
                            Services
                        </h4>
                        <ul className="space-y-2.5 text-sm text-gray-600">
                            <li>
                                <Link to="/library" className="hover:underline">
                                    Digital Library
                                </Link>
                            </li>
                            <li>
                                <Link to="/" className="hover:underline">
                                    Gift Cards
                                </Link>
                            </li>
                            <li>
                                <Link to="/orders" className="hover:underline">
                                    Order Status
                                </Link>
                            </li>
                            <li>
                                <Link to="/" className="hover:underline">
                                    Membership
                                </Link>
                            </li>
                            <li>
                                <Link to="/" className="hover:underline">
                                    Book Recommendations
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* About Column */}
                    <div>
                        <h4 className="font-bold text-gray-900 text-sm uppercase mb-4 tracking-wide">
                            About Us
                        </h4>
                        <ul className="space-y-2.5 text-sm text-gray-600">
                            <li>
                                <Link to="/about" className="hover:underline">
                                    Our Story
                                </Link>
                            </li>
                            <li>
                                <Link to="/" className="hover:underline">
                                    Careers
                                </Link>
                            </li>
                            <li>
                                <Link to="/" className="hover:underline">
                                    Press Room
                                </Link>
                            </li>
                            <li>
                                <Link to="/" className="hover:underline">
                                    Investor Relations
                                </Link>
                            </li>
                            <li>
                                <Link to="/" className="hover:underline">
                                    Affiliates
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Quick Help Column */}
                    <div>
                        <h4 className="font-bold text-gray-900 text-sm uppercase mb-4 tracking-wide">
                            Quick Help
                        </h4>
                        <ul className="space-y-2.5 text-sm text-gray-600">
                            <li>
                                <Link to="/" className="hover:underline">
                                    Help Center
                                </Link>
                            </li>
                            <li>
                                <Link to="/" className="hover:underline">
                                    Returns & Refunds
                                </Link>
                            </li>
                            <li>
                                <Link to="/" className="hover:underline">
                                    Shipping Info
                                </Link>
                            </li>
                            <li>
                                <Link to="/" className="hover:underline">
                                    Contact Us
                                </Link>
                            </li>
                            <li>
                                <Link to="/" className="hover:underline">
                                    Accessibility
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Shop by Category Column */}
                    <div>
                        <h4 className="font-bold text-gray-900 text-sm uppercase mb-4 tracking-wide">
                            Categories
                        </h4>
                        <ul className="space-y-2.5 text-sm text-gray-600">
                            <li>
                                <Link to="/catalog" className="hover:underline">
                                    All Books
                                </Link>
                            </li>
                            <li>
                                <Link to="/catalog" className="hover:underline">
                                    Picture Books
                                </Link>
                            </li>
                            <li>
                                <Link to="/catalog" className="hover:underline">
                                    Chapter Books
                                </Link>
                            </li>
                            <li>
                                <Link to="/catalog" className="hover:underline">
                                    Young Adult
                                </Link>
                            </li>
                            <li>
                                <Link to="/catalog" className="hover:underline">
                                    Educational
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Newsletter Column - spans 2 columns on large screens */}
                    <div className="col-span-2 lg:col-span-2">
                        <h4 className="font-bold text-gray-900 text-sm uppercase mb-4 tracking-wide">
                            Stay in the Know
                        </h4>
                        <p className="text-sm text-gray-600 mb-4 max-w-sm">
                            Get special offers, book recommendations, and
                            updates delivered to your inbox.
                        </p>
                        <form
                            onSubmit={handleSubscribe}
                            className="flex flex-col sm:flex-row gap-2 mb-3 max-w-md"
                        >
                            <label htmlFor="newsletter" className="sr-only">
                                Email Address
                            </label>
                            <input
                                id="newsletter"
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="Enter your email"
                                className="flex-1 px-4 py-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-gray-400 focus:outline-none"
                            />
                            <button
                                type="submit"
                                className="bg-gray-900 text-white px-6 py-2 rounded text-sm font-medium hover:bg-gray-800 transition-colors whitespace-nowrap"
                            >
                                Subscribe
                            </button>
                        </form>
                        {subscribed && (
                            <div className="text-sm text-green-600">
                                ✓ Thank you for subscribing!
                            </div>
                        )}
                    </div>
                </div>

                {/* Bottom Section - Social & Copyright */}
                <div className="border-t border-gray-200 pt-8">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                        {/* Copyright & Legal Links */}
                        <div className="flex flex-col sm:flex-row items-center gap-4 text-sm text-gray-600">
                            <div>
                                © {new Date().getFullYear()} KidsBooks. All
                                rights reserved.
                            </div>
                            <div className="flex items-center gap-4">
                                <Link to="/privacy" className="hover:underline">
                                    Privacy Policy
                                </Link>
                                <span className="text-gray-400">|</span>
                                <Link to="/terms" className="hover:underline">
                                    Terms of Use
                                </Link>
                                <span className="text-gray-400">|</span>
                                <Link to="/" className="hover:underline">
                                    Cookie Preferences
                                </Link>
                            </div>
                        </div>

                        {/* Social Media Icons */}
                        <div className="flex items-center gap-4">
                            <a
                                href="https://facebook.com/"
                                target="_blank"
                                rel="noopener noreferrer"
                                aria-label="Facebook"
                                className="text-gray-600 hover:text-gray-900 transition-colors"
                            >
                                <FacebookIcon className="w-5 h-5" />
                            </a>
                            <a
                                href="https://twitter.com/"
                                target="_blank"
                                rel="noopener noreferrer"
                                aria-label="Twitter"
                                className="text-gray-600 hover:text-gray-900 transition-colors"
                            >
                                <TwitterIcon className="w-5 h-5" />
                            </a>
                            <a
                                href="https://instagram.com/"
                                target="_blank"
                                rel="noopener noreferrer"
                                aria-label="Instagram"
                                className="text-gray-600 hover:text-gray-900 transition-colors"
                            >
                                <InstagramIcon className="w-5 h-5" />
                            </a>
                            <a
                                href="https://pinterest.com/"
                                target="_blank"
                                rel="noopener noreferrer"
                                aria-label="Pinterest"
                                className="text-gray-600 hover:text-gray-900 transition-colors"
                            >
                                <PinterestIcon className="w-5 h-5" />
                            </a>
                            <a
                                href="https://tiktok.com/"
                                target="_blank"
                                rel="noopener noreferrer"
                                aria-label="TikTok"
                                className="text-gray-600 hover:text-gray-900 transition-colors"
                            >
                                <TikTokIcon className="w-5 h-5" />
                            </a>
                            <a
                                href="https://youtube.com/"
                                target="_blank"
                                rel="noopener noreferrer"
                                aria-label="YouTube"
                                className="text-gray-600 hover:text-gray-900 transition-colors"
                            >
                                <YouTubeIcon className="w-5 h-5" />
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
