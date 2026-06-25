import type { WhiteBalanceMode } from '@ckohen/savona';
import { SomeCompanionActionInputField } from '@companion-module/base';
import { createModuleAction } from '../index.js';
import { runSavonaAction } from '../_util.js';

const options = [
	{
		type: 'dropdown',
		id: 'mode',
		label: 'Mode',
		default: 'ATW',
		choices: [
			{ id: 'ATW', label: 'ATW' },
			{ id: 'Memory A', label: 'Memory A' },
			{ id: 'Memory B', label: 'Memory B' },
			{ id: 'Memory C', label: 'Memory C' },
			{ id: 'Preset', label: 'Preset' },
		],
	},
] as const satisfies SomeCompanionActionInputField[];

export const setWhiteBalanceMode = createModuleAction<typeof options>(
	{
		name: 'Set White Balance Mode',
		async callback(companionModule, action) {
			await runSavonaAction(companionModule, 'setting white balance mode', async (client) => {
				await client.whiteBalance.setMode(action.options.mode as WhiteBalanceMode);
			});
		},
	},
	options,
);
