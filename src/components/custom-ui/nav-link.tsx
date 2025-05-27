"use client";

import { cn } from "@/lib/utils";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function NavLink({
    href,
    children,
    className,
    onClick,
}: {
    href: string;
    children: React.ReactNode;
    className?: string;
    onClick?: () => void;
}) {
    const pathName = usePathname();

    const isActive =
        pathName === href || (href !== "/" && pathName.startsWith(href));

    return (
        <Link
            href={href}
            onClick={onClick}
            className={cn(
                "text-sm lg:text-base transition-colors duration-200 text-muted-foreground hover:text-primary",
                isActive && "text-primary font-medium",
                className   
            )}
        >
            {children}
        </Link>
    );
}


