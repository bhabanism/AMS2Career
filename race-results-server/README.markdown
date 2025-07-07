# Race Results Server

This is a Node.js Express server that manages race result data for a racing championship. It processes JSON files containing race results, calculates driver points based on Formula 1 scoring (25, 18, 15, 12, 10, 8, 6, 4, 2, 1 for positions 1-10), and provides RESTful endpoints for data upload and retrieval. The server is designed to work with an Angular frontend to display driver points.

## Features and Functionality

- **Data Storage**: Stores race result JSON files in the `server_data` directory with timestamped filenames.
- **Points Calculation**: Aggregates driver points across multiple races using F1 scoring.
- **RESTful API**: Provides endpoints for uploading race results, retrieving raw results, and accessing processed driver points data.
- **CORS Support**: Enables cross-origin requests for frontend integration.

### Endpoints

1. **POST /upload**
   - **Description**: Accepts a JSON payload containing race result data and saves it as a file in `server_data`.
   - **Request Body**: JSON object with race details (see Data Storage section).
   - **Response**:
     - `200 OK`: `{ "message": "Data received and saved successfully" }`
     - `500 Internal Server Error`: `{ "message": "Error saving data: <error>" }`
   - **Example**:
     ```bash
     curl -X POST http://localhost:3000/upload -H "Content-Type: application/json" -d '{"SessionName":"Race","TrackName":"Gateway","TrackLayout":"WWT Raceway Oval","Drivers":[{"Position":1,"DriverName":"Shylock","CarName":"Brabham BT62","CarClass":"Hypercars"}]}'
     ```

2. **GET /results**
   - **Description**: Returns an array of all race result JSONs stored in `server_data`.
   - **Response**:
     - `200 OK`: Array of race result objects.
     - `500 Internal Server Error`: `{ "message": "Error reading results: <error>" }`
   - **Example**:
     ```bash
     curl http://localhost:3000/results
     ```

3. **GET /points/drivers**
   - **Description**: Returns a sorted array of drivers with their total points across all races.
   - **Response**:
     - `200 OK`: `[{ "driverName": "Jose Lopez", "points": 82 }, ...]`
     - `500 Internal Server Error`: `{ "message": "Error calculating driver points: <error>" }`
   - **Example**:
     ```bash
     curl http://localhost:3000/points/drivers
     ```

4. **GET /points/table**
   - **Description**: Returns data formatted for a table display, including track layouts and driver points per race.
   - **Response**:
     - `200 OK`: `{ "trackLayouts": ["WWT Raceway Oval", ...], "drivers": [{ "driverName": "Jose Lopez", "racePoints": { "WWT Raceway Oval": 12, ... }, "totalPoints": 82 }, ...] }`
     - `500 Internal Server Error`: `{ "message": "Error generating points table: <error>" }`
   - **Example**:
     ```bash
     curl http://localhost:3000/points/table
     ```

## Data Storage and Format

- **Location**: Race result JSON files are stored in the `server_data` directory (relative to `server/src/server.js`).
- **Filename Format**: `results_<timestamp>.json`, where `<timestamp>` is an ISO date string (e.g., `results_20250706101748720Z.json`).
- **JSON Structure**:
  ```json
  {
    "SessionName": "Race",
    "TrackName": "Gateway",
    "TrackLayout": "WWT Raceway Oval",
    "Drivers": [
      {
        "Position": 1,
        "DriverName": "Shylock",
        "CarName": "Brabham BT62",
        "CarClass": "Hypercars"
      },
      ...
    ]
  }
  ```
- **Notes**:
  - Each file represents one race.
  - The `Drivers` array lists participants with their finishing positions, names, car details, and class (all are "Hypercars" in the sample data).
  - Files are automatically created when data is posted to `/upload`.

## Installation

1. **Prerequisites**:
   - Node.js 18.19.0 or later.
   - npm (included with Node.js).

2. **Clone or Set Up the Project**:
   - Place the server code in a directory (e.g., `server/`).
   - Ensure the project structure matches:
     ```
     server/
     ├── src/
     │   ├── routes/
     │   │   ├── results.js
     │   │   ├── upload.js
     │   ├── services/
     │   │   ├── fileService.js
     │   │   ├── pointsService.js
     │   ├── utils/
     │   │   ├── constants.js
     │   ├── server.js
     ├── server_data/
     ├── package.json
     ├── README.md
     ```

3. **Install Dependencies**:
   ```bash
   cd server
   npm install
   ```

4. **Create `server_data` Directory**:
   - Ensure the `server_data` directory exists to store JSON files:
     ```bash
     mkdir server_data
     ```
   - Optionally, place sample JSON files in `server_data` (e.g., `results_20250706101748720Z.json`).

## Running the Server

1. **Start the Server**:
   ```bash
   npm start
   ```
   - The server runs at `http://localhost:3000`.
   - Use `npm run dev` for development with nodemon (auto-restarts on file changes).

2. **Verify Endpoints**:
   - Test endpoints using `curl`, Postman, or a browser (for GET requests).
   - Example: `curl http://localhost:3000/points/table`.

## Development Notes

- **Dependencies**: Managed via `package.json`. Key packages include `express`, `cors`, and `nodemon` (dev).
- **Error Handling**: Endpoints include basic error handling for file operations and JSON parsing.
- **Scalability**: The server supports any number of race JSON files in `server_data`.
- **CORS**: Enabled to allow requests from the Angular frontend (e.g., `http://localhost:4200`).

For issues or enhancements, check the console logs or update the server code in `src/`.