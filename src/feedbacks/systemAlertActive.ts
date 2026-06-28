import { combineRgb } from '@companion-module/base';
import type { SomeCompanionFeedbackInputField } from '@companion-module/base';
import { getConnectedClient } from './_util.js';
import { createModuleBooleanFeedback } from './index.js';

function generateOptions() {
	return [
		{
			type: 'dropdown',
			id: 'severity',
			label: 'Severity',
			default: 'any',
			choices: [
				{ id: 'any', label: 'Any Alert' },
				{ id: 'error', label: 'Error' },
				{ id: 'warning', label: 'Warning' },
			],
		},
	] as const satisfies SomeCompanionFeedbackInputField[];
}

export const systemAlertActive = createModuleBooleanFeedback<ReturnType<typeof generateOptions>>(
	{
		name: 'System Alert Active',
		defaultStyle: {
			bgcolor: combineRgb(190, 45, 30),
			color: combineRgb(255, 255, 255),
		},
		callback(companionModule, feedback) {
			const client = getConnectedClient(companionModule);
			if (!client) return false;

			const severity = feedback.options.severity?.toString();
			return client.systemMessages.activeMessages.some((message) => severity === 'any' || message.type === severity);
		},
	},
	generateOptions,
);
