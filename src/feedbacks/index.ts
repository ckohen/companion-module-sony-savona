import {
	CompanionFeedbackAdvancedEvent,
	CompanionFeedbackBooleanEvent,
	CompanionFeedbackContext,
	CompanionFeedbackDefinitions,
	CompanionFeedbackInfo,
	CompanionOptionValues,
	SomeCompanionFeedbackInputField,
} from '@companion-module/base';
import type { ModuleInstance } from '../main.js';
import { ModuleAdvancedFeedback, ModuleBooleanFeedback, ModuleFeedback } from './_types.js';
import { DeepImmutable } from '../actions/_types.js';

export function createModuleBooleanFeedback<const Options extends DeepImmutable<SomeCompanionFeedbackInputField[]>>(
	feedback: Omit<ModuleBooleanFeedback<Options>, 'options' | 'type'>,
	options: Options | ((companionModule: ModuleInstance) => Options),
): ModuleFeedback<Options> {
	return { options, ...feedback, type: 'boolean' };
}

export function createModuleAdvancedFeedback<const Options extends DeepImmutable<SomeCompanionFeedbackInputField[]>>(
	feedback: Omit<ModuleAdvancedFeedback<Options>, 'options' | 'type'>,
	options: Options | ((companionModule: ModuleInstance) => Options),
): ModuleFeedback<Options> {
	return { options, ...feedback, type: 'advanced' };
}

export function getFeedbacks(companionModule: ModuleInstance): CompanionFeedbackDefinitions {
	return convertFeedbacks(companionModule, {});
}

function convertFeedbacks(
	companionModule: ModuleInstance,
	feedbacks: Record<string, ModuleFeedback<DeepImmutable<SomeCompanionFeedbackInputField[]>>>,
) {
	const companionFeedbacks: CompanionFeedbackDefinitions = {};
	for (const [feedback, feedbackDef] of Object.entries(feedbacks)) {
		const common = {
			name: feedbackDef.name,
			description: feedbackDef.description,
			options: (typeof feedbackDef.options === 'function'
				? feedbackDef.options(companionModule)
				: feedbackDef.options) as SomeCompanionFeedbackInputField[],
			learn: feedbackDef.learn
				? async (event: CompanionFeedbackInfo<CompanionOptionValues>, context: CompanionFeedbackContext) =>
						feedbackDef.learn!(companionModule, event as Parameters<NonNullable<typeof feedbackDef.learn>>[1], context)
				: undefined,
			learnTimeout: feedbackDef.learnTimeout,
			unsubscribe: feedbackDef.unsubscribe
				? async (event: CompanionFeedbackInfo<CompanionOptionValues>, context: CompanionFeedbackContext) =>
						feedbackDef.unsubscribe!(
							companionModule,
							event as Parameters<NonNullable<typeof feedbackDef.unsubscribe>>[1],
							context,
						)
				: undefined,
		};

		if (feedbackDef.type === 'boolean') {
			companionFeedbacks[feedback] = {
				...common,
				type: 'boolean',
				defaultStyle: feedbackDef.defaultStyle,
				showInvert: feedbackDef.showInvert,
				async callback(event: CompanionFeedbackBooleanEvent<CompanionOptionValues>, context: CompanionFeedbackContext) {
					return feedbackDef.callback(companionModule, event as Parameters<typeof feedbackDef.callback>[1], context);
				},
			};
		} else {
			companionFeedbacks[feedback] = {
				...common,
				type: 'advanced',
				async callback(
					event: CompanionFeedbackAdvancedEvent<CompanionOptionValues>,
					context: CompanionFeedbackContext,
				) {
					return feedbackDef.callback(companionModule, event as Parameters<typeof feedbackDef.callback>[1], context);
				},
			};
		}
	}
	return companionFeedbacks;
}
