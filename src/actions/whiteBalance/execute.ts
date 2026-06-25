import { createModuleAction } from '../index.js';
import { runSavonaAction } from '../_util.js';

const options = [] as const;

export const executeWhiteBalance = createModuleAction<typeof options>(
	{
		name: 'Execute Auto White Balance',
		async callback(companionModule) {
			await runSavonaAction(companionModule, 'executing auto white balance', async (client) => {
				await client.whiteBalance.execute();
			});
		},
	},
	options,
);
