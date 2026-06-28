import type { MediaDriveId, RecordStatus } from '@ckohen/savona';
import { SomeCompanionActionInputField } from '@companion-module/base';
import type { ModuleInstance } from '../../main.js';
import { optionalText, runSavonaAction } from '../_util.js';
import { createModuleAction } from '../index.js';
import { getUploadSettingOptionData, parseUploadSettingId } from '../uploadSettings/_util.js';

const autoDriveId = 'auto';
type LatestRecordingDriveId = Exclude<MediaDriveId, 'media.3'>;
const autoSearchDriveIds = ['media.1', 'media.2'] as const satisfies LatestRecordingDriveId[];
const activeRecordingStatuses = new Set<RecordStatus>(['Recording', 'RecordingWithCall', 'RecPausing', 'Stopping']);

function generateOptions(companionModule: ModuleInstance) {
	const uploadSettingOptionData = getUploadSettingOptionData(companionModule);

	return [
		{
			type: 'dropdown',
			id: 'driveId',
			label: 'Card',
			default: autoDriveId,
			choices: [
				{ id: autoDriveId, label: 'Auto (Card A, Card B)' },
				{ id: 'media.1', label: 'Card A' },
				{ id: 'media.2', label: 'Card B' },
				{ id: 'extdisc', label: 'External Disc' },
			],
		},
		{
			type: 'dropdown',
			id: 'uploadSettingId',
			label: 'Upload Setting',
			default: uploadSettingOptionData.defaultSettingId,
			choices: uploadSettingOptionData.choices,
		},
		{
			type: 'textinput',
			id: 'directory',
			label: 'Upload Directory',
			default: '',
		},
	] as const satisfies SomeCompanionActionInputField[];
}

export const uploadLatestRecording = createModuleAction<ReturnType<typeof generateOptions>>(
	{
		name: 'Upload Latest Recording',
		description: 'Fetches the camera clip counter and uploads the previous completed main clip from media.',
		async callback(companionModule, action) {
			await runSavonaAction(companionModule, 'uploading latest recording', async (client) => {
				const [cameraClipName, clipInfo] = await Promise.all([
					client.clipInfo.fetchName(),
					client.clipInfo.fetchValue(),
				]);
				const clipName = getCompletedClipName(optionalText(cameraClipName), clipInfo.status);

				const driveIds = getSearchDriveIds(action.options.driveId);
				for (const driveId of driveIds) {
					const clips = await client.mediaCards.fetchClips(driveId);
					const clip = clips.find((entry) => entry.name === clipName);
					if (clip) {
						const uploadSettingId = parseUploadSettingId(action.options.uploadSettingId);
						return clip.upload(uploadSettingId, optionalText(action.options.directory));
					}
				}

				throw new Error(`Latest clip not found on ${formatDriveIds(driveIds)}: ${clipName}`);
			});
		},
	},
	generateOptions,
);

function getCompletedClipName(cameraClipName: string | undefined, status: RecordStatus | undefined): string {
	if (!cameraClipName) throw new Error('Camera clip name is not available');
	if (status !== undefined && activeRecordingStatuses.has(status)) return cameraClipName;

	const previousClipName = previousClipNameFromNextName(cameraClipName);
	if (!previousClipName) {
		throw new Error(`Unable to derive the latest completed clip name from camera clip name: ${cameraClipName}`);
	}

	return previousClipName;
}

function previousClipNameFromNextName(clipName: string): string | undefined {
	const match = /^(.*?)(\d+)$/.exec(clipName);
	if (!match) return undefined;

	const [, prefix, counterText] = match;
	if (prefix === undefined || counterText === undefined) return undefined;

	const counter = Number(counterText);
	if (!Number.isInteger(counter) || counter <= 0) return undefined;

	return `${prefix}${String(counter - 1).padStart(counterText.length, '0')}`;
}

function getSearchDriveIds(value: string | number | undefined): LatestRecordingDriveId[] {
	if (value === undefined || value === autoDriveId) return [...autoSearchDriveIds];
	if (isLatestRecordingDriveId(value)) return [value];
	throw new Error('Card is required');
}

function isLatestRecordingDriveId(value: string | number): value is LatestRecordingDriveId {
	return value === 'media.1' || value === 'media.2' || value === 'extdisc';
}

function formatDriveIds(driveIds: LatestRecordingDriveId[]): string {
	return driveIds.map((driveId) => driveIdLabels[driveId]).join(', ');
}

const driveIdLabels: Record<LatestRecordingDriveId, string> = {
	'media.1': 'Card A',
	'media.2': 'Card B',
	extdisc: 'External Disc',
};
