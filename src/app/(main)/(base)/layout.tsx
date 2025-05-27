export default async function BaseLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
        <main className="flex">
            <div className="flex flex-col flex-1">
                {children}
            </div>
        </main>
	);
}
