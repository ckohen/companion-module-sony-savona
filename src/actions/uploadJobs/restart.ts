import { SomeCompanionActionInputField } from '@companion-module/base';
import { createModuleAction } from '../index.js';
import { runSavonaAction } from '../_util.js';
import { assertUploadJobIds, getSpecificUploadJobIds, getUploadJobIds } from './_util.js';

const options = [
	{
		type: 'dropdown',
		id: 'target',
		label: 'Target',
		default: 'restartable',
		disableAutoExpression: true,
		choices: [
			{ id: 'restartable', label: 'Failed/Aborted Jobs' },
			{ id: 'failed', label: 'Failed Jobs' },
			{ id: 'aborted', label: 'Aborted Jobs' },
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

export const restartUploadJobs = createModuleAction<typeof options>(
	{
		name: 'Restart Upload Jobs',
		async callback(companionModule, action) {
			await runSavonaAction(companionModule, 'restarting upload jobs', async (client) => {
				await client.uploadJobs.fetchValue();

				const ids =
					action.options.target === 'specific'
						? getSpecificUploadJobIds(action.options.jobIds)
						: getUploadJobIds(client.uploadJobs.jobs.values(), (job) => {
								if (job.source !== 'History') return false;
								if (action.options.target === 'failed') return job.statusCode >= 400;
								if (action.options.target === 'aborted') return job.statusCode === 300;
								return job.statusCode === 300 || job.statusCode >= 400;
							});
				assertUploadJobIds(ids, 'restart target');

				await client.uploadJobs.restartJobs(ids);
			});
		},
	},
	options,
);
