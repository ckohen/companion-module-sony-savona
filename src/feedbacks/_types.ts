import {
	CompanionAdvancedFeedbackDefinition,
	CompanionAdvancedFeedbackResult,
	CompanionFeedbackAdvancedEvent,
	CompanionFeedbackBooleanEvent,
	CompanionFeedbackButtonStyleResult,
	CompanionFeedbackCallbackContext,
	CompanionFeedbackContext,
	CompanionFeedbackInfo,
	CompanionFeedbackLearnContext,
	CompanionFeedbackValueEvent,
	JsonValue,
	SomeCompanionFeedbackInputField,
} from '@companion-module/base';
import type { ModuleInstance } from '../main.js';
import { DeepImmutable, OptionTypeToTypescriptType } from '../actions/_types.js';

export type TypeOptions<Base, Options extends DeepImmutable<SomeCompanionFeedbackInputField[]>> = Omit<
	Base,
	'options'
> & {
	options: ModuleFeedbackOptionValues<Options>;
};

export type ModuleFeedbackOptionValues<Options extends DeepImmutable<SomeCompanionFeedbackInputField[]>> = {
	[Option in Options[number] as Option['id']]: OptionTypeToTypescriptType[Option['type']] | undefined;
};

export type ModuleFeedbackInfo<Options extends DeepImmutable<SomeCompanionFeedbackInputField[]>> = TypeOptions<
	CompanionFeedbackInfo<ModuleFeedbackOptionValues<Options>>,
	Options
>;

export type ModuleFeedbackBooleanEvent<Options extends DeepImmutable<SomeCompanionFeedbackInputField[]>> = TypeOptions<
	CompanionFeedbackBooleanEvent<ModuleFeedbackOptionValues<Options>>,
	Options
>;

export type ModuleFeedbackValueEvent<Options extends DeepImmutable<SomeCompanionFeedbackInputField[]>> = TypeOptions<
	CompanionFeedbackValueEvent<ModuleFeedbackOptionValues<Options>>,
	Options
>;

export type ModuleFeedbackAdvancedEvent<Options extends DeepImmutable<SomeCompanionFeedbackInputField[]>> = TypeOptions<
	CompanionFeedbackAdvancedEvent<ModuleFeedbackOptionValues<Options>>,
	Options
>;

export interface ModuleFeedbackBase<Options extends DeepImmutable<SomeCompanionFeedbackInputField[]>> {
	type: 'boolean' | 'value' | 'advanced';
	/** Name to show in the feedbacks list */
	name: string;
	/**
	 * Alternate value to use when sorting the list of feedbacks
	 * By default, the feedbacks are ordered by the name field, but you can override this without altering the visible name.
	 */
	sortName?: string;
	/** Additional description of the feedback */
	description?: string;
	/** The input fields for the feedback */
	options: Options | ((companionModule: ModuleInstance) => Options);
	/**
	 * Called to report a feedback has been removed or disabled.
	 * Useful to cleanup subscriptions setup in the callback.
	 */
	unsubscribe?: (
		this: void,
		companionModule: ModuleInstance,
		feedback: ModuleFeedbackInfo<Options>,
		context: CompanionFeedbackContext,
	) => void | Promise<void>;
	/**
	 * The user requested to 'learn' the values for this feedback.
	 */
	learn?: (
		this: void,
		companionModule: ModuleInstance,
		feedback: ModuleFeedbackInfo<Options>,
		context: CompanionFeedbackLearnContext,
	) =>
		| Partial<ModuleFeedbackOptionValues<Options>>
		| undefined
		| Promise<Partial<ModuleFeedbackOptionValues<Options>> | undefined>;
	/**
	 * Timeout for the 'learn' function (in milliseconds).
	 * Companion sets a default value of 5s.
	 */
	learnTimeout?: number;
}

/**
 * The definition of a boolean feedback
 */
export interface ModuleBooleanFeedback<
	Options extends DeepImmutable<SomeCompanionFeedbackInputField[]>,
> extends ModuleFeedbackBase<Options> {
	/** The type of the feedback */
	type: 'boolean';
	/** The default style properties for this feedback */
	defaultStyle: Partial<CompanionFeedbackButtonStyleResult>;
	/** Called to get the feedback value */
	callback: (
		this: void,
		companionModule: ModuleInstance,
		feedback: ModuleFeedbackBooleanEvent<Options>,
		context: CompanionFeedbackCallbackContext,
	) => boolean | Promise<boolean>;
	/**
	 * If `undefined` or true, Companion will add an 'Inverted' checkbox for your feedback, and handle the logic for you.
	 * By setting this to false, you can disable this for your feedback. You should do this if it does not make sense for your feedback.
	 */
	showInvert?: boolean;
}

/**
 * The definition of a value feedback
 */
export interface ModuleValueFeedback<
	Options extends DeepImmutable<SomeCompanionFeedbackInputField[]>,
> extends ModuleFeedbackBase<Options> {
	/** The type of the feedback */
	type: 'value';
	/** Called to get the feedback value */
	callback: (
		this: void,
		companionModule: ModuleInstance,
		feedback: ModuleFeedbackValueEvent<Options>,
		context: CompanionFeedbackCallbackContext,
	) => JsonValue | Promise<JsonValue>;
}

/**
 * The definition of an advanced feedback
 */
export interface ModuleAdvancedFeedback<
	Options extends DeepImmutable<SomeCompanionFeedbackInputField[]>,
> extends ModuleFeedbackBase<Options> {
	/** The type of the feedback */
	type: 'advanced';
	/** The suggested style properties this feedback will affect */
	affectedProperties: NonNullable<
		CompanionAdvancedFeedbackDefinition<ModuleFeedbackOptionValues<Options>>['affectedProperties']
	>;
	/** Called to get the feedback value */
	callback: (
		this: void,
		companionModule: ModuleInstance,
		feedback: ModuleFeedbackAdvancedEvent<Options>,
		context: CompanionFeedbackCallbackContext,
	) => CompanionAdvancedFeedbackResult | Promise<CompanionAdvancedFeedbackResult>;
}

export type ModuleFeedback<Options extends DeepImmutable<SomeCompanionFeedbackInputField[]>> =
	ModuleBooleanFeedback<Options> | ModuleValueFeedback<Options> | ModuleAdvancedFeedback<Options>;
