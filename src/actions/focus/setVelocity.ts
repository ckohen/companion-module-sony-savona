import { SomeCompanionActionInputField } from '@companion-module/base';
import { createModuleAction } from '../index.js';
import { runSavonaAction } from '../_util.js';

const options = [
	{
		type: 'number',
		id: 'velocity',
		label: 'Velocity',
		min: -8,
		max: 8,
		default: 0,
	},
] as const satisfies SomeCompanionActionInputField[];

export const setFocusVelocity = createModuleAction<typeof options>(
	{
		name: 'Set Focus Velocity',
		description: 'Set to 0 to stop focus movement.',
		async callback(companionModule, action) {
			await runSavonaAction(companionModule, 'setting focus velocity', async (client) => {
				await client.focus.setVelocity(action.options.velocity ?? 0);
			});
		},
	},
	options,
);
