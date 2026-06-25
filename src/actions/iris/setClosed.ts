import { SomeCompanionActionInputField } from '@companion-module/base';
import { createModuleAction } from '../index.js';
import { runSavonaAction } from '../_util.js';

const options = [
	{
		type: 'checkbox',
		id: 'closed',
		label: 'Closed',
		default: true,
	},
] as const satisfies SomeCompanionActionInputField[];

export const setIrisClosed = createModuleAction<typeof options>(
	{
		name: 'Set Iris Closed',
		async callback(companionModule, action) {
			await runSavonaAction(companionModule, 'setting iris closed', async (client) => {
				await client.iris.setClosed(action.options.closed === true);
			});
		},
	},
	options,
);
