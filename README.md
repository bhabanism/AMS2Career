# AMS2 Race Logger

A system to log race results from Automobilista 2 (AMS2), send them to a Node.js server, and display them in a web-based Angular UI. The client application captures race data via shared memory, saves it as JSON files, and uploads them to a server, which stores the data and serves it to an Angular 20 frontend for visualization.

## Features

### Client (C++ Application)
- **Race Data Capture**: Retrieves race results from AMS2 using shared memory (`$pcars2$`).
- **JSON Output**: Saves results as JSON files (`output/results_YYYYMMDD_HHMM.json`) with `Session Name`, `TrackName`, `TrackLayout`, and `Drivers` (sorted by `Position`).
- **Optional CSV Output**: Can generate CSV files with `Session Name`, `TrackName`, `Position`, `DriverName`, and `CarName` (disabled by default).
- **HTTP Upload**: Sends JSON files to a Node.js server’s `/upload` endpoint, retrying every 15 seconds until HTTP 200.
- **File Management**: Moves successfully uploaded JSON files to `sent/`.
- **Audio Feedback**: Plays `startup.wav` at launch and `racesavednotify.wav` after saving results.
- **Logging**: Logs events and errors to `log/info.log`.
- **Robust Connection**: Retries shared memory connection every 30 seconds if AMS2 is not running.
- **Custom Icon**: Compiled executable (`ams2results.exe`) uses a custom `logo.ico`.

### Server (Node.js)
- **Data Storage**: Saves each POST request’s JSON data to `server_data/results_YYYYMMDDHHMMSSmmm.json`.
- **API Endpoint**: Provides `GET /results` to retrieve all race results for the UI.
- **CORS Support**: Allows Angular UI to fetch data from `http://localhost:3000/results`.

### UI (Angular 20)
- **Race Results Display**: Shows a table with `Position`, `DriverName`, `CarName`, and `CarClass`, sorted by `Position`.
- **Dynamic Title**: Displays “Race at {TrackLayout}” (e.g., “Race at GP”) for the latest race.
- **Modern Features**: Uses Angular 20 standalone components, signals for reactive state, and Angular Material for a sortable table.
- **Styling**: Uses Tailwind CSS for responsive design.

## Installation

### Prerequisites
- **Client**:
  - Windows OS (for AMS2 and C++ executable).
  - MSYS2 (UCRT64 environment) with MinGW GCC.
  - `libcurl` for HTTP requests.
  - AMS2 with Shared Memory set to “Project CARS 2” (Options > System).
- **Server and UI**:
  - Node.js (v20.x or later, e.g., v20.17.0).
  - Angular CLI (v20.x).
  - npm (v10.x, e.g., v10.8.3).

