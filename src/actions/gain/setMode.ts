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

export const setGainMode = createModuleAction<typeof options>(
	{
		name: 'Set Gain Mode',
		async callback(companionModule, action) {
			await runSavonaAction(companionModule, 'setting gain mode', async (client) => {
				await client.gain.setMode(action.options.mode === 'Automatic' ? 'Automatic' : 'Manual');
			});
		},
	},
	options,
);
