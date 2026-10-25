import type {
	CompanionActionSchema,
	CompanionPresetAction,
	CompanionPresetDefinitions,
	CompanionValueFeedbackSchema,
} from '@companion-module/base';
import {
	createModuleAdvancedFeedback,
	createModuleBooleanFeedback,
	createModuleValueFeedback,
} from '../src/feedbacks/index.js';
import type {
	ModuleBooleanFeedback,
	ModuleFeedbackOptionValues,
	ModuleValueFeedback,
} from '../src/feedbacks/_types.js';
import type { ModuleInstanceTypes } from '../src/main.js';

const options = [{ type: 'number', id: 'channel', label: 'Channel', min: 1, max: 4, default: 1 }] as const;

const numericFeedback = createModuleValueFeedback<typeof options, number | null>(
	{
		name: 'Numeric value',
		callback(_module, feedback) {
			return feedback.options.channel ?? null;
		},
	},
	options,
);
const narrowedValue: ModuleValueFeedback<typeof options, number | null> = numericFeedback;

const inferredFeedback = createModuleValueFeedback({ name: 'Inferred value', callback: () => 42 }, options);
const inferredValue: ModuleValueFeedback<typeof options, number> = inferredFeedback;

const invalidValue = createModuleValueFeedback<typeof options, number | null>(
	{
		name: 'Invalid value',
		// @ts-expect-error Numeric feedbacks must reject string results.
		callback: () => 'invalid',
	},
	options,
);

const invalidOptions: ModuleFeedbackOptionValues<typeof options> = {
	channel: 1,
	// @ts-expect-error Options must retain their declared field names.
	undeclared: 2,
};

const booleanFeedback = createModuleBooleanFeedback(
	{ name: 'Boolean value', defaultStyle: { color: '#ffffff', bgcolor: 'rgb(0, 80, 0)' }, callback: () => true },
	options,
);
const narrowedBoolean: ModuleBooleanFeedback<typeof options> = booleanFeedback;

const advancedFeedback = createModuleAdvancedFeedback(
	{
		name: 'Advanced colours',
		affectedProperties: ['color', 'bgcolor'],
		callback: () => ({ color: '#ffffff', bgcolor: 'rgb(80, 0, 0)' }),
	},
	options,
);

interface FixtureTypes extends ModuleInstanceTypes {
	actions: {
		read: CompanionActionSchema<Record<string, never>, number>;
		write: CompanionActionSchema<Record<string, never>, void>;
	};
	feedbacks: {
		level: CompanionValueFeedbackSchema<ModuleFeedbackOptionValues<typeof options>, number | null>;
	};
}

const presets = {
	level: {
		type: 'simple',
		name: 'Level',
		notes: 'Stores a returned value in a local variable.',
		style: { text: 'Level', size: 'auto', color: '#ffffff', bgcolor: 'rgb(0, 0, 0)' },
		steps: [
			{
				down: [
					{ actionId: 'read', options: {}, storeResult: { type: 'local-variable', variableName: 'level' } },
					{ actionId: 'internal:wait', options: { time: 100 } },
				],
				up: [],
			},
		],
		feedbacks: [],
		localVariables: [{ variableType: 'simple', variableName: 'level', startupValue: 0 }],
	},
} satisfies CompanionPresetDefinitions<FixtureTypes>;

const invalidResultStorage: Extract<CompanionPresetAction<FixtureTypes['actions']>, { actionId: 'write' }> = {
	actionId: 'write',
	options: {},
	// @ts-expect-error Actions without a result cannot store one in a local variable.
	storeResult: { type: 'local-variable', variableName: 'level' },
};

void [
	narrowedValue,
	inferredValue,
	invalidValue,
	invalidOptions,
	narrowedBoolean,
	advancedFeedback,
	presets,
	invalidResultStorage,
];
