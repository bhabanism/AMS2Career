public class HaversineDistance {

    // Earth's mean radius in kilometers
    private static final double EARTH_RADIUS_KM = 6371.0;

    /**
     * Inner class to represent a geographic location with latitude and longitude.
     */
    public static class Location {
        private final double lat;
        private final double lon;

        /**
         * Constructor to create a Location object.
         *
         * @param lat Latitude in degrees
         * @param lon Longitude in degrees
         */
        public Location(double lat, double lon) {
            this.lat = lat;
            this.lon = lon;
        }

        public double getLat() {
            return lat;
        }

        public double getLon() {
            return lon;
        }
    }

    /**
     * Calculates the great-circle distance between two points on Earth using the Haversine formula.
     *
     * @param loc1 Location object for the first point
     * @param loc2 Location object for the second point
     * @return Distance in kilometers
     */
    public static double calculateDistance(Location loc1, Location loc2) {
        // Convert degrees to radians
        double lat1Rad = Math.toRadians(loc1.getLat());
        double lon1Rad = Math.toRadians(loc1.getLon());
        double lat2Rad = Math.toRadians(loc2.getLat());
        double lon2Rad = Math.toRadians(loc2.getLon());

        // Differences in coordinates
        double deltaLat = lat2Rad - lat1Rad;
        double deltaLon = lon2Rad - lon1Rad;

        // Haversine formula components
        double a = Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2)
                + Math.cos(lat1Rad) * Math.cos(lat2Rad)
                * Math.sin(deltaLon / 2) * Math.sin(deltaLon / 2);
        double c = 2 * Math.asin(Math.sqrt(a));

        // Distance
        return EARTH_RADIUS_KM * c;
    }

    public static void main(String[] args) {
        // Example: Distance between New York and London using Location objects
        Location fromLoc = new Location(44.05,-78.68); // Mosport
        Location toLoc = new Location(34.71,135.80); // Kansai	
        double distance = calculateDistance(fromLoc, toLoc);
        System.out.printf("Distance: %.2f km%n", distance);  // Expected output: ~5570 km
    }
}