import { SomeCompanionActionInputField } from '@companion-module/base';
import { createModuleAction } from '../index.js';
import { optionalText, runSavonaAction } from '../_util.js';

const options = [
	{
		type: 'textinput',
		id: 'clipName',
		label: 'Proxy Clip Name',
		default: '',
		useVariables: true,
	},
] as const satisfies SomeCompanionActionInputField[];

export const deleteProxyClip = createModuleAction<typeof options>(
	{
		name: 'Delete Proxy Clip',
		description: 'Deletes a proxy clip from media.3 when supported by the camera.',
		async callback(companionModule, action) {
			await runSavonaAction(companionModule, 'deleting proxy clip', async (client) => {
				const clipName = optionalText(action.options.clipName);
				if (!clipName) throw new Error('Clip name is required');

				await client.mediaCards.deleteClip('media.3', clipName);
			});
		},
	},
	options,
);
