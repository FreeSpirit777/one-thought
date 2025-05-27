"use client";

import { useState, useEffect, useRef } from "react";
import { Image } from "@prisma/client";
import { DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import NextImage from "next/image";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

import useDebounce from "@/hooks/useDebounce";
import { Loader2 } from "lucide-react";
import { getImagesForModal } from "../images/_actions/images-actions";
import { AspectRatio } from "@radix-ui/react-aspect-ratio";

interface ImageSelectionModalProps {
	onSelectImage: (image: Image | null) => void;
	selectedImageId?: string | null;
}

export function ImageSelectionModal({ onSelectImage, selectedImageId }: ImageSelectionModalProps) {
	const [images, setImages] = useState<Image[]>([]);
	const [page, setPage] = useState(1);
	const [hasMore, setHasMore] = useState(true);
	const [searchQuery, setSearchQuery] = useState("");
	const debouncedSearchQuery = useDebounce(searchQuery, 300);
	const [isLoading, setIsLoading] = useState(false);

    // Reference to the scrollable container for programmatic scrolling
	const scrollContainerRef = useRef<HTMLDivElement>(null);

    // Function to load images, optionally resetting the list
	const loadImages = async (reset = false) => {
		if (isLoading) return;
		setIsLoading(true);

        // Determine the page to fetch (reset to 1 or use current page)
		const currentPage = reset ? 1 : page;
		const fetchedImages = await getImagesForModal(currentPage, debouncedSearchQuery);
		
        // Update images state, either resetting or appending new images
        setImages((prev) => (reset ? fetchedImages : [...prev, ...fetchedImages]));
		// Update page for the next load (reset to 2 or increment)
        setPage(reset ? 2 : currentPage + 1); // Set page to 2 for next batch or increment
		// Check if more images are available (assuming 6 images per page)
        setHasMore(fetchedImages.length >= 6);

        // Scroll the container after DOM updates
		setTimeout(() => {
			if (scrollContainerRef.current) {
				const container = scrollContainerRef.current;
				if (reset) {
                    // Scroll to top on reset (e.g., new search)
					container.scrollTo({ top: 0, behavior: "smooth" });
				} else {
                    // Scroll to bottom when loading more images
					container.scrollTo({
						top: container.scrollHeight,
						behavior: "smooth",
					}); // Bei "Load more" nach unten
				}
			}
		}, 50); // Small delay to ensure DOM is updated

		setIsLoading(false);
	};

    // Effect to trigger image loading when debounced search query changes
	useEffect(() => {
		// Reset page to 1 for a new search
        setPage(1); // Setze page explizit auf 1 bei neuer Suche
		// Load images with reset flag to clear previous results
        loadImages(true);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [debouncedSearchQuery]);

    // Handle changes to the search input
	const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
		setSearchQuery(e.target.value);
	};

	return (
		<DialogContent className="h-[55vh] flex flex-col">
			<DialogHeader>
				<DialogTitle>Select Image</DialogTitle>
			</DialogHeader>
			<Input
				type="text"
				placeholder="Searching images..."
				value={searchQuery}
				onChange={handleSearch}
				className="w-full p-2 border rounded-lg"
			/>
			<div ref={scrollContainerRef} className="flex-1 overflow-y-auto">
				<div className="grid grid-cols-2 sm:grid-cols-3 gap-4 p-6">
					{images.map((image) => (
						<div
							key={image.id}
							onClick={() => onSelectImage(image)}
							className={`cursor-pointer rounded-lg transition-all duration-200 ease-in-out ${
								selectedImageId === image.id
									? "ring-2 ring-offset-2 ring-gray-400"
									: "hover:ring-2 hover:ring-offset-2 hover:ring-gray-300"
							}`}
						>
							<AspectRatio ratio={16 / 9}>
								<NextImage
									src={image.imageUrl}
									alt={image.alt || "Image"}
									fill
									className="object-cover w-full h-full rounded-lg"
								/>
							</AspectRatio>
						</div>
					))}
				</div>
			</div>
			{hasMore && !searchQuery && (
				<Button onClick={() => loadImages()} disabled={isLoading} className="mt-4">
					{isLoading ? (
						<>
							<Loader2 className="mr-2 h-4 w-4 animate-spin" />
							Loading...
						</>
					) : (
						<>Load more</>
					)}
				</Button>
			)}
		</DialogContent>
	);
}
