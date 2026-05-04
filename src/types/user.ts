


export interface User {
    id: string;
    email: string;
	phone: string;
    firstName: string;
	lastName: string;
    role?: 'USER' | 'ADMIN';
}

export interface AuthContextType {
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    login: (userData: User) => void;
    logout: () => void;
    checkAuth: () => Promise<void>;
}
