import {
    createContext,
    useContext,
    useReducer,
    useEffect,
    useCallback,
    useRef,
    type ReactNode,
} from "react";
import type { User, AuthContextType } from "../types/user";
import authService from "../services/authService";
import tokenStorage from "../utils/tokenStorage";

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
    const refreshPromiseRef = useRef<Promise<void> | null>(null);

    const login = useCallback((userData: User) => {
        // Store user data in secure storage
        tokenStorage.setUserData(userData);
        dispatch({ type: "SET_USER", user: userData });
    }, []);

    const logout = useCallback(() => {
        // Clear tokens and user data
        authService.logout();
        tokenStorage.clearAll();
        dispatch({ type: "CLEAR_USER" });
    }, []);

    const checkAuth = useCallback(async () => {
        dispatch({ type: "SET_LOADING", isLoading: true });

        try {
            // Check if we have a refresh token but no access token
            // This happens after page refresh since access token is in memory
            const hasRefreshToken = !!tokenStorage.getRefreshToken();
            const hasAccessToken = !!tokenStorage.getAccessToken();

            if (hasRefreshToken && !hasAccessToken) {
                // Prevent concurrent refresh attempts (React StrictMode causes double renders)
                if (refreshPromiseRef.current) {
                    console.log(
                        "Refresh already in progress, waiting for it to complete...",
                    );
                    try {
                        await refreshPromiseRef.current;
                    } catch (error) {
                        // The first call already handled the error
                        console.log(
                            "Refresh failed, skipping duplicate error handling",
                        );
                    }
                } else {
                    // Proactively refresh the access token before any API calls
                    console.log(
                        "Refreshing access token on app initialization...",
                    );

                    const refreshPromise = (async () => {
                        try {
                            await authService.refreshToken();
                        } catch (error) {
                            console.error(
                                "Failed to refresh token on initialization:",
                                error,
                            );
                            // If refresh fails, clear everything and log out
                            tokenStorage.clearAll();
                            dispatch({ type: "CLEAR_USER" });
                            throw error;
                        } finally {
                            refreshPromiseRef.current = null;
                        }
                    })();

                    refreshPromiseRef.current = refreshPromise;
                    await refreshPromise;
                }
            }

            // Check if auth token exists
            const isAuth = authService.isAuthenticated();

            if (isAuth) {
                // Try to retrieve stored user data
                const storedUserData = tokenStorage.getUserData();

                if (storedUserData) {
                    const userData = storedUserData as User;
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
