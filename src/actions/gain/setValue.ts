import { SomeCompanionActionInputField } from '@companion-module/base';
import { createModuleAction } from '../index.js';
import { runSavonaAction } from '../_util.js';

const options = [
	{
		type: 'dropdown',
		id: 'value',
		label: 'Gain',
		default: 0,
		choices: [-3, 0, 3, 6, 9, 12, 15, 18].map((value) => ({ id: value, label: `${value} dB` })),
	},
] as const satisfies SomeCompanionActionInputField[];

export const setGainValue = createModuleAction<typeof options>(
	{
		name: 'Set Gain Value',
		async callback(companionModule, action) {
			await runSavonaAction(companionModule, 'setting gain value', async (client) => {
				await client.gain.setValue(Number(action.options.value ?? 0));
			});
		},
	},
	options,
);
