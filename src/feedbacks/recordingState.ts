import { combineRgb } from '@companion-module/base';
import type { SomeCompanionFeedbackInputField } from '@companion-module/base';
import { getConnectedClient } from './_util.js';
import { createModuleBooleanFeedback } from './index.js';

function generateOptions() {
	return [
		{
			type: 'dropdown',
			id: 'state',
			label: 'State',
			default: 'recording',
			choices: [
				{ id: 'recording', label: 'Recording' },
				{ id: 'recordingOrPaused', label: 'Recording or Paused' },
				{ id: 'notRecording', label: 'Not Recording' },
				{ id: 'standby', label: 'Standby' },
				{ id: 'ready', label: 'Ready' },
				{ id: 'noMedia', label: 'No Media' },
				{ id: 'playing', label: 'Playing' },
			],
		},
	] as const satisfies SomeCompanionFeedbackInputField[];
}

export const recordingState = createModuleBooleanFeedback<ReturnType<typeof generateOptions>>(
	{
		name: 'Recording State',
		defaultStyle: {
			bgcolor: combineRgb(180, 0, 0),
			color: combineRgb(255, 255, 255),
		},
		callback(companionModule, feedback) {
			const client = getConnectedClient(companionModule);
			if (!client) return false;

			const status = client.record.status;
			switch (feedback.options.state) {
				case 'recordingOrPaused':
					return ['Recording', 'RecordingWithCall', 'RecPausing'].includes(status);
				case 'notRecording':
					return !['Recording', 'RecordingWithCall'].includes(status);
				case 'standby':
					return status === 'Standby';
				case 'ready':
					return status === 'Ready';
				case 'noMedia':
					return status === 'NoMedia';
				case 'playing':
					return status === 'Playing';
				case 'recording':
				default:
					return ['Recording', 'RecordingWithCall'].includes(status);
			}
		},
	},
	generateOptions,
);
