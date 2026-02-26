// Animation configuration utilities for consistent animations across the app
import { Variants } from "framer-motion";

// Page transition variants
export const pageVariants: Variants = {
    initial: {
        opacity: 0,
        y: 20,
    },
    animate: {
        opacity: 1,
        y: 0,
        transition: {
            duration: 0.4,
            ease: "easeOut",
        },
    },
    exit: {
        opacity: 0,
        y: -20,
        transition: {
            duration: 0.3,
            ease: "easeIn",
        },
    },
};

// Fade in variants
export const fadeInVariants: Variants = {
    hidden: {
        opacity: 0,
    },
    visible: {
        opacity: 1,
        transition: {
            duration: 0.6,
            ease: "easeOut",
        },
    },
};

// Slide up variants
export const slideUpVariants: Variants = {
    hidden: {
        opacity: 0,
        y: 50,
    },
    visible: {
        opacity: 1,
        y: 0,
        transition: {
            duration: 0.5,
            ease: "easeOut",
        },
    },
};

// Slide in from left
export const slideInLeftVariants: Variants = {
    hidden: {
        opacity: 0,
        x: -60,
    },
    visible: {
        opacity: 1,
        x: 0,
        transition: {
            duration: 0.6,
            ease: "easeOut",
        },
    },
};

// Slide in from right
export const slideInRightVariants: Variants = {
    hidden: {
        opacity: 0,
        x: 60,
    },
    visible: {
        opacity: 1,
        x: 0,
        transition: {
            duration: 0.6,
            ease: "easeOut",
        },
    },
};

// Scale in variants
export const scaleInVariants: Variants = {
    hidden: {
        opacity: 0,
        scale: 0.8,
    },
    visible: {
        opacity: 1,
        scale: 1,
        transition: {
            duration: 0.5,
            ease: "easeOut",
        },
    },
};

// Card hover variants
export const cardHoverVariants: Variants = {
    rest: {
        scale: 1,
        y: 0,
    },
    hover: {
        scale: 1.03,
        y: -8,
        transition: {
            duration: 0.3,
            ease: "easeOut",
        },
    },
};

// Stagger container
export const staggerContainerVariants: Variants = {
    hidden: {
        opacity: 0,
    },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1,
            delayChildren: 0.2,
        },
    },
};

// Stagger item
export const staggerItemVariants: Variants = {
    hidden: {
        opacity: 0,
        y: 20,
    },
    visible: {
        opacity: 1,
        y: 0,
        transition: {
            duration: 0.4,
            ease: "easeOut",
        },
    },
};

// Modal variants
export const modalVariants: Variants = {
    hidden: {
        opacity: 0,
        scale: 0.95,
    },
    visible: {
        opacity: 1,
        scale: 1,
        transition: {
            duration: 0.3,
            ease: "easeOut",
        },
    },
    exit: {
        opacity: 0,
        scale: 0.95,
        transition: {
            duration: 0.2,
            ease: "easeIn",
        },
    },
};

// Backdrop variants
export const backdropVariants: Variants = {
    hidden: {
        opacity: 0,
    },
    visible: {
        opacity: 1,
        transition: {
            duration: 0.3,
        },
    },
    exit: {
        opacity: 0,
        transition: {
            duration: 0.2,
        },
    },
};

// Sidebar variants
export const sidebarVariants: Variants = {
    hidden: {
        x: "100%",
    },
    visible: {
        x: 0,
        transition: {
            type: "spring",
            stiffness: 300,
            damping: 30,
        },
    },
    exit: {
        x: "100%",
        transition: {
            type: "spring",
            stiffness: 300,
            damping: 30,
        },
    },
};

// Navbar variants
export const navbarVariants: Variants = {
    hidden: {
        y: -100,
        opacity: 0,
    },
    visible: {
        y: 0,
        opacity: 1,
        transition: {
            duration: 0.6,
            ease: "easeOut",
        },
    },
};

// Button press animation
export const buttonPressVariants: Variants = {
    tap: {
        scale: 0.95,
        transition: {
            duration: 0.1,
        },
    },
};

// Bounce animation
export const bounceVariants: Variants = {
    initial: {
        y: 0,
    },
    animate: {
        y: [-10, 0, -10],
        transition: {
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
        },
    },
};

// Float animation
export const floatVariants: Variants = {
    animate: {
        y: [0, -15, 0],
        transition: {
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut",
        },
    },
};

// Pulse animation
export const pulseVariants: Variants = {
    animate: {
        scale: [1, 1.05, 1],
        transition: {
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
        },
    },
};
