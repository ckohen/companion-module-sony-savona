import { SomeCompanionActionInputField } from '@companion-module/base';
import { createModuleAction } from '../index.js';
import { runSavonaAction } from '../_util.js';

const options = [
	{
		type: 'number',
		id: 'value',
		label: 'Iris Value',
		min: 0,
		max: 9999,
		default: 0,
	},
	{
		type: 'checkbox',
		id: 'closed',
		label: 'Closed',
		default: false,
	},
] as const satisfies SomeCompanionActionInputField[];

export const setIrisValue = createModuleAction<typeof options>(
	{
		name: 'Set Iris Value',
		async callback(companionModule, action) {
			await runSavonaAction(companionModule, 'setting iris value', async (client) => {
				await client.iris.setValue(action.options.value ?? 0, action.options.closed === true);
			});
		},
	},
	options,
);
