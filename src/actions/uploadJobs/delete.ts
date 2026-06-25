import { SomeCompanionActionInputField } from '@companion-module/base';
import { createModuleAction } from '../index.js';
import { runSavonaAction } from '../_util.js';
import { assertUploadJobIds, getSpecificUploadJobIds, getUploadJobIds } from './_util.js';

const options = [
	{
		type: 'dropdown',
		id: 'target',
		label: 'Target',
		default: 'failedOrAborted',
		disableAutoExpression: true,
		choices: [
			{ id: 'failedOrAborted', label: 'Failed/Aborted Jobs' },
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

export const deleteUploadJobs = createModuleAction<typeof options>(
	{
		name: 'Delete Upload Jobs',
		async callback(companionModule, action) {
			await runSavonaAction(companionModule, 'deleting upload jobs', async (client) => {
				await client.uploadJobs.fetchValue();

				const ids =
					action.options.target === 'specific'
						? getSpecificUploadJobIds(action.options.jobIds)
						: getUploadJobIds(client.uploadJobs.jobs.values(), (job) => {
								if (action.options.target === 'failed') return job.statusCode >= 400;
								if (action.options.target === 'aborted') return job.statusCode === 300;
								return job.statusCode === 300 || job.statusCode >= 400;
							});
				assertUploadJobIds(ids, 'delete target');

				await client.uploadJobs.deleteJobs(ids);
			});
		},
	},
	options,
);
