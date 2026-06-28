import type { CompanionPresetDefinitions } from '@companion-module/base';
import type { ModuleInstanceTypes } from '../main.js';
import { baseStyle, emptyStep, presetColors } from './_util.js';

export const statusPresetIds = ['remote_control_allowed', 'system_alert', 'card_a_recording', 'card_b_recording'];

export function getStatusPresetDefinitions(): CompanionPresetDefinitions<ModuleInstanceTypes> {
	return {
		remote_control_allowed: {
			name: 'Remote Control Allowed',
			type: 'simple',
			style: baseStyle('REMOTE\nCONTROL', presetColors.dark),
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
			style: baseStyle('SYSTEM\nALERT', presetColors.dark),
			feedbacks: [
				{
					feedbackId: 'systemAlertActive',
					options: { severity: 'any' },
					style: { bgcolor: presetColors.red, color: presetColors.white },
				},
			],
			steps: [emptyStep()],
		},
		card_a_recording: {
			name: 'Card A Recording',
			type: 'simple',
			style: baseStyle('CARD A\nREC', presetColors.dark),
			feedbacks: [
				{
					feedbackId: 'mediaCardState',
					options: { card: 'a', state: 'recording', availableTimeThreshold: 5 },
					style: { bgcolor: presetColors.red, color: presetColors.white },
				},
			],
			steps: [emptyStep()],
		},
		card_b_recording: {
			name: 'Card B Recording',
			type: 'simple',
			style: baseStyle('CARD B\nREC', presetColors.dark),
			feedbacks: [
				{
					feedbackId: 'mediaCardState',
					options: { card: 'b', state: 'recording', availableTimeThreshold: 5 },
					style: { bgcolor: presetColors.red, color: presetColors.white },
				},
			],
			steps: [emptyStep()],
		},
	};
}
