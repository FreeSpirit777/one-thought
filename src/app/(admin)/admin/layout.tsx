import Sidebar from "./_components/sidebar";

export default function AdminLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<div className="flex min-h-screen">
			<aside className="flex flex-col w-56 shrink-0">
				<Sidebar />
			</aside>
			<main className="flex-1 p-6">{children}</main>
		</div>
	);
}
