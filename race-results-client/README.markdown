# Race Results Client

This is an Angular 20 application that serves as the frontend for displaying race results and driver points from a Node.js server. It fetches data from the server and renders a table showing each driver’s points per race (by TrackLayout) and total points, sorted by total points in descending order (highest points at the top, indicating the championship leader).

## Features and Functionality

- **Driver Points Table**:
  - **Columns**: Driver Name, points for each race (headed by TrackLayout, e.g., "WWT Raceway Oval"), Total Points.
  - **Rows**: Drivers, sorted by Total Points (descending).
  - **Dynamic Columns**: Automatically adjusts to the number of races based on server data.
- **Responsive Design**: Uses Tailwind CSS for a clean, responsive table that scrolls horizontally for many races.
- **Data Fetching**: Retrieves data from the server’s `/points/table` endpoint via HTTP.
- **Modular Structure**: Organized into components, services, and models for maintainability.

## Data Storage and Format

- **Data Source**: The client fetches data from the Node.js server (`http://localhost:3000/points/table`).
- **Data Format**:
  ```json
  {
    "trackLayouts": ["WWT Raceway Oval", "Monza Historic 1971", ...],
    "drivers": [
      {
        "driverName": "Jose Lopez",
        "racePoints": {
          "WWT Raceway Oval": 12,
          "Monza Historic 1971": 25,
          ...
        },
        "totalPoints": 82
      },
      ...
    ]
  }
  ```
- **Notes**:
  - `trackLayouts`: Array of race names used as column headers.
  - `drivers`: Array of driver objects with points per race and total points.
  - The client does not store data locally; it relies on the server for all data.

## Installation

1. **Prerequisites**:
   - Node.js 18.19.0 or later.
   - npm (included with Node.js).
   - Angular CLI 20 (`npm install -g @angular/cli@20.0.0`).

2. **Clone or Set Up the Project**:
   - Place the client code in a directory (e.g., `client/`).
   - Ensure the project structure matches:
     ```
     client/
     ├── src/
     │   ├── app/
     │   │   ├── components/
     │   │   │   ├── driver-points/
     │   │   │   ├── header/
     │   │   ├── models/
     │   │   ├── services/
     │   │   ├── app.component.*
     │   │   ├── app.config.ts
     │   │   ├── app.routes.ts
     │   ├── assets/
     │   ├── styles.scss
     │   ├── index.html
     │   ├── main.ts
     ├── angular.json
     ├── package.json
     ├── tailwind.config.js
     ├── tsconfig.json
     ├── tsconfig.app.json
     ├── README.md
     ```

3. **Install Dependencies**:
   ```bash
   cd client
   npm install
   ```

## Running the Client

1. **Ensure the Server is Running**:
   - The client depends on the Node.js server at `http://localhost:3000`.
   - Start the server in the `server` directory:
     ```bash
     cd ../server
     npm start
     ```

2. **Compile Tailwind CSS**:
   - In a separate terminal, run the Tailwind CSS compiler:
     ```bash
     cd client
     npx tailwindcss -i ./src/styles.scss -o ./src/styles.css --watch
     ```

3. **Start the Angular Development Server**:
   ```bash
   npm start
   ```
   - The app runs at `http://localhost:4200`.
   - Open a browser and navigate to `http://localhost:4200` to view the driver points table.

## Development Notes

- **Dependencies**: Managed via `package.json`. Key packages include `@angular/*`, `tailwindcss`, `rxjs`, and `zone.js`.
- **Components**:
  - `HeaderComponent`: Displays a static header with the app title.
  - `DriverPointsComponent`: Renders the dynamic table of driver points.
- **Services**:
  - `RaceService`: Handles HTTP requests to the server for data fetching.
- **Models**:
  - `DriverPoints`: Interface for driver data (name, race points, total points).
  - `RaceResult`: Interface for raw race result data (for potential future use).
- **Styling**: Tailwind CSS provides responsive, modern styling. Customize in `styles.scss` or component-specific SCSS files.
- **Error Handling**: Basic error logging in the console. Enhance with UI notifications (e.g., toasts) if needed.
- **Scalability**: The table dynamically adjusts to any number of races provided by the server.

## Troubleshooting

- **Server Not Running**: Ensure the Node.js server is active at `http://localhost:3000` before starting the client.
- **Table Not Displaying**: Check the browser console for errors (e.g., HTTP 500 from the server) and verify `server_data` contains valid JSON files.
- **Styling Issues**: Confirm the Tailwind CSS compiler is running (`npx tailwindcss ...`).
- **Build Errors**: Clear the cache and rebuild:
  ```bash
  rm -rf .angular dist
  ng cache clean
  npm start
  ```

For issues or enhancements, check the browser console or update the client code in `src/app/`.