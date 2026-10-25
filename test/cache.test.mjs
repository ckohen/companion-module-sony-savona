import assert from 'node:assert/strict';
import { setTimeout as delay } from 'node:timers/promises';
import { test } from 'node:test';
import { SavonaEvent } from '@ckohen/savona';
import { getFeedbacks } from '../dist/feedbacks/index.js';
import { attachClient, createClient, createModule, deferred, uploadResponse } from './helpers.mjs';

test('a slow upload refresh publishes the completed cache, without an early stale publication', async (t) => {
	const fixture = createModule(t);
	const client = attachClient(fixture);
	t.mock.method(client.property, 'getValue', async () => uploadResponse(100));
	await fixture.instance.cacheCoordinator.refresh(['uploadJobs']);
	fixture.publications.length = 0;
	const response = deferred();
	t.mock.method(client.property, 'getValue', async () => response.promise);
	client.notifications.propertyValueChanged.emit('Network.Service.Upload.Progress.Status', { 1001: 200 });
	await delay(275);
	assert.equal(fixture.publications.length, 0);
	response.resolve(uploadResponse(200));
	await client.notifications.propertyValueChanged.waitForAllListenersToComplete();
	assert.equal(fixture.values.upload_jobs_transferring, 0);
	assert.equal(fixture.values.upload_jobs_completed, 1);
});

test('cache event names map battery and ND to their existing variable IDs', (t) => {
	const fixture = createModule(t);
	const client = attachClient(fixture);
	fixture.instance.cacheCoordinator.markUpdated(client, 'mainBattery', 'ND');
	client.mainBattery.percentage = 73;
	client.ND.value = 8;
	client.emit(SavonaEvent.CacheUpdate, 'mainBattery');
	client.emit(SavonaEvent.CacheUpdate, 'ND');
	assert.equal(fixture.values.battery_percentage, 73);
	assert.equal(fixture.values.nd_value, 8);
});

test('an explicit fetch waits for completion and publishes without notifications', async (t) => {
	const fixture = createModule(t);
	const client = attachClient(fixture);
	const response = deferred();
	t.mock.method(client.record, 'fetchValue', async () => {
		await response.promise;
		client.record.status = 'Recording';
	});
	const refresh = fixture.instance.cacheCoordinator.refresh(['record']);
	assert.equal(fixture.publications.length, 0);
	response.resolve();
	await refresh;
	assert.equal(fixture.values.record_status, 'Recording');
});

test('a failed initial fetch leaves feedbacks and variables unknown', async (t) => {
	const fixture = createModule(t);
	const client = attachClient(fixture);
	t.mock.method(client.record, 'fetchValue', async () => {
		throw new Error('fetch failed');
	});
	await fixture.instance.cacheCoordinator.refresh(['record']);
	const feedbacks = getFeedbacks(fixture.instance);
	assert.equal(fixture.values.record_status, undefined);
	assert.equal(await feedbacks.recordingState.callback({ options: { state: 'notRecording' } }, {}), false);
	assert.equal(fixture.instance.cacheCoordinator.isInitialized('record'), false);
	assert.match(fixture.logs[0].message, /Unable to fetch record/);
	client.emit(SavonaEvent.CacheUpdate, 'record');
	assert.equal(fixture.instance.cacheCoordinator.isInitialized('record'), false);
	assert.equal(await feedbacks.recordingState.callback({ options: { state: 'notRecording' } }, {}), false);
});

test('completion of a replaced client refresh cannot publish or initialize the replacement', async (t) => {
	const fixture = createModule(t);
	const oldClient = attachClient(fixture);
	const response = deferred();
	t.mock.method(oldClient.record, 'fetchValue', async () => response.promise);
	const refresh = fixture.instance.cacheCoordinator.refresh(['record']);
	const newClient = createClient();
	attachClient(fixture, newClient);
	response.resolve();
	await refresh;
	assert.equal(fixture.publications.length, 0);
	assert.equal(fixture.instance.cacheCoordinator.isInitialized('record'), false);
	oldClient.emit(SavonaEvent.CacheUpdate, 'record');
	assert.equal(fixture.publications.length, 0);
	assert.equal(oldClient.listenerCount(SavonaEvent.CacheUpdate), 0);
});

test('disconnect invalidates a refresh even when the next connection uses the same client', async (t) => {
	const fixture = createModule(t);
	const client = attachClient(fixture);
	const response = deferred();
	t.mock.method(client.record, 'fetchValue', async () => response.promise);
	const refresh = fixture.instance.cacheCoordinator.refresh(['record']);
	fixture.instance.cacheCoordinator.clearVariables();
	fixture.publications.length = 0;
	response.resolve();
	await refresh;
	assert.equal(fixture.publications.length, 0);
	assert.equal(fixture.instance.cacheCoordinator.isInitialized('record'), false);
});

test('audio is optional and throttles completed updates to the latest value', (t) => {
	t.mock.timers.enable({ apis: ['setTimeout'] });
	const fixture = createModule(t);
	const client = attachClient(fixture);
	client.audio.channels.set(1, -20);
	client.emit(SavonaEvent.CacheUpdate, 'audio');
	assert.equal(fixture.publications.length, 0);
	fixture.instance.config.showAudioVariables = true;
	fixture.instance.cacheCoordinator.markUpdated(client, 'audio');
	fixture.publications.length = 0;
	client.emit(SavonaEvent.CacheUpdate, 'audio');
	client.audio.channels.set(1, -10);
	client.emit(SavonaEvent.CacheUpdate, 'audio');
	t.mock.timers.tick(249);
	assert.equal(fixture.publications.length, 0);
	t.mock.timers.tick(1);
	assert.equal(fixture.values.audio_1_level, -10);
});
