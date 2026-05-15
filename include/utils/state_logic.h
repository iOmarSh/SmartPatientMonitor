#pragma once
#include "system_types.h"

// Parameters for logic thresholds
const float WARNING_DISTANCE_CM = 30.0f;
const float DANGER_TEMPERATURE_C = 38.0f;

/**
 * Pure, isolated logic layer for evaluating system state based on sensor data.
 * Implemented as inline so test builds can link the function directly from
 * the header without depending on separate compilation units.
 */
inline SystemState determineSystemState(const SensorData& data)
{
	if (data.emergencyPressed)
	{
		return STATE_EMERGENCY;
	}
	else if (data.temperature >= DANGER_TEMPERATURE_C)
	{
		return STATE_DANGER;
	}
	else if (data.distance > 0.0f && data.distance <= WARNING_DISTANCE_CM)
	{
		return STATE_WARNING;
	}
	return STATE_NORMAL;
}
