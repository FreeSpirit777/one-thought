"use client";

import {
    ColumnDef,
    flexRender,
    getCoreRowModel,
    useReactTable,
    getSortedRowModel,
    getFilteredRowModel,
    getPaginationRowModel,
} from "@tanstack/react-table";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowUpDown, Loader2, MoreVertical } from "lucide-react";
import Link from "next/link";
import { deletePost } from "../_actions/posts-actions";
import { toast } from "sonner";
import { useState, useTransition } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { Post } from "@prisma/client";

interface PostListProps {
    posts: Post[];
}

export default function PostList({ posts: initialPosts }: PostListProps) {
    const [globalFilter, setGlobalFilter] = useState("");
    const [posts, setPosts] = useState(initialPosts);

    // Definition of Data Table
    const columns: ColumnDef<Post>[] = [
        {
            accessorKey: "title",
            header: ({ column }) => (
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() =>
                        column.toggleSorting(column.getIsSorted() === "asc")
                    }
                >
                    Title
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            ),
        },
    ];

    // Tanstack Table Hook
    const table = useReactTable({
        data: posts,
        columns,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        state: {
            globalFilter,
        },
        onGlobalFilterChange: setGlobalFilter,
        initialState: {
            pagination: {
                pageSize: 8,
            },
        },
        autoResetPageIndex: false,
    });

    const handleDelete = (postId: string) => {
        const newPosts = posts.filter((post) => post.id !== postId);
        setPosts(newPosts);
    };

    if (posts.length === 0) {
        return <div>No posts found.</div>;
    }

    return (
        <div className="space-y-6">
            {/* Search */}
            <div className="flex items-center">
                <Input
                    placeholder="Search posts..."
                    value={globalFilter}
                    onChange={(e) => {
                        setGlobalFilter(e.target.value);
                        table.setPageIndex(0);
                    }}
                    className="max-w-sm"
                />
            </div>

            {/* Table */}
            <div>
                <Table>
                    <TableHeader>
                        {table.getHeaderGroups().map((headerGroup) => (
                            <TableRow key={headerGroup.id}>
                                {headerGroup.headers.map((header) => (
                                    <TableHead
                                        key={header.id}
                                        className={
                                            header.id === "actions"
                                                ? "w-[50px] text-center"
                                                : "pl-1"
                                        }
                                    >
                                        {header.isPlaceholder
                                            ? null
                                            : flexRender(
                                                    header.column.columnDef
                                                        .header,
                                                    header.getContext()
                                              )}
                                    </TableHead>
                                ))}
                                <TableHead className="w-[50px] text-center">
                                    Actions
                                </TableHead>
                            </TableRow>
                        ))}
                    </TableHeader>
                    <TableBody>
                        {table.getRowModel().rows?.length ? (
                            table
                                .getRowModel()
                                .rows.map((row) => (
                                    <PostRow
                                        key={row.id}
                                        post={row.original}
                                        onDelete={handleDelete}
                                    />
                                ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={2} className="text-center">
                                    No results.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between">
                <div className="flex-1 text-sm text-muted-foreground">
                    {table.getFilteredRowModel().rows.length} post(s) total
                </div>
                <div className="flex items-center space-x-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => table.previousPage()}
                        disabled={!table.getCanPreviousPage()}
                    >
                        Previous
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => table.nextPage()}
                        disabled={!table.getCanNextPage()}
                    >
                        Next
                    </Button>
                </div>
            </div>
        </div>
    );
}

interface PostRowProps {
    post: Post;
    onDelete: (postId: string) => void;
}

function PostRow({ post, onDelete }: PostRowProps) {
    const [isPendingDeletePost, startTransitionDeletePost] = useTransition();
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [isAlertOpen, setIsAlertOpen] = useState(false);

    const handleDelete = async (postId: string) => {
        startTransitionDeletePost(async () => {
            try {
                await deletePost(postId);
                onDelete(postId);
                toast.success("Post deleted");
            } catch (error) {
                toast.error(
                    error instanceof Error
                        ? error.message
                        : "Error deleting post"
                );
            }
        });
    };

    return (
        <>
            <TableRow key={post.id}>
                <TableCell className="pl-4">
                    {isPendingDeletePost ? (
                        <Skeleton className="w-30 h-5 rounded-lg" />
                    ) : (
                        post.title
                    )}
                </TableCell>
                <TableCell className="text-center">
                    <DropdownMenu
                        open={isPendingDeletePost ? false : isDropdownOpen}
                        onOpenChange={setIsDropdownOpen}
                    >
                        <DropdownMenuTrigger asChild>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                aria-label="Actions"
                            >
                                <MoreVertical className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem>
                                <Link href={`/admin/posts/edit/${post.id}`}>
                                    Update Post
                                </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                className="text-destructive focus:bg-destructive/10"
                                onClick={() => {
                                    setIsDropdownOpen(false);
                                    setIsAlertOpen(true);
                                }}
                            >
                                Delete Post
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </TableCell>
            </TableRow>

            <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>
                            Are you absolutely sure?
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. This will permanently
                            delete the post.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={() => handleDelete(post.id!)}
                        >
                            {isPendingDeletePost ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                                "Delete Post"
                            )}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}