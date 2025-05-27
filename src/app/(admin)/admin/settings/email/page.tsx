import { getEmailSettings } from "../_actions/settings-actions";
import EmailSettingsUpsert from "../_components/email-settings-upsert";

export default async function Page() {
	const emailSettings = await getEmailSettings();

	return (
		<div>
			<EmailSettingsUpsert emailSettings={emailSettings} />
		</div>
	);
}
