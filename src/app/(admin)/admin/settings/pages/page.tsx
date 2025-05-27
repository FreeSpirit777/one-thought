import { getPages } from "./_actions/pages-actions";
import PageList from "./_components/page-list";

export default async function Page() {
	const pages = await getPages();

	return (
		<div>
			<h1 className="text-2xl font-bold mb-4">Pages</h1>
			<PageList pages={pages} />
		</div>
	);
}
