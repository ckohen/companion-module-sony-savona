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

export const setZoomVelocity = createModuleAction<typeof options>(
	{
		name: 'Set Zoom Velocity',
		description: 'Set to 0 to stop zoom movement.',
		async callback(companionModule, action) {
			await runSavonaAction(companionModule, 'setting zoom velocity', async (client) => {
				await client.zoom.setVelocity(action.options.velocity ?? 0);
			});
		},
	},
	options,
);
