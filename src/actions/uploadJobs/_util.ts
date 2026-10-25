import type { UploadJob } from '@ckohen/savona';

export function getSpecificUploadJobIds(value: string | undefined): number[] {
	const entries = value?.split(/[\s,]+/).filter(Boolean) ?? [];
	if (!entries.length) throw new Error('At least one upload job ID is required');
	const ids = entries.map((entry) => {
		const id = Number(entry);
		if (!/^\d+$/.test(entry) || !Number.isSafeInteger(id)) {
			throw new Error(`Invalid upload job ID: ${entry}`);
		}
		return id;
	});
	return [...new Set(ids)];
}

export function getUploadJobIds(jobs: Iterable<UploadJob>, predicate: (job: UploadJob) => boolean): number[] {
	return Array.from(jobs)
		.filter((job) => predicate(job))
		.map((job) => job.id);
}

export function assertUploadJobIds(ids: number[], actionName: string): void {
	if (!ids.length) throw new Error(`No upload jobs matched ${actionName}`);
}
