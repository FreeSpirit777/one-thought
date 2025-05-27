import { Loader2 } from "lucide-react";

export default function Loading() {
	return (
		<div className="flex h-screen justify-center items-center">
			<Loader2 className="animate-spin" />
		</div>
	);
}
