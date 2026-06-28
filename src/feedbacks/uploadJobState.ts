import { combineRgb } from '@companion-module/base';
import type { SomeCompanionFeedbackInputField } from '@companion-module/base';
import type { UploadJob } from '@ckohen/savona';
import { getConnectedClient } from './_util.js';
import { createModuleBooleanFeedback } from './index.js';

function generateOptions() {
	return [
		{
			type: 'dropdown',
			id: 'state',
			label: 'State',
			default: 'transferring',
			choices: [
				{ id: 'transferring', label: 'Transferring' },
				{ id: 'waiting', label: 'Waiting' },
				{ id: 'incomplete', label: 'Incomplete' },
				{ id: 'failed', label: 'Failed' },
				{ id: 'aborted', label: 'Aborted' },
				{ id: 'completed', label: 'Completed' },
				{ id: 'any', label: 'Any Job' },
				{ id: 'idle', label: 'No Active Upload' },
			],
		},
	] as const satisfies SomeCompanionFeedbackInputField[];
}

export const uploadJobState = createModuleBooleanFeedback<ReturnType<typeof generateOptions>>(
	{
		name: 'Upload Job State',
		defaultStyle: {
			bgcolor: combineRgb(0, 95, 170),
			color: combineRgb(255, 255, 255),
		},
		callback(companionModule, feedback) {
			const client = getConnectedClient(companionModule);
			if (!client) return false;

			const jobs = [...client.uploadJobs.jobs.values()];
			switch (feedback.options.state) {
				case 'waiting':
					return jobs.some((job) => job.statusCode === 0);
				case 'incomplete':
					return jobs.some(isIncompleteJob);
				case 'failed':
					return jobs.some((job) => job.statusCode >= 400);
				case 'aborted':
					return jobs.some((job) => job.statusCode === 300);
				case 'completed':
					return jobs.some((job) => job.statusCode === 200);
				case 'any':
					return jobs.length > 0;
				case 'idle':
					return !jobs.some((job) => job.statusCode === 0 || job.statusCode === 100);
				case 'transferring':
				default:
					return jobs.some((job) => job.statusCode === 100);
			}
		},
	},
	generateOptions,
);

function isIncompleteJob(job: UploadJob): boolean {
	return job.statusCode === 0 || job.statusCode === 100 || job.statusCode >= 400;
}
