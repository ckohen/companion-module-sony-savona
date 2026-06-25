import { createModuleAction } from '../index.js';
import { runSavonaAction } from '../_util.js';

const options = [] as const;

export const openRecorder = createModuleAction<typeof options>(
	{
		name: 'Open Recorder',
		async callback(companionModule) {
			await runSavonaAction(companionModule, 'opening recorder', async (client) => {
				await client.record.open();
			});
		},
	},
	options,
);
