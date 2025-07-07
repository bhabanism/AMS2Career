const { POINTS_SYSTEM } = require('../utils/constants');

function calculateDriverPoints(raceResults) {
    const driverPoints = {};

    raceResults.forEach(race => {
        race.Drivers.forEach(driver => {
            const points = POINTS_SYSTEM[driver.Position - 1] || 0;
            if (!driverPoints[driver.DriverName]) {
                driverPoints[driver.DriverName] = 0;
            }
            driverPoints[driver.DriverName] += points;
        });
    });

    return Object.entries(driverPoints)
        .map(([driverName, points]) => ({ driverName, points }))
        .sort((a, b) => b.points - a.points);
}

function calculateDriverPointsTable(raceResults) {
    const driverData = {};
    const trackLayouts = raceResults.map(race => race.TrackLayout);

    // Initialize driver data
    raceResults.forEach(race => {
        race.Drivers.forEach(driver => {
            if (!driverData[driver.DriverName]) {
                driverData[driver.DriverName] = {
                    driverName: driver.DriverName,
                    racePoints: {},
                    totalPoints: 0
                };
            }
        });
    });

    // Assign points for each race
    raceResults.forEach(race => {
        race.Drivers.forEach(driver => {
            const points = POINTS_SYSTEM[driver.Position - 1] || 0;
            driverData[driver.DriverName].racePoints[race.TrackLayout] = points;
            driverData[driver.DriverName].totalPoints += points;
        });
    });

    // Convert to array and sort by total points
    return {
        trackLayouts,
        drivers: Object.values(driverData).sort((a, b) => b.totalPoints - a.totalPoints)
    };
}

module.exports = {
    calculateDriverPoints,
    calculateDriverPointsTable
};