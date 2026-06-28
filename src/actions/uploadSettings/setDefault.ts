import { SomeCompanionActionInputField } from '@companion-module/base';
import { createModuleAction } from '../index.js';
import { runSavonaAction } from '../_util.js';
import type { ModuleInstance } from '../../main.js';
import { getUploadSettingOptionData, parseUploadSettingId } from './_util.js';

function generateOptions(companionModule: ModuleInstance) {
	const uploadSettingOptionData = getUploadSettingOptionData(companionModule);

	return [
		{
			type: 'dropdown',
			id: 'uploadSettingId',
			label: 'Upload Setting',
			default: uploadSettingOptionData.defaultSettingId,
			choices: uploadSettingOptionData.choices,
		},
	] as const satisfies SomeCompanionActionInputField[];
}

export const setDefaultUploadSetting = createModuleAction<ReturnType<typeof generateOptions>>(
	{
		name: 'Set Default Upload Setting',
		async callback(companionModule, action) {
			await runSavonaAction(companionModule, 'setting default upload setting', async (client) => {
				await client.uploadSettings.setDefault(parseUploadSettingId(action.options.uploadSettingId));
				await companionModule.cacheCoordinator.refresh(['uploadSettings']);
			});
		},
	},
	generateOptions,
);
