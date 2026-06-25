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

export const stepFocusVelocity = createModuleAction<typeof options>(
	{
		name: 'Step Focus',
		async callback(companionModule, action) {
			await runSavonaAction(companionModule, 'stepping focus', async (client) => {
				await client.focus.velocityStep(action.options.velocity ?? 1);
			});
		},
	},
	options,
);
