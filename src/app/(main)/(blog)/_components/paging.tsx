import {
	Pagination,
	PaginationContent,
	PaginationEllipsis,
	PaginationItem,
	PaginationNext,
	PaginationPrevious,
} from "@/components/ui/pagination";
import Link from "next/link";

type PagingProps = {
	currentPage: number;
	totalPages: number;
	visiblePages: number;
	pathName: string;
	searchParams: { page?: string; search?: string };
};

export default function Paging({
	currentPage,
	totalPages,
	visiblePages,
	pathName,
	searchParams,
}: PagingProps) {
	const createPageUrl = (page: number) => {
		const params = new URLSearchParams(searchParams);
		params.set("page", page.toString());
		return `${pathName}?${params.toString()}`;
	};

	const startPage = Math.max(1, currentPage - Math.floor(visiblePages / 2));
	const endPage = Math.min(totalPages, startPage + visiblePages - 1);

	const pages = [];
	if (startPage > 1) {
		pages.push(
			<PaginationItem key="start-ellipsis">
				<PaginationEllipsis />
			</PaginationItem>
		);
	}

	for (let i = startPage; i <= endPage; i++) {
		pages.push(
			<PaginationItem key={i}>
				<Link
					href={createPageUrl(i)}
					className={`px-3 py-1 rounded-md ${
						i === currentPage
							? "bg-primary text-primary-foreground"
							: "hover:bg-muted"
					}`}
					prefetch={true}
				>
					{i}
				</Link>
			</PaginationItem>
		);
	}

	if (endPage < totalPages) {
		pages.push(
			<PaginationItem key="end-ellipsis">
				<PaginationEllipsis />
			</PaginationItem>
		);
	}

	return (
		<div className="pt-6">
			<Pagination>
				<PaginationContent>
					<PaginationItem>
						{currentPage > 1 ? (
							<PaginationPrevious
								href={createPageUrl(currentPage - 1)}
							/>
						) : (
							<PaginationPrevious className="pointer-events-none opacity-50" />
						)}
					</PaginationItem>

					{pages}

					<PaginationItem>
						{currentPage < totalPages ? (
							<PaginationNext
								href={createPageUrl(currentPage + 1)}
							/>
						) : (
							<PaginationNext className="pointer-events-none opacity-50" />
						)}
					</PaginationItem>
				</PaginationContent>
			</Pagination>
		</div>
	);
}
