import type { CompanionPresetDefinitions } from '@companion-module/base';
import type { ModuleInstanceTypes } from '../main.js';
import { baseStyle, presetColors } from './_util.js';

export const uploadPresetIds = [
	'upload_latest',
	'auto_upload_on',
	'auto_upload_off',
	'abort_uploads',
	'restart_failed_uploads',
	'clear_completed_uploads',
];

export function getUploadPresetDefinitions(uploadSettingId: number): CompanionPresetDefinitions<ModuleInstanceTypes> {
	return {
		upload_latest: {
			name: 'Upload Latest Recording',
			type: 'simple',
			keywords: ['latest'],
			style: baseStyle('UPLOAD\nLATEST', presetColors.blue),
			feedbacks: [
				{
					feedbackId: 'uploadJobState',
					options: { state: 'transferring' },
					style: { bgcolor: presetColors.blue, color: presetColors.white },
				},
			],
			steps: [
				{
					down: [{ actionId: 'uploadLatestRecording', options: { driveId: 'auto', uploadSettingId, directory: '' } }],
					up: [],
				},
			],
		},
		auto_upload_on: {
			name: 'Enable Auto Upload',
			type: 'simple',
			style: baseStyle('AUTO\nUPLOAD\nON', presetColors.blue),
			feedbacks: [
				{
					feedbackId: 'autoUploadEnabled',
					options: {},
					style: { bgcolor: presetColors.green, color: presetColors.white },
				},
			],
			steps: [
				{
					down: [{ actionId: 'setAutoUploadEnabled', options: { enabled: true } }],
					up: [],
				},
			],
		},
		auto_upload_off: {
			name: 'Disable Auto Upload',
			type: 'simple',
			style: baseStyle('AUTO\nUPLOAD\nOFF', presetColors.dark),
			feedbacks: [
				{
					feedbackId: 'autoUploadEnabled',
					options: {},
					isInverted: true,
					style: { bgcolor: presetColors.amber, color: presetColors.black },
				},
			],
			steps: [
				{
					down: [{ actionId: 'setAutoUploadEnabled', options: { enabled: false } }],
					up: [],
				},
			],
		},
		abort_uploads: {
			name: 'Abort Uploads',
			type: 'simple',
			style: baseStyle('ABORT\nUPLOADS', presetColors.dark),
			feedbacks: [
				{
					feedbackId: 'uploadJobState',
					options: { state: 'incomplete' },
					style: { bgcolor: presetColors.amber, color: presetColors.black },
				},
			],
			steps: [
				{
					down: [{ actionId: 'abortUploadJobs', options: { target: 'active', jobIds: '' } }],
					up: [],
				},
			],
		},
		restart_failed_uploads: {
			name: 'Restart Failed Uploads',
			type: 'simple',
			style: baseStyle('RESTART\nFAILED', presetColors.dark),
			feedbacks: [
				{
					feedbackId: 'uploadJobState',
					options: { state: 'failed' },
					style: { bgcolor: presetColors.red, color: presetColors.white },
				},
			],
			steps: [
				{
					down: [{ actionId: 'restartUploadJobs', options: { target: 'failed', jobIds: '' } }],
					up: [],
				},
			],
		},
		clear_completed_uploads: {
			name: 'Clear Completed Uploads',
			type: 'simple',
			style: baseStyle('CLEAR\nCOMPLETE', presetColors.dark),
			feedbacks: [
				{
					feedbackId: 'uploadJobState',
					options: { state: 'completed' },
					style: { bgcolor: presetColors.green, color: presetColors.white },
				},
			],
			steps: [
				{
					down: [{ actionId: 'clearCompletedUploadJobs', options: {} }],
					up: [],
				},
			],
		},
	};
}
