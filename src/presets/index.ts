import type { CompanionPresetDefinitions, CompanionPresetSection } from '@companion-module/base';
import { defaultUploadSettingId } from '../actions/uploadSettings/_util.js';
import type { ModuleInstance, ModuleInstanceTypes } from '../main.js';
import { getRecordingPresetDefinitions, recordingPresetIds } from './recording.js';
import { getStatusPresetDefinitions, statusPresetIds } from './status.js';
import { getUploadPresetDefinitions, uploadPresetIds } from './upload.js';

export function getPresets(
	companionModule: ModuleInstance,
): [CompanionPresetSection<ModuleInstanceTypes>[], CompanionPresetDefinitions<ModuleInstanceTypes>] {
	const uploadSettingId = companionModule.client?.uploadSettings.defaultService ?? defaultUploadSettingId;

	return [
		[
			{
				id: 'recording',
				name: 'Recording',
				definitions: recordingPresetIds,
			},
			{
				id: 'upload',
				name: 'Upload',
				definitions: uploadPresetIds,
			},
			{
				id: 'status',
				name: 'Status',
				definitions: statusPresetIds,
			},
		],
		{
			...getRecordingPresetDefinitions(uploadSettingId),
			...getUploadPresetDefinitions(uploadSettingId),
			...getStatusPresetDefinitions(),
		},
	];
}
