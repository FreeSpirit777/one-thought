interface HeaderProps {
	siteName?: string;
	siteDescription?: string;
}

export default function Header({ siteName, siteDescription }: HeaderProps) {
	return (
		<header className="border-b border-gray-200 py-8 text-center">
			<div className="container mx-auto px-4">
				<h1 className="text-4xl font-serif font-light tracking-tight text-black transition-opacity duration-500 sm:text-5xl">
					{siteName}
				</h1>
				{siteDescription && (
					<p className="mx-auto mt-2 max-w-[600px] text-lg text-gray-500 transition-opacity duration-500 sm:text-xl">
						{siteDescription}
					</p>
				)}
			</div>
		</header>
	);
}
