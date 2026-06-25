import { SomeCompanionActionInputField } from '@companion-module/base';
import { createModuleAction } from '../index.js';
import { runSavonaAction } from '../_util.js';
import { assertUploadJobIds, getSpecificUploadJobIds, getUploadJobIds } from './_util.js';

const options = [
	{
		type: 'dropdown',
		id: 'target',
		label: 'Target',
		default: 'active',
		disableAutoExpression: true,
		choices: [
			{ id: 'active', label: 'All Active/Incomplete Jobs' },
			{ id: 'transferring', label: 'Transferring Jobs' },
			{ id: 'waiting', label: 'Waiting Jobs' },
			{ id: 'specific', label: 'Specific Job IDs' },
		],
	},
	{
		type: 'textinput',
		id: 'jobIds',
		label: 'Job IDs',
		default: '',
		tooltip: 'Comma or space separated upload job IDs',
		useVariables: true,
		isVisibleExpression: '$(options:target) == "specific"',
	},
] as const satisfies SomeCompanionActionInputField[];

export const abortUploadJobs = createModuleAction<typeof options>(
	{
		name: 'Abort Upload Jobs',
		async callback(companionModule, action) {
			await runSavonaAction(companionModule, 'aborting upload jobs', async (client) => {
				await client.uploadJobs.fetchValue();

				const ids =
					action.options.target === 'specific'
						? getSpecificUploadJobIds(action.options.jobIds)
						: getUploadJobIds(client.uploadJobs.jobs.values(), (job) => {
								if (job.source !== 'Progress') return false;
								if (action.options.target === 'transferring') return job.statusCode === 100;
								if (action.options.target === 'waiting') return job.statusCode === 0;
								return job.status !== 'Completed' && job.status !== 'Aborted';
							});
				assertUploadJobIds(ids, 'abort target');

				await client.uploadJobs.abortJobs(ids);
			});
		},
	},
	options,
);
