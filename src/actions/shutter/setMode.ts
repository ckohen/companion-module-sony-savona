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

export const setShutterMode = createModuleAction<typeof options>(
	{
		name: 'Set Shutter Mode',
		async callback(companionModule, action) {
			await runSavonaAction(companionModule, 'setting shutter mode', async (client) => {
				await client.shutter.setAutomaticValue(action.options.mode === 'Automatic' ? 'Automatic' : 'Manual');
			});
		},
	},
	options,
);
