import { combineRgb } from '@companion-module/base';
import type { SomeCompanionFeedbackInputField } from '@companion-module/base';
import { getConnectedClient } from './_util.js';
import { createModuleBooleanFeedback } from './index.js';

function generateOptions() {
	return [
		{
			type: 'dropdown',
			id: 'permission',
			label: 'Permission',
			default: 'writeAndExecute',
			choices: [
				{ id: 'writeAndExecute', label: 'Write and Execute' },
				{ id: 'read', label: 'Read' },
				{ id: 'write', label: 'Write' },
				{ id: 'execute', label: 'Execute' },
				{ id: 'all', label: 'All' },
			],
		},
	] as const satisfies SomeCompanionFeedbackInputField[];
}

export const remoteControlAllowed = createModuleBooleanFeedback<ReturnType<typeof generateOptions>>(
	{
		name: 'Remote Control Allowed',
		defaultStyle: {
			bgcolor: combineRgb(0, 145, 70),
			color: combineRgb(255, 255, 255),
		},
		callback(companionModule, feedback) {
			const client = getConnectedClient(companionModule);
			if (!client) return false;

			switch (feedback.options.permission) {
				case 'read':
					return client.globalStatus.read;
				case 'write':
					return client.globalStatus.write;
				case 'execute':
					return client.globalStatus.execute;
				case 'all':
					return client.globalStatus.read && client.globalStatus.write && client.globalStatus.execute;
				case 'writeAndExecute':
				default:
					return client.globalStatus.write && client.globalStatus.execute;
			}
		},
	},
	generateOptions,
);
