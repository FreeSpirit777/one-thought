"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Search, Loader2 } from "lucide-react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import useDebounce from "@/hooks/useDebounce";

export default function SearchBar() {
	const [searchQuery, setSearchQuery] = useState("");
	const [isUserInput, setIsUserInput] = useState(false);
	const debouncedSearchQuery = useDebounce(searchQuery, 500);
	const router = useRouter();
	const pathname = usePathname();
	const searchParams = useSearchParams();
	const [isPending, startTransition] = useTransition();

	// Synchronizes the input field with the URL parameters
	useEffect(() => {
		const currentSearch = searchParams.get("search") || "";
		setSearchQuery(decodeURIComponent(currentSearch));
	}, [searchParams]);

	// Processes the search only on user input
	useEffect(() => {
		if (!isUserInput) return;

		const query = debouncedSearchQuery.trim();
		const currentSearch = searchParams.get("search") || "";

		if (query !== decodeURIComponent(currentSearch)) {
			const params = new URLSearchParams(searchParams.toString());
			if (query) {
				params.set("search", query);
				params.delete("page");
			} else {
				params.delete("search");
				params.delete("page");
			}
			startTransition(() => {
				// Splits the path into segments and checks if the first subpath exists
				const pathSegments = pathname.split("/").filter((segment) => segment);
				// Redirects only if a subpath exists and it is neither 'categories' nor 'tags'
				if (pathSegments.length > 0 && !["categories", "tags"].includes(pathSegments[0])) {
					router.push(`/?${params.toString().replace(/\+/g, "%20")}`);
				} else {
					router.push(`${pathname}?${params.toString().replace(/\+/g, "%20")}`);
				}
				setIsUserInput(false);
			});
		}
	}, [debouncedSearchQuery, router, pathname, searchParams, isUserInput]);

	return (
		<div className="relative">
			{isPending ? (
				<Loader2 className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground animate-spin" />
			) : (
				<Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
			)}
			<Label htmlFor="search" className="sr-only">
				Search
			</Label>
			<Input
				id="search"
				name="search"
				type="search"
				placeholder="Search articles..."
				className="pl-8"
				value={searchQuery}
				onChange={(e) => {
					setSearchQuery(e.target.value);
					setIsUserInput(true);
				}}
				autoComplete="off"
				disabled={isPending}
			/>
		</div>
	);
}
