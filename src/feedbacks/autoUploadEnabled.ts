import { combineRgb } from '@companion-module/base';
import type { SomeCompanionFeedbackInputField } from '@companion-module/base';
import { getConnectedClient } from './_util.js';
import { createModuleBooleanFeedback } from './index.js';

function generateOptions() {
	return [] as const satisfies SomeCompanionFeedbackInputField[];
}

export const autoUploadEnabled = createModuleBooleanFeedback<ReturnType<typeof generateOptions>>(
	{
		name: 'Auto Upload Enabled',
		defaultStyle: {
			bgcolor: combineRgb(0, 95, 170),
			color: combineRgb(255, 255, 255),
		},
		callback(companionModule) {
			const client = getConnectedClient(companionModule);
			return client?.autoUpload.enabled === true;
		},
	},
	generateOptions,
);
