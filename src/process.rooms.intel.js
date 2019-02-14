'use strict';

/* global hivemind FIND_HOSTILE_CREEPS */

const Process = require('./process');

/**
 * Gathers tick-by-tick intel in a room.
 * @constructor
 *
 * @param {object} params
 *   Options on how to run this process.
 * @param {object} data
 *   Memory object allocated for this process' stats.
 */
const RoomIntelProcess = function (params, data) {
	Process.call(this, params, data);
	this.room = params.room;
};

RoomIntelProcess.prototype = Object.create(Process.prototype);

/**
 * Gathers intel in a room.
 */
RoomIntelProcess.prototype.run = function () {
	hivemind.roomIntel(this.room.name).gatherIntel();
	this.room.scan();

	this.findHostiles();
};

/**
 * Detects hostile creeps.
 */
RoomIntelProcess.prototype.findHostiles = function () {
	const hostiles = this.room.find(FIND_HOSTILE_CREEPS);
	const parts = {};
	let lastSeen = this.room.memory.enemies ? this.room.memory.enemies.lastSeen : 0;
	let safe = true;

	// @todo Reactivate new military manager when performance is stable.
	// if (hostiles.length > 0) {
	// 	this.room.assertMilitarySituation();
	// }

	if (hostiles.length > 0) {
		// Count body parts for strength estimation.
		for (const creep of hostiles) {
			if (creep.isDangerous()) {
				safe = false;
				lastSeen = Game.time;
			}

			for (const part of creep.body) {
				parts[part.type] = (parts[part.type] || 0) + 1;
			}
		}
	}

	this.room.memory.enemies = {
		parts,
		lastSeen,
		safe,
	};
};

module.exports = RoomIntelProcess;
