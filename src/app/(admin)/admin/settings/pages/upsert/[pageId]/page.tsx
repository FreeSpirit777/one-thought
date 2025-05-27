import PageUpsert from "../../_components/page-upsert";
import { getPage } from "../../_actions/pages-actions";


export default async function Page({
	params,
}: {
	params: Promise<{ pageId: string }>;
}) {
	const { pageId } = await params;

    const page = await getPage(pageId)

	if (!page) return;

	return (
		<div>
			<PageUpsert page={page} />
		</div>
	);
}
