import { CompanionVariableDefinitions } from '@companion-module/base';
import type { ModuleInstance } from '../main.js';
import { getVariableDefinitions as getStateVariableDefinitions } from '../state/variables.js';

export function getVariableDefinitions(companionModule: ModuleInstance): CompanionVariableDefinitions {
	return getStateVariableDefinitions(companionModule);
}
