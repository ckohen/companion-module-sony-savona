import type { DropdownChoice } from '@companion-module/base';
import type { ModuleInstance } from '../../main.js';

export const defaultUploadSettingId = 1001;

interface UploadSettingOptionData {
	choices: DropdownChoice<number>[];
	defaultSettingId: number;
}

export function getUploadSettingOptionData(companionModule: ModuleInstance): UploadSettingOptionData {
	const uploadSettings = Array.from(companionModule.client?.uploadSettings.settings.values() ?? []).sort(
		(settingA, settingB) => settingA.id - settingB.id,
	);
	const defaultSettingId =
		companionModule.client?.uploadSettings.defaultService ??
		uploadSettings.find((setting) => setting.isDefault)?.id ??
		uploadSettings[0]?.id ??
		defaultUploadSettingId;
	const choices = uploadSettings.length
		? uploadSettings.map((setting) => ({
				id: setting.id,
				label: `${setting.displayName || 'Upload Setting'} (${setting.id})${setting.isDefault ? ' - Default' : ''}`,
			}))
		: [{ id: defaultSettingId, label: `Upload Setting ${defaultSettingId}` }];

	return { choices, defaultSettingId };
}

export function parseUploadSettingId(value: string | number | undefined): number {
	const uploadSettingId = Number(value ?? defaultUploadSettingId);
	if (!Number.isInteger(uploadSettingId)) throw new Error('Upload setting is required');
	return uploadSettingId;
}
