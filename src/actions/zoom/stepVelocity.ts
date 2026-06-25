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
		default: 1,
	},
] as const satisfies SomeCompanionActionInputField[];

export const stepZoomVelocity = createModuleAction<typeof options>(
	{
		name: 'Step Zoom',
		async callback(companionModule, action) {
			await runSavonaAction(companionModule, 'stepping zoom', async (client) => {
				await client.zoom.velocityStep(action.options.velocity ?? 1);
			});
		},
	},
	options,
);
