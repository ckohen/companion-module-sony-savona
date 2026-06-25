import { SomeCompanionActionInputField } from '@companion-module/base';
import { createModuleAction } from '../index.js';
import { runSavonaAction } from '../_util.js';

const options = [
	{
		type: 'number',
		id: 'value',
		label: 'ND Value',
		min: 1,
		max: 128,
		default: 1,
	},
] as const satisfies SomeCompanionActionInputField[];

export const setNdValue = createModuleAction<typeof options>(
	{
		name: 'Set ND Value',
		async callback(companionModule, action) {
			await runSavonaAction(companionModule, 'setting ND value', async (client) => {
				await client.ND.setValue(action.options.value ?? 1);
			});
		},
	},
	options,
);
