import type { CompanionPresetDefinitions } from '@companion-module/base';
import type { ModuleInstanceTypes } from '../main.js';
import { baseStyle, presetColors } from './_util.js';

const stopToUploadDelayMs = 5_000;

export const recordingPresetIds = ['record_start', 'record_stop', 'record_stop_upload_latest'];

export function getRecordingPresetDefinitions(
	uploadSettingId: number,
): CompanionPresetDefinitions<ModuleInstanceTypes> {
	return {
		record_start: {
			name: 'Start Recording',
			type: 'simple',
			style: baseStyle('REC\nSTART', presetColors.red),
			feedbacks: [recordingFeedback()],
			steps: [
				{
					down: [{ actionId: 'startRecording', options: { target: 'main' } }],
					up: [],
				},
			],
		},
		record_stop: {
			name: 'Stop Recording',
			type: 'simple',
			style: baseStyle('REC\nSTOP', presetColors.dark),
			feedbacks: [recordingFeedback()],
			steps: [
				{
					down: [{ actionId: 'stopRecording', options: { target: 'main' } }],
					up: [],
				},
			],
		},
		record_stop_upload_latest: {
			name: 'Stop Recording and Upload Latest',
			type: 'simple',
			keywords: ['latest', 'finalize', 'upload'],
			style: baseStyle('STOP\nUPLOAD\nLAST', presetColors.dark),
			feedbacks: [
				recordingFeedback(),
				{
					feedbackId: 'uploadJobState',
					options: { state: 'transferring' },
					style: { bgcolor: presetColors.blue, color: presetColors.white },
				},
			],
			steps: [
				{
					down: [
						{ actionId: 'stopRecording', options: { target: 'main' } },
						{ actionId: 'internal:wait', options: { time: stopToUploadDelayMs } },
						{
							actionId: 'uploadLatestRecording',
							options: { driveId: 'auto', uploadSettingId, directory: '' },
						},
					],
					up: [],
				},
			],
		},
	};
}

function recordingFeedback() {
	return {
		feedbackId: 'recordingState',
		options: { state: 'recording' },
		style: { bgcolor: presetColors.red, color: presetColors.white },
	} as const;
}
