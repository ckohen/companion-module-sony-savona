import { SomeCompanionActionInputField } from '@companion-module/base';
import { createModuleAction } from '../index.js';
import { runSavonaAction } from '../_util.js';

const options = [
	{
		type: 'number',
		id: 'value',
		label: 'Color Temperature',
		min: 1500,
		max: 20000,
		default: 5600,
	},
] as const satisfies SomeCompanionActionInputField[];

export const setWhiteBalanceValue = createModuleAction<typeof options>(
	{
		name: 'Set White Balance Value',
		async callback(companionModule, action) {
			await runSavonaAction(companionModule, 'setting white balance value', async (client) => {
				await client.whiteBalance.setValue(action.options.value ?? 5600);
			});
		},
	},
	options,
);
