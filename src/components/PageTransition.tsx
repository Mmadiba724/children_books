import { motion } from "framer-motion";
import { ReactNode } from "react";
import { pageVariants } from "../utils/animations";

interface PageTransitionProps {
    children: ReactNode;
    className?: string;
}

export default function PageTransition({
    children,
    className = "",
}: PageTransitionProps) {
    return (
        <motion.div
            initial="initial"
            animate="animate"
            exit="exit"
            variants={pageVariants}
            className={className}
        >
            {children}
        </motion.div>
    );
}
