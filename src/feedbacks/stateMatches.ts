import { combineRgb, SomeCompanionFeedbackInputField } from '@companion-module/base';
import type { ModuleInstance } from '../main.js';
import { getVariableChoices, getVariableValue } from '../state/variables.js';
import { createModuleBooleanFeedback } from './index.js';

function generateOptions(companionModule: ModuleInstance) {
	const variableChoices = getVariableChoices(companionModule);

	return [
		{
			type: 'dropdown',
			id: 'variableId',
			label: 'State',
			default: variableChoices.find((choice) => choice.id === 'record_status')?.id ?? variableChoices[0]?.id ?? '',
			choices: variableChoices,
			minChoicesForSearch: 8,
		},
		{
			type: 'dropdown',
			id: 'operator',
			label: 'Operator',
			default: 'equals',
			disableAutoExpression: true,
			choices: [
				{ id: 'equals', label: 'Equals' },
				{ id: 'notEquals', label: 'Does Not Equal' },
				{ id: 'contains', label: 'Contains' },
				{ id: 'greaterThan', label: 'Greater Than' },
				{ id: 'lessThan', label: 'Less Than' },
			],
		},
		{
			type: 'textinput',
			id: 'expectedValue',
			label: 'Value',
			default: 'Recording',
		},
	] as const satisfies SomeCompanionFeedbackInputField[];
}

export const stateMatches = createModuleBooleanFeedback<ReturnType<typeof generateOptions>>(
	{
		name: 'Camera State Matches',
		defaultStyle: {
			bgcolor: combineRgb(0, 160, 80),
			color: combineRgb(255, 255, 255),
		},
		callback(companionModule, feedback) {
			const value = getVariableValue(companionModule, feedback.options.variableId?.toString());
			if (value === undefined || value === null) return false;
			const actual = valueToString(value);
			const expected = feedback.options.expectedValue ?? '';

			switch (feedback.options.operator) {
				case 'notEquals':
					return actual !== expected;
				case 'contains':
					return actual.includes(expected);
				case 'greaterThan':
				case 'lessThan':
					if (!actual.trim() || !expected.trim()) return false;
					if (!Number.isFinite(Number(actual)) || !Number.isFinite(Number(expected))) return false;
					return feedback.options.operator === 'greaterThan'
						? Number(actual) > Number(expected)
						: Number(actual) < Number(expected);
				case 'equals':
				default:
					return actual === expected;
			}
		},
	},
	generateOptions,
);

function valueToString(value: unknown): string {
	if (value === undefined) return '';
	if (value === null) return 'null';

	switch (typeof value) {
		case 'boolean':
		case 'number':
		case 'string':
			return String(value);
		default:
			return JSON.stringify(value) ?? '';
	}
}
