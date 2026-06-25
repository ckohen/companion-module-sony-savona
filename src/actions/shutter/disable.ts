import { createModuleAction } from '../index.js';
import { runSavonaAction } from '../_util.js';

const options = [] as const;

export const disableShutter = createModuleAction<typeof options>(
	{
		name: 'Disable Shutter',
		async callback(companionModule) {
			await runSavonaAction(companionModule, 'disabling shutter', async (client) => {
				await client.shutter.setDisabled();
			});
		},
	},
	options,
);
