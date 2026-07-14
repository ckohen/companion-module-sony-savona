import { combineRgb } from '@companion-module/base';
import type { SomeCompanionFeedbackInputField } from '@companion-module/base';
import type { MediaCard } from '@ckohen/savona';
import { getConnectedClient } from './_util.js';
import { createModuleBooleanFeedback } from './index.js';

function generateOptions() {
	return [
		{
			type: 'dropdown',
			id: 'card',
			label: 'Card',
			default: 'any',
			choices: [
				{ id: 'any', label: 'Any Card' },
				{ id: 'a', label: 'Card A' },
				{ id: 'b', label: 'Card B' },
				{ id: 'c', label: 'Card C' },
			],
		},
		{
			type: 'dropdown',
			id: 'state',
			label: 'State',
			default: 'mounted',
			disableAutoExpression: true,
			choices: [
				{ id: 'mounted', label: 'Mounted' },
				{ id: 'notMounted', label: 'Not Mounted' },
				{ id: 'recordTarget', label: 'Record Target' },
				{ id: 'playbackTarget', label: 'Playback Target' },
				{ id: 'writeProtected', label: 'Write Protected' },
				{ id: 'fileError', label: 'File Error' },
				{ id: 'lowTime', label: 'Low Available Time' },
			],
		},
		{
			type: 'number',
			id: 'availableTimeThreshold',
			label: 'Available Time Threshold',
			default: 5,
			min: 0,
			max: 9999,
			step: 1,
			isVisibleExpression: '$(options:state) == "lowTime"',
		},
	] as const satisfies SomeCompanionFeedbackInputField[];
}

export const mediaCardState = createModuleBooleanFeedback<ReturnType<typeof generateOptions>>(
	{
		name: 'Media Card State',
		defaultStyle: {
			bgcolor: combineRgb(0, 125, 80),
			color: combineRgb(255, 255, 255),
		},
		callback(companionModule, feedback) {
			const client = getConnectedClient(companionModule);
			if (!client) return false;

			const cards = getSelectedCards(client.mediaCards.cards, feedback.options.card?.toString());
			const threshold = Number(feedback.options.availableTimeThreshold ?? 5);
			return cards.some((card) => matchesCardState(card, feedback.options.state?.toString(), threshold));
		},
	},
	generateOptions,
);

function getSelectedCards(cards: readonly [MediaCard, MediaCard, MediaCard], card: string | undefined): MediaCard[] {
	switch (card) {
		case 'a':
			return [cards[0]];
		case 'b':
			return [cards[1]];
		case 'c':
			return [cards[2]];
		case 'any':
		default:
			return [...cards];
	}
}

function matchesCardState(card: MediaCard, state: string | undefined, availableTimeThreshold: number): boolean {
	switch (state) {
		case 'notMounted':
			return card.status !== 'Mounted';
		case 'recordTarget':
			return card.isRecording;
		case 'playbackTarget':
			return card.isPlaying;
		case 'writeProtected':
			return card.writeProtected;
		case 'fileError':
			return card.fileStatus !== 'Normal';
		case 'lowTime':
			return card.availableTime !== null && card.availableTime <= availableTimeThreshold;
		case 'mounted':
		default:
			return card.status === 'Mounted';
	}
}
