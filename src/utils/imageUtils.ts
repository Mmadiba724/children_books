import { API_BASE_URL } from '../config/api';

/**
 * Constructs a full image URL from a relative path
 * @param path - The image path (e.g., "/api/v1/files/images/..." or "images/...")
 * @returns Full URL to the image
 */
export const getImageUrl = (path: string | null | undefined): string => {
    if (!path) return '';

    // If already a full URL, return as-is
    if (path.startsWith('http://') || path.startsWith('https://')) {
        return path;
    }

    // If starts with /, it's an API relative path
    if (path.startsWith('/')) {
        return `${API_BASE_URL}${path}`;
    }

    // If it's just a relative path like "images/...", construct full API path
    return `${API_BASE_URL}/api/v1/files/${path}`;
};
