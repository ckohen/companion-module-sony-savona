import {
	CompanionActionCallbackContext,
	CompanionActionContext,
	CompanionActionEvent,
	CompanionActionInfo,
	CompanionActionLearnContext,
	JsonValue,
	SomeCompanionActionInputField,
	StringKeys,
} from '@companion-module/base';
import type { ModuleInstance } from '../main.js';

export type DeepImmutable<T> =
	T extends Map<infer K, infer V>
		? ReadonlyMap<DeepImmutable<K>, DeepImmutable<V>>
		: T extends Set<infer S>
			? ReadonlySet<DeepImmutable<S>>
			: T extends object
				? { readonly [K in keyof T]: DeepImmutable<T[K]> }
				: T;

export interface OptionTypeToTypescriptType {
	'bonjour-device': string;
	checkbox: boolean;
	colorpicker: string | number;
	'custom-variable': string;
	dropdown: string | number;
	multidropdown: (string | number)[];
	number: number;
	'static-text': string;
	textinput: string;
}

export type TypeOptions<Base, Options extends DeepImmutable<SomeCompanionActionInputField[]>> = Omit<
	Base,
	'options'
> & {
	options: ModuleActionOptionValues<Options>;
};

export type ModuleActionOptionValues<Options extends DeepImmutable<SomeCompanionActionInputField[]>> = {
	[Option in Options[number] as Option['id']]: OptionTypeToTypescriptType[Option['type']] | undefined;
};

export type ModuleActionEvent<Options extends DeepImmutable<SomeCompanionActionInputField[]>> = TypeOptions<
	CompanionActionEvent<ModuleActionOptionValues<Options>>,
	Options
>;

export type ModuleActionInfo<Options extends DeepImmutable<SomeCompanionActionInputField[]>> = TypeOptions<
	CompanionActionInfo<ModuleActionOptionValues<Options>>,
	Options
>;

export interface ModuleActionBase<Options extends DeepImmutable<SomeCompanionActionInputField[]>> {
	/** Name to show in the actions list */
	name: string;
	/**
	 * Alternate value to use when sorting the list of actions
	 * By default, the actions are ordered by the name field, but you can override this without altering the visible name.
	 */
	sortName?: string;
	/** Additional description of the action */
	description?: string;
	/** The input fields for the action */
	options: Options | ((companionModule: ModuleInstance) => Options);
	/**
	 * The user requested to 'learn' the values for this action.
	 */
	learn?: (
		this: void,
		companionModule: ModuleInstance,
		action: ModuleActionEvent<Options>,
		context: CompanionActionLearnContext,
	) =>
		| Partial<ModuleActionOptionValues<Options>>
		| undefined
		| Promise<Partial<ModuleActionOptionValues<Options>> | undefined>;
	/**
	 * Timeout for the 'learn' function (in milliseconds).
	 * Companion sets a default value of 5s.
	 */
	learnTimeout?: number;
}

export interface ModuleActionWithoutResult<Options extends DeepImmutable<SomeCompanionActionInputField[]>> {
	/** Called to execute the action */
	hasResult?: false;
	callback: (
		this: void,
		companionModule: ModuleInstance,
		action: ModuleActionEvent<Options>,
		context: CompanionActionCallbackContext,
	) => unknown;
}

export interface ModuleActionWithResult<
	Options extends DeepImmutable<SomeCompanionActionInputField[]>,
	Result extends JsonValue,
> {
	/** Called to execute the action and return a value to Companion */
	hasResult: true;
	callback: (
		this: void,
		companionModule: ModuleInstance,
		action: ModuleActionEvent<Options>,
		context: CompanionActionCallbackContext,
	) => Result | Promise<Result>;
}

export interface ModuleActionSubscribeHooks<Options extends DeepImmutable<SomeCompanionActionInputField[]>> {
	/**
	 * Only monitor the specified options for re-running subscribe/unsubscribe callbacks.
	 */
	optionsToMonitorForSubscribe: StringKeys<ModuleActionOptionValues<Options>>[];
	/**
	 * If true, unsubscribe will not be called when options change, only when the action is removed or disabled.
	 */
	skipUnsubscribeOnOptionsChange?: boolean;
	/**
	 * Called to report the existence of an action.
	 * Useful to ensure necessary data is loaded.
	 */
	subscribe: (
		this: void,
		companionModule: ModuleInstance,
		action: ModuleActionInfo<Options>,
		context: CompanionActionContext,
	) => Promise<void> | void;
	/**
	 * Called to report an action has been edited/removed.
	 * Useful to cleanup subscriptions setup in subscribe.
	 */
	unsubscribe?: (
		this: void,
		companionModule: ModuleInstance,
		action: ModuleActionInfo<Options>,
		context: CompanionActionContext,
	) => Promise<void> | void;
}

export interface ModuleActionNoSubscribeHooks {
	optionsToMonitorForSubscribe?: never;
	skipUnsubscribeOnOptionsChange?: never;
	subscribe?: never;
	unsubscribe?: never;
}

export type ModuleAction<
	Options extends DeepImmutable<SomeCompanionActionInputField[]>,
	Result extends JsonValue | void = void,
> = ModuleActionBase<Options> &
	(ModuleActionSubscribeHooks<Options> | ModuleActionNoSubscribeHooks) &
	([Result] extends [void] ? ModuleActionWithoutResult<Options> : ModuleActionWithResult<Options, Result & JsonValue>);

export type AnyModuleAction<Options extends DeepImmutable<SomeCompanionActionInputField[]>> =
	ModuleAction<Options, void> | ModuleAction<Options, JsonValue>;
