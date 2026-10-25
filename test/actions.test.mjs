import assert from 'node:assert/strict';
import { test } from 'node:test';
import { SavonaEvent } from '@ckohen/savona';
import { getActions } from '../dist/actions/index.js';
import { getSpecificUploadJobIds } from '../dist/actions/uploadJobs/_util.js';
import { getFeedbacks } from '../dist/feedbacks/index.js';
import { attachClient, createModule, setClientState } from './helpers.mjs';

test('actions reject initializing and disconnected clients, but report request failures after readiness', async (t) => {
	const fixture = createModule(t);
	const client = attachClient(fixture);
	const start = t.mock.method(client.record, 'start', async () => {
		throw new Error('connection lost during request');
	});
	const action = getActions(fixture.instance).startRecording;
	fixture.instance.isReady = false;
	await action.callback({ options: { target: 'main' } }, {});
	assert.equal(start.mock.callCount(), 0);
	fixture.instance.isReady = true;
	setClientState(client, 'disconnected');
	await action.callback({ options: { target: 'main' } }, {});
	assert.equal(start.mock.callCount(), 0);
	setClientState(client, 'connected');
	await action.callback({ options: { target: 'main' } }, {});
	assert.equal(start.mock.callCount(), 1);
	assert.match(fixture.logs.at(-1).message, /connection lost during request/);
});

test('unknown state never satisfies generic comparisons', async (t) => {
	const fixture = createModule(t);
	const client = attachClient(fixture);
	const feedback = getFeedbacks(fixture.instance).stateMatches;
	for (const [operator, expectedValue] of [
		['notEquals', 'Recording'],
		['lessThan', '10'],
		['equals', ''],
	]) {
		assert.equal(
			await feedback.callback({ options: { variableId: 'record_status', operator, expectedValue } }, {}),
			false,
		);
	}
	client.record.status = 'Recording';
	fixture.instance.cacheCoordinator.markUpdated(client, 'record');
	client.emit(SavonaEvent.CacheUpdate, 'record');
	assert.equal(
		await feedback.callback(
			{ options: { variableId: 'record_status', operator: 'equals', expectedValue: 'Recording' } },
			{},
		),
		true,
	);
	fixture.instance.isReady = false;
	assert.equal(
		await feedback.callback(
			{ options: { variableId: 'record_status', operator: 'notEquals', expectedValue: 'Standby' } },
			{},
		),
		false,
	);
});

test('job IDs require valid complete integer tokens without inventing zero IDs', () => {
	for (const input of [
		undefined,
		'',
		'  ',
		',,,',
		'invalid,',
		'1001,bad',
		'-1',
		'1.5',
		'1e3',
		'0x10',
		'9007199254740992',
	]) {
		assert.throws(() => getSpecificUploadJobIds(input));
	}
	assert.deepEqual(getSpecificUploadJobIds('1001, 1002\n1001,'), [1001, 1002]);
	assert.deepEqual(getSpecificUploadJobIds('0'), [0]);
});

test('latest recording refuses active, stopping, playback, and unknown states', async (t) => {
	const fixture = createModule(t);
	const client = attachClient(fixture);
	t.mock.method(client.clipInfo, 'fetchName', async () => 'TEST0002');
	const clips = t.mock.method(client.mediaCards, 'fetchClips', async () => []);
	const action = getActions(fixture.instance).uploadLatestRecording;
	for (const status of ['Recording', 'RecordingWithCall', 'RecPausing', 'Stopping', 'Playing', undefined]) {
		t.mock.method(client.clipInfo, 'fetchValue', async () => ({ status }));
		await action.callback({ options: { driveId: 'auto', uploadSettingId: 1001, directory: '' } }, {});
		assert.match(fixture.logs.at(-1).message, /Wait for recording to finish/);
	}
	assert.equal(clips.mock.callCount(), 0);
});

test('latest recording uploads the previous counter with the requested setting and directory', async (t) => {
	const fixture = createModule(t);
	const client = attachClient(fixture);
	t.mock.method(client.clipInfo, 'fetchName', async () => 'TEST0010');
	t.mock.method(client.clipInfo, 'fetchValue', async () => ({ status: 'Standby' }));
	const uploaded = [];
	t.mock.method(client.mediaCards, 'fetchClips', async (driveId) =>
		driveId === 'media.1'
			? []
			: [
					{
						name: 'TEST0009',
						async upload(...args) {
							uploaded.push(args);
						},
					},
				],
	);
	const action = getActions(fixture.instance).uploadLatestRecording;
	await action.callback({ options: { driveId: 'auto', uploadSettingId: 1002, directory: 'Archive' } }, {});
	assert.deepEqual(uploaded, [[1002, 'Archive']]);
});

test('assignable presses pass the camera ID unchanged and restore temporary assignments', async (t) => {
	const fixture = createModule(t);
	const client = attachClient(fixture);
	client.assignableButtons.buttons.set(9, { value: 'Menu', capability: ['Menu', 'Peaking'] });
	t.mock.method(client.assignableButtons, 'fetchCapabilities', async () => {});
	t.mock.method(client.assignableButtons, 'fetchValues', async () => {});
	const requests = [];
	t.mock.method(client.property, 'setValue', async (request) => requests.push(request));
	t.mock.method(client.button, 'sendKeys', async (request) => requests.push(request));
	const action = getActions(fixture.instance).pressAssignableButton;
	await action.callback({ options: { buttonId: 9, assignment: 'Peaking', restoreAssignment: true } }, {});
	assert.deepEqual(requests, [
		{ params: [{ 'Button.Assign': { 'Assignable.9': ['Peaking', 'None'] } }] },
		{ params: [['Assignable.9']] },
		{ params: [{ 'Button.Assign': { 'Assignable.9': ['Menu', 'None'] } }] },
	]);
});
