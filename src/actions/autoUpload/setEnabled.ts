import { SomeCompanionActionInputField } from '@companion-module/base';
import { createModuleAction } from '../index.js';
import { runSavonaAction } from '../_util.js';

const options = [
	{
		type: 'checkbox',
		id: 'enabled',
		label: 'Enabled',
		default: true,
	},
] as const satisfies SomeCompanionActionInputField[];

export const setAutoUploadEnabled = createModuleAction<typeof options>(
	{
		name: 'Set Auto Upload',
		async callback(companionModule, action) {
			await runSavonaAction(companionModule, 'setting auto upload', async (client) => {
				await client.autoUpload.setValue(action.options.enabled === true);
			});
		},
	},
	options,
);
