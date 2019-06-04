'use strict';

/* global CREEP_LIFE_TIME CREEP_SPAWN_TIME MAX_CREEP_SIZE */

const SpawnRole = require('./spawn-role');

module.exports = class PowerHaulerSpawnRole extends SpawnRole {
	/**
	 * Adds gift spawn options for the given room.
	 *
	 * @param {Room} room
	 *   The room to add spawn options for.
	 * @param {Object[]} options
	 *   A list of spawn options to add to.
	 */
	getSpawnOptions(room, options) {
		if (Memory.disablePowerHarvesting) return;
		if (!Memory.strategy || !Memory.strategy.power || !Memory.strategy.power.rooms) return;

		_.each(Memory.strategy.power.rooms, (info, roomName) => {
			if (!info.isActive) return;
			if (!info.spawnRooms[room.name]) return;

			// @todo Determine supposed time until we crack open the power bank.
			// Then we can stop spawning attackers and spawn haulers instead.
			const timeToKill = info.hits / info.dps;
			if (timeToKill > (CREEP_SPAWN_TIME * MAX_CREEP_SIZE) + (CREEP_LIFE_TIME / 3)) return;

			// Time to spawn haulers!
			const powerHaulers = _.filter(Game.creepsByRole['hauler.power'] || {}, creep => creep.memory.targetRoom === roomName);
			let totalCapacity = 0;
			_.each(powerHaulers, creep => {
				totalCapacity += creep.carryCapacity;
			});

			if (totalCapacity < info.amount * 1.2 / _.size(info.spawnRooms)) {
				options.push({
					priority: 3,
					weight: 0.5,
					role: 'hauler.power',
					targetRoom: roomName,
				});
			}
		});
	}
};
