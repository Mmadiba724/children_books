// Centralized category color mapping
// This ensures consistent color coding across the application

export interface CategoryColorClasses {
    bg: string;
    text: string;
    border: string;
}

// Predefined color map for specific categories
const categoryColorMap: Record<string, CategoryColorClasses> = {
    // === CURRENT APPLICATION CATEGORIES (Priority) ===
    'fiction': { bg: 'bg-blue-100', text: 'text-blue-800', border: 'border-blue-200' },
    'non-fiction': { bg: 'bg-emerald-100', text: 'text-emerald-800', border: 'border-emerald-200' },
    'science fiction': { bg: 'bg-purple-100', text: 'text-purple-800', border: 'border-purple-200' },
    'technology': { bg: 'bg-cyan-100', text: 'text-cyan-800', border: 'border-cyan-200' },
    'business': { bg: 'bg-slate-100', text: 'text-slate-800', border: 'border-slate-200' },
    'children': { bg: 'bg-yellow-100', text: 'text-yellow-800', border: 'border-yellow-200' },

    // === Additional Fiction Categories ===
    'novel': { bg: 'bg-blue-100', text: 'text-blue-800', border: 'border-blue-200' },
    'romance': { bg: 'bg-pink-100', text: 'text-pink-800', border: 'border-pink-200' },
    'love': { bg: 'bg-pink-100', text: 'text-pink-800', border: 'border-pink-200' },
    'mystery': { bg: 'bg-indigo-100', text: 'text-indigo-800', border: 'border-indigo-200' },
    'thriller': { bg: 'bg-indigo-100', text: 'text-indigo-800', border: 'border-indigo-200' },
    'crime': { bg: 'bg-indigo-100', text: 'text-indigo-800', border: 'border-indigo-200' },
    'fantasy': { bg: 'bg-violet-100', text: 'text-violet-800', border: 'border-violet-200' },
    'magic': { bg: 'bg-violet-100', text: 'text-violet-800', border: 'border-violet-200' },
    'horror': { bg: 'bg-red-100', text: 'text-red-800', border: 'border-red-200' },
    'scary': { bg: 'bg-red-100', text: 'text-red-800', border: 'border-red-200' },
    'adventure': { bg: 'bg-sky-100', text: 'text-sky-800', border: 'border-sky-200' },

    // === Children's Book Categories ===
    'kids': { bg: 'bg-yellow-100', text: 'text-yellow-800', border: 'border-yellow-200' },
    'animals': { bg: 'bg-green-100', text: 'text-green-800', border: 'border-green-200' },
    'bedtime': { bg: 'bg-indigo-100', text: 'text-indigo-800', border: 'border-indigo-200' },
    'stem': { bg: 'bg-teal-100', text: 'text-teal-800', border: 'border-teal-200' },
    'cooking': { bg: 'bg-orange-100', text: 'text-orange-800', border: 'border-orange-200' },
    'friendship': { bg: 'bg-pink-100', text: 'text-pink-800', border: 'border-pink-200' },
    'music': { bg: 'bg-purple-100', text: 'text-purple-800', border: 'border-purple-200' },
    'rhythm': { bg: 'bg-fuchsia-100', text: 'text-fuchsia-800', border: 'border-fuchsia-200' },
    'imagination': { bg: 'bg-rose-100', text: 'text-rose-800', border: 'border-rose-200' },
    'colors': { bg: 'bg-amber-100', text: 'text-amber-800', border: 'border-amber-200' },
    'first words': { bg: 'bg-lime-100', text: 'text-lime-800', border: 'border-lime-200' },
    'nature': { bg: 'bg-emerald-100', text: 'text-emerald-800', border: 'border-emerald-200' },
    'early learning': { bg: 'bg-amber-100', text: 'text-amber-800', border: 'border-amber-200' },
    'counting': { bg: 'bg-lime-100', text: 'text-lime-800', border: 'border-lime-200' },
    'growth': { bg: 'bg-teal-100', text: 'text-teal-800', border: 'border-teal-200' },
    'courage': { bg: 'bg-sky-100', text: 'text-sky-800', border: 'border-sky-200' },

    // === Non-Fiction Categories ===
    'science': { bg: 'bg-cyan-100', text: 'text-cyan-800', border: 'border-cyan-200' },
    'tech': { bg: 'bg-cyan-100', text: 'text-cyan-800', border: 'border-cyan-200' },
    'history': { bg: 'bg-amber-100', text: 'text-amber-800', border: 'border-amber-200' },
    'historical': { bg: 'bg-amber-100', text: 'text-amber-800', border: 'border-amber-200' },
    'biography': { bg: 'bg-emerald-100', text: 'text-emerald-800', border: 'border-emerald-200' },
    'memoir': { bg: 'bg-emerald-100', text: 'text-emerald-800', border: 'border-emerald-200' },
    'self-help': { bg: 'bg-teal-100', text: 'text-teal-800', border: 'border-teal-200' },
    'personal development': { bg: 'bg-teal-100', text: 'text-teal-800', border: 'border-teal-200' },
    'finance': { bg: 'bg-slate-100', text: 'text-slate-800', border: 'border-slate-200' },
    'food': { bg: 'bg-orange-100', text: 'text-orange-800', border: 'border-orange-200' },
    'travel': { bg: 'bg-sky-100', text: 'text-sky-800', border: 'border-sky-200' },
    'art': { bg: 'bg-fuchsia-100', text: 'text-fuchsia-800', border: 'border-fuchsia-200' },
    'poetry': { bg: 'bg-violet-100', text: 'text-violet-800', border: 'border-violet-200' },
};

