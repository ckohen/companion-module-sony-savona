import { SomeCompanionActionInputField } from '@companion-module/base';
import { createModuleAction } from '../index.js';
import { runSavonaAction } from '../_util.js';

const options = [
	{
		type: 'dropdown',
		id: 'mode',
		label: 'Mode',
		default: 'Manual',
		choices: [
			{ id: 'Automatic', label: 'Automatic' },
			{ id: 'Manual', label: 'Manual' },
		],
	},
] as const satisfies SomeCompanionActionInputField[];

export const setWhiteBalanceTrackingMode = createModuleAction<typeof options>(
	{
		name: 'Set White Balance Tracking Mode',
		async callback(companionModule, action) {
			await runSavonaAction(companionModule, 'setting white balance tracking mode', async (client) => {
				await client.whiteBalance.setTrackingMode(action.options.mode === 'Automatic' ? 'Automatic' : 'Manual');
			});
		},
	},
	options,
);
