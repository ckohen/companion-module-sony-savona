import { SomeCompanionActionInputField } from '@companion-module/base';
import { createModuleAction } from '../index.js';
import { runSavonaAction } from '../_util.js';

const options = [
	{
		type: 'checkbox',
		id: 'enabled',
		label: 'Enabled',
		default: true,
	},
] as const satisfies SomeCompanionActionInputField[];

export const setColorBarsEnabled = createModuleAction<typeof options>(
	{
		name: 'Set Color Bars',
		async callback(companionModule, action) {
			await runSavonaAction(companionModule, 'setting color bars', async (client) => {
				await client.colorBars.setValue({ enabled: action.options.enabled === true });
			});
		},
	},
	options,
);
