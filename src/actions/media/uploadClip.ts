import type { MediaDriveId } from '@ckohen/savona';
import { SomeCompanionActionInputField } from '@companion-module/base';
import { createModuleAction } from '../index.js';
import { optionalText, runSavonaAction } from '../_util.js';
import type { ModuleInstance } from '../../main.js';
import { getUploadSettingOptionData, parseUploadSettingId } from '../uploadSettings/_util.js';

function generateOptions(companionModule: ModuleInstance) {
	const uploadSettingOptionData = getUploadSettingOptionData(companionModule);

	return [
		{
			type: 'dropdown',
			id: 'driveId',
			label: 'Card',
			default: 'media.2',
			choices: [
				{ id: 'media.1', label: 'Card A' },
				{ id: 'media.2', label: 'Card B' },
				{ id: 'media.3', label: 'Proxy Card' },
				{ id: 'extdisc', label: 'External Disc' },
			],
		},
		{
			type: 'textinput',
			id: 'clipName',
			label: 'Clip Name',
			default: '',
			useVariables: true,
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

export const uploadClip = createModuleAction<ReturnType<typeof generateOptions>>(
	{
		name: 'Upload Clip',
		async callback(companionModule, action) {
			await runSavonaAction(companionModule, 'uploading clip', async (client) => {
				const clipName = optionalText(action.options.clipName);
				if (!clipName) throw new Error('Clip name is required');

				const clips = await client.mediaCards.fetchClips(action.options.driveId as MediaDriveId);
				const clip = clips.find((entry) => entry.name === clipName);
				if (!clip) throw new Error(`Clip not found: ${clipName}`);

				const uploadSettingId = parseUploadSettingId(action.options.uploadSettingId);

				return clip.upload(uploadSettingId, optionalText(action.options.directory));
			});
		},
	},
	generateOptions,
);
