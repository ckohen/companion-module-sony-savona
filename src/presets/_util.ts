import { combineRgb, type CompanionButtonStepActions, type CompanionButtonStyleProps } from '@companion-module/base';
import type { ModuleInstanceTypes } from '../main.js';

export const presetColors = {
	white: combineRgb(255, 255, 255),
	black: combineRgb(0, 0, 0),
	dark: combineRgb(15, 15, 15),
	red: combineRgb(180, 0, 0),
	green: combineRgb(0, 145, 70),
	blue: combineRgb(0, 95, 170),
	amber: combineRgb(210, 145, 0),
} as const;

export function baseStyle(text: string): CompanionButtonStyleProps {
	return {
		text,
		size: 'auto',
		color: presetColors.white,
		bgcolor: presetColors.dark,
	};
}

export function emptyStep(): CompanionButtonStepActions<ModuleInstanceTypes> {
	return { down: [], up: [] };
}
