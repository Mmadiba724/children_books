import {
    createContext,
    useContext,
    useReducer,
    useEffect,
    useCallback,
    type ReactNode,
} from "react";
import type { User, AuthContextType } from "../types/user";
import authService from "../services/authService";

type State = {
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;
};

type Action =
    | { type: "SET_USER"; user: User }
    | { type: "CLEAR_USER" }
    | { type: "SET_LOADING"; isLoading: boolean };

const initialState: State = {
    user: null,
    isAuthenticated: false,
    isLoading: true,
};

function authReducer(state: State, action: Action): State {
    switch (action.type) {
        case "SET_USER":
            return {
                ...state,
                user: action.user,
                isAuthenticated: true,
                isLoading: false,
            };
        case "CLEAR_USER":
            return {
                ...state,
                user: null,
                isAuthenticated: false,
                isLoading: false,
            };
        case "SET_LOADING":
            return {
                ...state,
                isLoading: action.isLoading,
            };
        default:
            return state;
    }
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [state, dispatch] = useReducer(authReducer, initialState);

    const login = useCallback((userData: User) => {
        // Store user data in localStorage
        localStorage.setItem("userData", JSON.stringify(userData));
        dispatch({ type: "SET_USER", user: userData });
    }, []);

    const logout = useCallback(() => {
        // Clear tokens and user data
        authService.logout();
        localStorage.removeItem("userData");
        dispatch({ type: "CLEAR_USER" });
    }, []);

    const checkAuth = useCallback(async () => {
        dispatch({ type: "SET_LOADING", isLoading: true });

        try {
            // Check if auth token exists
            const isAuth = authService.isAuthenticated();

            if (isAuth) {
                // Try to retrieve stored user data
                const storedUserData = localStorage.getItem("userData");

                if (storedUserData) {
                    const userData = JSON.parse(storedUserData) as User;
                    dispatch({ type: "SET_USER", user: userData });
                } else {
                    // Token exists but no user data - this shouldn't normally happen
                    // but we'll treat as authenticated with minimal info
                    dispatch({
                        type: "SET_USER",
                        user: { id: "unknown", email: "unknown" },
                    });
                }
            } else {
                dispatch({ type: "CLEAR_USER" });
            }
        } catch (error) {
            console.error("Auth check failed:", error);
            dispatch({ type: "CLEAR_USER" });
        }
    }, []);

    // Check authentication on mount
    useEffect(() => {
        checkAuth();
    }, [checkAuth]);

    const value: AuthContextType = {
        user: state.user,
        isAuthenticated: state.isAuthenticated,
        isLoading: state.isLoading,
        login,
        logout,
        checkAuth,
    };

    return (
        <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
}
