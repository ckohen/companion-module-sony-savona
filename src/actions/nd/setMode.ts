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

export const setNdMode = createModuleAction<typeof options>(
	{
		name: 'Set ND Mode',
		async callback(companionModule, action) {
			await runSavonaAction(companionModule, 'setting ND mode', async (client) => {
				await client.ND.setAutomaticValue(action.options.mode === 'Automatic' ? 'Automatic' : 'Manual');
			});
		},
	},
	options,
);
