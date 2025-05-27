import ImageCreateUpdate from "../../_components/image-update";
import { getImage } from "../../_actions/images-actions";

export default async function Page ({params}: {params: Promise<{ imageId: string }>}) {

    const { imageId } = await params;

    const image =  await getImage(imageId);

    if (!image) return;

    return (
        <div>
            <ImageCreateUpdate image={image} />
        </div>
    )
}