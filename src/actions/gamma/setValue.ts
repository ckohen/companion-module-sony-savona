import type { GammaValue } from '@ckohen/savona';
import { SomeCompanionActionInputField } from '@companion-module/base';
import { runSavonaAction } from '../_util.js';
import { createModuleAction } from '../index.js';

const options = [
	{
		type: 'dropdown',
		id: 'value',
		label: 'Gamma',
		default: 'STD5',
		choices: [
			{ id: 'STD1', label: 'STD1 (DVW)' },
			{ id: 'STD2', label: 'STD2 (x4.5)' },
			{ id: 'STD3', label: 'STD3 (x3.5)' },
			{ id: 'STD4', label: 'STD4 (240M)' },
			{ id: 'STD5', label: 'STD5 (R709)' },
			{ id: 'STD6', label: 'STD6 (x5.0)' },
			{ id: 'HG1', label: 'HG1 (3250G36)' },
			{ id: 'HG2', label: 'HG2 (4600G30)' },
			{ id: 'HG3', label: 'HG3 (3259G40)' },
			{ id: 'HG4', label: 'HG4 (4609G33)' },
		],
	},
] as const satisfies SomeCompanionActionInputField[];

export const setGammaValue = createModuleAction<typeof options>(
	{
		name: 'Set Gamma Value',
		async callback(companionModule, action) {
			await runSavonaAction(companionModule, 'setting gamma value', async (client) => {
				await client.gamma.setValue(action.options.value as GammaValue);
			});
		},
	},
	options,
);
