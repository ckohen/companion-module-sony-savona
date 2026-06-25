import { SomeCompanionActionInputField } from '@companion-module/base';
import { createModuleAction } from '../index.js';
import { runSavonaAction } from '../_util.js';

const options = [
	{
		type: 'dropdown',
		id: 'target',
		label: 'Target',
		default: 'main',
		choices: [
			{ id: 'main', label: 'Main' },
			{ id: 'proxy', label: 'Proxy' },
		],
	},
] as const satisfies SomeCompanionActionInputField[];

export const stopRecording = createModuleAction<typeof options>(
	{
		name: 'Stop Recording',
		async callback(companionModule, action) {
			await runSavonaAction(companionModule, 'stopping recording', async (client) => {
				await client.record.stop(action.options.target !== 'proxy');
			});
		},
	},
	options,
);