### Client Setup
1. **Install MSYS2**:
   - Download and install MSYS2 from [msys2.org](https://www.msys2.org/).
   - Open MSYS2 UCRT64 terminal and update packages:
     ```bash
     pacman -Syu
     ```
   - Install GCC and `libcurl`:
     ```bash
     pacman -S mingw-w64-ucrt-x86_64-gcc mingw-w64-ucrt-x86_64-curl
     ```

2. **Clone Repository**:
   - Clone the project to `C:\AMS2Logger`:
     ```bash
     git clone <repository-url> C:/AMS2Logger
     cd C:/AMS2Logger
     ```

3. **Configure**:
   - Edit `config.properties` in the root folder with your server details:
     ```
     server=127.0.0.1
     port=3000
     ```
   - Place `racesavednotify.wav`, `startup.wav`, and `logo.ico` in `audio/` and `resources/` as needed.

4. **Compile**:
   - Run the build script:
     ```bash
     ./build.bat
     ```
   - Outputs `ams2results.exe` in the root folder.

### Server Setup
1. **Install Node.js**:
   - Download Node.js (v20.x) from [nodejs.org](https://nodejs.org).
   - Verify:
     ```bash
     node --version
     npm --version
     ```

2. **Set Up Server**:
   - Navigate to the server directory:
     ```bash
     cd server
     ```
   - Install dependencies:
     ```bash
     npm install express cors
     ```
   - Save `server.js` from the repository.
   - Run the server:
     ```bash
     node server.js
     ```
     Expected output:
     ```
     Server running at http://localhost:3000
     ```

### UI Setup (Angular 20)
1. **Install Angular CLI**:
   - Install globally:
     ```bash
     npm install -g @angular/cli@20
     ```
   - Verify:
     ```bash
     ng --version
     ```

2. **Create Angular Project**:
   - In the `server/` directory:
     ```bash
     cd server
     ng new race-results-ui --standalone --style=css --routing=false
     cd race-results-ui
     ```
   - Choose `CSS` for styling, skip routing.

3. **Install Dependencies**:
   - Install Angular Material:
     ```bash
     ng add @angular/material@20
     ```
     Select a theme (e.g., `Indigo/Pink`).

4. **Update Files**:
   - Replace `src/app/app.component.ts` with `src/app/app.ts`.
   - Replace `src/app/app.component.html` with `src/app/app.html`.
   - Save `src/app/app.css`, `src/main.ts`, and `src/index.html` from the repository.
   - Update `angular.json` to reference `app.ts` and `app.html`.

5. **Fix Dependencies**:
   - If you encounter `Could not find '@angular-devkit/build-angular:dev-server'`:
     ```bash
     rm -rf node_modules package-lock.json
     npm install
     npm install --save-dev @angular-devkit/build-angular@20 typescript@5.5.4
     ```

## Usage

### Running the Client
1. Ensure AMS2 is installed and Shared Memory is set to “Project CARS 2” (Options > System).
2. Run `ams2results.exe` as administrator:
   ```bash
   cd C:/AMS2Logger
   ./ams2results.exe
   ```
   Or right-click `ams2results.exe` > Run as administrator.
3. Start a single-player race in AMS2 (e.g., 2 laps).
4. The program:
   - Logs to `log/info.log`.
   - Creates JSON files in `output/` (e.g., `results_20250706_1611.json`).
   - Sends JSON to `http://localhost:3000/upload`, retries every 15 seconds.
   - Moves successful files to `sent/`.
   - Plays audio notifications.

### Running the Server
1. From `server/`:
   ```bash
   node server.js
   ```
2. The server saves JSON data to `server_data/results_YYYYMMDDHHMMSSmmm.json` and serves results at `/results`.

### Running the UI
1. From `server/race-results-ui/`:
   ```bash
   ng serve --open
   ```
2. Opens `http://localhost:4200` in your browser, displaying a table with `Position`, `DriverName`, `CarName`, `CarClass`, titled “Race at {TrackLayout}” (e.g., “Race at GP”).

### Expected Output
- **Client Log** (`log/info.log`):
  ```
  2025-07-06 16:11:00 [INFO] AMS2 Race Logger started
  2025-07-06 16:11:00 [INFO] CSV output disabled
  2025-07-06 16:11:00 [INFO] JSON results logged to output/results_20250706_1611.json with 10 participants
  2025-07-06 16:11:00 [INFO] Successfully sent output/results_20250706_1611.json to server
  ```
- **Server Files**: `server_data/results_20250706161100123.json`.
- **UI**:
  ```
  Race at GP
  Position | Driver Name | Car Name      | Car Class
  1        | Player      | Porsche 962C  | Group C
  2        | AI_Driver1  | Lotus 72E     | Formula Vintage
  ```

## Folder Structure
- **Client (C:\AMS2Logger)**:
  ```
  C:\AMS2Logger\
  ├── ams2results.exe
  ├── resource.o
  ├── config.properties
  ├── build.bat
  ├── src\
  │   ├── race_logger.cpp
  │   ├── SharedMemory.h
  ├── resources\
  │   ├── resource.rc
  │   ├── logo.ico
  ├── audio\
  │   ├── racesavednotify.wav
  │   ├── startup.wav
  ├── output\
  │   (JSON files)
  ├── sent\
  │   (JSON files after upload)
  ├── log\
  │   ├── info.log
  ```
- **Server**:
  ```
  server/
  ├── server.js
  ├── server_data/
  │   ├── results_YYYYMMDDHHMMSSmmm.json
  ├── race-results-ui/
  │   ├── src/
  │   │   ├── app/
  │   │   │   ├── app.ts
  │   │   │   ├── app.html
  │   │   │   ├── app.css
  │   │   ├── main.ts
  │   │   ├── index.html
  │   ├── package.json
  │   ├── angular.json
  ```

## Dependencies
- **Client**: MinGW GCC, `libcurl` (MSYS2: `mingw-w64-ucrt-x86_64-curl`).
- **Server**: Node.js, `express`, `cors`.
- **UI**: Angular 20, Angular Material 20, Tailwind CSS (CDN), TypeScript ~5.5.4.

## License
MIT License. See [LICENSE](LICENSE) for details.