// Default color for uncategorized or unknown categories
const defaultColor: CategoryColorClasses = {
    bg: 'bg-gray-100',
    text: 'text-gray-800',
    border: 'border-gray-200',
};

/**
 * Get color classes for a category name
 * @param category - The category name
 * @returns CSS classes for background, text, and border colors
 */
export function getCategoryColor(category: string): string {
    const categoryLower = category.toLowerCase().trim();

    // Check for exact match first
    if (categoryColorMap[categoryLower]) {
        const colors = categoryColorMap[categoryLower];
        return `${colors.bg} ${colors.text} ${colors.border}`;
    }

    // Check for partial matches (keywords within category name)
    for (const [key, colors] of Object.entries(categoryColorMap)) {
        if (categoryLower.includes(key) || key.includes(categoryLower)) {
            return `${colors.bg} ${colors.text} ${colors.border}`;
        }
    }

    // Return default color if no match found
    return `${defaultColor.bg} ${defaultColor.text} ${defaultColor.border}`;
}

/**
 * Get color classes as separate properties
 * @param category - The category name
 * @returns Object with separate bg, text, and border classes
 */
export function getCategoryColorClasses(category: string): CategoryColorClasses {
    const categoryLower = category.toLowerCase().trim();

    // Check for exact match first
    if (categoryColorMap[categoryLower]) {
        return categoryColorMap[categoryLower];
    }

    // Check for partial matches
    for (const [key, colors] of Object.entries(categoryColorMap)) {
        if (categoryLower.includes(key) || key.includes(categoryLower)) {
            return colors;
        }
    }

    // Return default color if no match found
    return defaultColor;
}

/**
 * Add or update a category color mapping at runtime
 * Useful for dynamically created categories
 * @param category - The category name
 * @param colors - The color classes to use
 */
export function setCategoryColor(category: string, colors: CategoryColorClasses): void {
    categoryColorMap[category.toLowerCase().trim()] = colors;
}

/**
 * Get all category color mappings
 * @returns The complete category color map
 */
export function getAllCategoryColors(): Record<string, CategoryColorClasses> {
    return { ...categoryColorMap };
}



