'use strict';

/* global CREEP_LIFE_TIME CREEP_SPAWN_TIME MAX_CREEP_SIZE */

const SpawnRole = require('./spawn-role');

module.exports = class PowerHarvesterSpawnRole extends SpawnRole {
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

			// @todo Determine realistic time until we crack open the power bank.
			// Then we can stop spawning attackers and spawn haulers instead.
			const travelTime = 50 * info.spawnRooms[room.name].distance;
			const timeToKill = info.hits / info.dps;

			// We're assigned to spawn creeps for this power gathering operation!
			const powerHarvesters = _.filter(Game.creepsByRole['harvester.power'] || [], creep => {
				if (creep.memory.sourceRoom === room.name && creep.memory.targetRoom === roomName && !creep.memory.isHealer) {
					if ((creep.ticksToLive || CREEP_LIFE_TIME) >= (CREEP_SPAWN_TIME * MAX_CREEP_SIZE) + travelTime) {
						return true;
					}
				}

				return false;
			});
			const powerHealers = _.filter(Game.creepsByRole['harvester.power'] || [], creep => {
				if (creep.memory.sourceRoom === room.name && creep.memory.targetRoom === roomName && creep.memory.isHealer) {
					if ((creep.ticksToLive || CREEP_LIFE_TIME) >= (CREEP_SPAWN_TIME * MAX_CREEP_SIZE) + travelTime) {
						return true;
					}
				}

				return false;
			});

			if (powerHarvesters.length < 2 && powerHarvesters.length <= powerHealers.length && timeToKill > 0) {
				options.push({
					priority: 3,
					weight: 1,
					targetRoom: roomName,
				});
			}

			// Also spawn healers.
			if (powerHealers.length < 2 && powerHarvesters.length >= powerHealers.length && timeToKill > 0) {
				options.push({
					priority: 3,
					weight: 1,
					targetRoom: roomName,
					isHealer: true,
				});
			}
		});
	}
};