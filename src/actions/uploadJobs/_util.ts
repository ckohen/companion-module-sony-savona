import type { UploadJob } from '@ckohen/savona';
import { parseNumberList } from '../_util.js';

export function getSpecificUploadJobIds(value: string | undefined): number[] {
	const ids = parseNumberList(value);
	if (!ids.length) throw new Error('At least one upload job ID is required');
	return ids;
}

export function getUploadJobIds(jobs: Iterable<UploadJob>, predicate: (job: UploadJob) => boolean): number[] {
	return Array.from(jobs)
		.filter((job) => predicate(job))
		.map((job) => job.id);
}

export function assertUploadJobIds(ids: number[], actionName: string): void {
	if (!ids.length) throw new Error(`No upload jobs matched ${actionName}`);
}
