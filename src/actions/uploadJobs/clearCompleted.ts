import { createModuleAction } from '../index.js';
import { runSavonaAction } from '../_util.js';

const options = [] as const;

export const clearCompletedUploadJobs = createModuleAction<typeof options>(
	{
		name: 'Clear Completed Upload Jobs',
		async callback(companionModule) {
			await runSavonaAction(companionModule, 'clearing completed upload jobs', async (client) => {
				await client.uploadJobs.clearCompletedJobs();
			});
		},
	},
	options,
);
