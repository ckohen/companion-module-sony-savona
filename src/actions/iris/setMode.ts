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

export const setIrisMode = createModuleAction<typeof options>(
	{
		name: 'Set Iris Mode',
		async callback(companionModule, action) {
			await runSavonaAction(companionModule, 'setting iris mode', async (client) => {
				await client.iris.setAutomaticValue(action.options.mode === 'Automatic' ? 'Automatic' : 'Manual');
			});
		},
	},
	options,
);
