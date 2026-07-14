import type { CompanionPresetDefinitions } from '@companion-module/base';
import type { ModuleInstanceTypes } from '../main.js';
import { baseStyle, emptyStep, presetColors } from './_util.js';

export const statusPresetIds = [
	'remote_control_allowed',
	'system_alert',
	'card_a_record_target',
	'card_b_record_target',
];

export function getStatusPresetDefinitions(): CompanionPresetDefinitions<ModuleInstanceTypes> {
	return {
		remote_control_allowed: {
			name: 'Remote Control Allowed',
			type: 'simple',
			style: baseStyle('REMOTE\nCONTROL'),
			feedbacks: [
				{
					feedbackId: 'remoteControlAllowed',
					options: { permission: 'writeAndExecute' },
					style: { bgcolor: presetColors.green, color: presetColors.white },
				},
			],
			steps: [emptyStep()],
		},
		system_alert: {
			name: 'System Alert',
			type: 'simple',
			style: baseStyle('SYSTEM\nALERT'),
			feedbacks: [
				{
					feedbackId: 'systemAlertActive',
					options: { severity: 'any' },
					style: { bgcolor: presetColors.red, color: presetColors.white },
				},
			],
			steps: [emptyStep()],
		},
		card_a_record_target: {
			name: 'Card A Record Target',
			type: 'simple',
			style: baseStyle('CARD A\nREC TARGET'),
			feedbacks: [
				{
					feedbackId: 'mediaCardState',
					options: { card: 'a', state: 'recordTarget', availableTimeThreshold: 5 },
					style: { bgcolor: presetColors.red, color: presetColors.white },
				},
			],
			steps: [emptyStep()],
		},
		card_b_record_target: {
			name: 'Card B Record Target',
			type: 'simple',
			style: baseStyle('CARD B\nREC TARGET'),
			feedbacks: [
				{
					feedbackId: 'mediaCardState',
					options: { card: 'b', state: 'recordTarget', availableTimeThreshold: 5 },
					style: { bgcolor: presetColors.red, color: presetColors.white },
				},
			],
			steps: [emptyStep()],
		},
	};
}
