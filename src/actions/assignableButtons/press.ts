import type { DropdownChoice } from '@companion-module/base';
import { SomeCompanionActionInputField } from '@companion-module/base';
import type { ModuleInstance } from '../../main.js';
import { optionalText, runSavonaAction } from '../_util.js';
import { createModuleAction } from '../index.js';

const currentAssignmentId = '__current__';

function generateOptions(companionModule: ModuleInstance) {
	const buttonChoices = getButtonChoices(companionModule);
	const assignmentChoices = getAssignmentChoices(companionModule);

	return [
		{
			type: 'dropdown',
			id: 'buttonId',
			label: 'Button',
			default: buttonChoices[0]?.id ?? 1,
			choices: buttonChoices,
		},
		{
			type: 'dropdown',
			id: 'assignment',
			label: 'Assignment',
			default: currentAssignmentId,
			choices: assignmentChoices,
			allowCustom: true,
			disableAutoExpression: true,
			minChoicesForSearch: 8,
		},
		{
			type: 'checkbox',
			id: 'restoreAssignment',
			label: 'Restore Assignment',
			default: true,
			isVisibleExpression: `$(options:assignment) != "${currentAssignmentId}"`,
		},
	] as const satisfies SomeCompanionActionInputField[];
}

export const pressAssignableButton = createModuleAction<ReturnType<typeof generateOptions>>(
	{
		name: 'Press Assignable Button',
		description: 'Optionally assigns a camera function before pressing the assignable button.',
		async callback(companionModule, action) {
			await runSavonaAction(companionModule, 'pressing assignable button', async (client) => {
				const buttonId = parseButtonId(action.options.buttonId);
				const assignment = parseAssignment(action.options.assignment);

				if (!assignment) {
					await pressAssignableButtonId(companionModule, buttonId);
					return;
				}

				await client.assignableButtons.fetchCapabilities();
				const button = client.assignableButtons.buttons.get(buttonId);
				if (button?.capability.length && !button.capability.includes(assignment)) {
					throw new Error(`Assignment is not available for Assignable ${buttonId}: ${assignment}`);
				}

				await client.assignableButtons.fetchValues();
				const previousAssignment = optionalText(client.assignableButtons.buttons.get(buttonId)?.value);
				if (action.options.restoreAssignment === true && !previousAssignment) {
					throw new Error(`Unable to determine current assignment for Assignable ${buttonId}`);
				}

				let changedAssignment = false;
				let actionError: Error | undefined;
				let restoreError: Error | undefined;
				try {
					if (previousAssignment !== assignment) {
						await client.assignableButtons.setValue(buttonId, assignment);
						changedAssignment = true;
					}

					await pressAssignableButtonId(companionModule, buttonId);
				} catch (error) {
					actionError = toError(error);
				} finally {
					if (action.options.restoreAssignment === true && previousAssignment && changedAssignment) {
						try {
							await client.assignableButtons.setValue(buttonId, previousAssignment);
						} catch (error) {
							restoreError = toError(error);
						}
					}
				}

				if (actionError !== undefined) {
					if (restoreError !== undefined) {
						companionModule.log('error', `Error restoring Assignable ${buttonId}: ${restoreError.message}`);
					}
					throw actionError;
				}
				if (restoreError !== undefined) throw restoreError;
			});
		},
	},
	generateOptions,
);

function getButtonChoices(companionModule: ModuleInstance): DropdownChoice<number>[] {
	const buttonIds = Array.from(companionModule.client?.assignableButtons.buttons.keys() ?? []).sort(
		(buttonA, buttonB) => buttonA - buttonB,
	);
	const ids = buttonIds.length ? buttonIds : [1, 2, 3, 4, 5, 6, 7, 8, 9];

	return ids.map((id) => ({ id, label: `Assignable ${id}` }));
}

function getAssignmentChoices(companionModule: ModuleInstance): DropdownChoice<string>[] {
	const assignments = new Set<string>();
	for (const button of companionModule.client?.assignableButtons.buttons.values() ?? []) {
		for (const assignment of button.capability) {
			assignments.add(assignment);
		}
	}

	return [
		{ id: currentAssignmentId, label: 'Current Assignment' },
		...Array.from(assignments)
			.sort()
			.map((assignment) => ({ id: assignment, label: assignment })),
	];
}

function parseButtonId(value: string | number | undefined): number {
	const buttonId = Number(value ?? 1);
	if (!Number.isInteger(buttonId) || buttonId < 1) throw new Error('Assignable button is required');
	return buttonId;
}

function parseAssignment(value: string | number | undefined): string | undefined {
	if (value === undefined || value === currentAssignmentId) return undefined;
	return optionalText(value.toString());
}

async function pressAssignableButtonId(companionModule: ModuleInstance, buttonId: number): Promise<void> {
	const client = companionModule.client;
	if (!client) throw new Error('Savona client is not connected');

	await client.button.sendKeys({ params: [[`Assignable.${buttonId}`]] });
}

function toError(error: unknown): Error {
	return error instanceof Error ? error : new Error(String(error));
}
