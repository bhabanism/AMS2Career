#include <windows.h>
#include <mmsystem.h>
#include <curl/curl.h>
#include <stdio.h>
#include <string>
#include <sstream>
#include <fstream>
#include <vector>
#include <iomanip>
#include <ctime>
#include <algorithm>
#include <filesystem>
#include "SharedMemory.h"

// Link with winmm and curl
#pragma comment(lib, "winmm.lib")
#pragma comment(lib, "libcurl.lib")

// Name of the shared memory-mapped file (wide-character)
#define MAP_OBJECT_NAME L"$pcars2$"

// Log file for console messages
std::ofstream logFile;

// Structure to hold race result data for sorting
struct RaceResult {
    unsigned int position;
    std::string driverName;
    std::string sessionName;
    std::string carName;
    std::string trackName;
    std::string trackLayout;
    std::string carClass;
};

// Structure to hold server config
struct ServerConfig {
    std::string server;
    int port;
};

// Format time from seconds to MM:SS.sss (not used in CSV/JSON but kept for future use)
std::string formatTime(float seconds) {
    if (seconds <= 0 || seconds == -1.0f) return "N/A";
    int minutes = static_cast<int>(seconds / 60);
    float secs = seconds - (minutes * 60);
    char buffer[16];
    snprintf(buffer, sizeof(buffer), "%02d:%06.3f", minutes, secs);
    return std::string(buffer);
}

// Log to both console and file
void logMessage(const std::string& level, const std::string& message) {
    time_t now = time(nullptr);
    char timeStr[32];
    strftime(timeStr, sizeof(timeStr), "%Y-%m-%d %H:%M:%S", localtime(&now));
    std::stringstream logEntry;
    logEntry << timeStr << " [" << level << "] " << message << "\n";
    printf("%s", logEntry.str().c_str());
    if (logFile.is_open()) {
        logFile << logEntry.str();
        logFile.flush();
    }
}

// Read server config from config.properties
ServerConfig readConfig() {
    ServerConfig config = {"example.com", 3000};
    std::ifstream configFile("config.properties");
    if (!configFile.is_open()) {
        logMessage("ERROR", "Failed to open config.properties, using default server: example.com:3000");
        return config;
    }
    std::string line;
    while (std::getline(configFile, line)) {
        if (line.find("server=") == 0) {
            config.server = line.substr(7);
        } else if (line.find("port=") == 0) {
            config.port = std::stoi(line.substr(5));
        }
    }
    configFile.close();
    logMessage("INFO", "Server config loaded: " + config.server + ":" + std::to_string(config.port));
    return config;
}

// Callback for libcurl to ignore response data
size_t writeCallback(void* contents, size_t size, size_t nmemb, void* userp) {
    return size * nmemb;
}

// Send JSON file content via HTTP POST
bool sendJsonFile(const std::string& filename, const ServerConfig& config) {
    CURL* curl = curl_easy_init();
    if (!curl) {
        logMessage("ERROR", "Failed to initialize curl for " + filename);
        return false;
    }

    std::ifstream file(filename, std::ios::binary);
    if (!file.is_open()) {
        logMessage("ERROR", "Failed to read JSON file: " + filename);
        curl_easy_cleanup(curl);
        return false;
    }

    std::stringstream buffer;
    buffer << file.rdbuf();
    std::string jsonData = buffer.str();
    file.close();

    std::string url = "http://" + config.server + ":" + std::to_string(config.port) + "/upload";
    curl_easy_setopt(curl, CURLOPT_URL, url.c_str());
    curl_easy_setopt(curl, CURLOPT_POST, 1L);
    curl_easy_setopt(curl, CURLOPT_POSTFIELDS, jsonData.c_str());
    curl_easy_setopt(curl, CURLOPT_POSTFIELDSIZE, jsonData.length());
    curl_easy_setopt(curl, CURLOPT_WRITEFUNCTION, writeCallback);

    struct curl_slist* headers = NULL;
    headers = curl_slist_append(headers, "Content-Type: application/json");
    curl_easy_setopt(curl, CURLOPT_HTTPHEADER, headers);

    CURLcode res = curl_easy_perform(curl);
    long httpCode = 0;
    curl_easy_getinfo(curl, CURLINFO_RESPONSE_CODE, &httpCode);
    curl_slist_free_all(headers);
    curl_easy_cleanup(curl);

    if (res != CURLE_OK) {
        logMessage("ERROR", "Failed to send " + filename + ": " + curl_easy_strerror(res));
        return false;
    }
    if (httpCode != 200) {
        logMessage("ERROR", "Server returned HTTP " + std::to_string(httpCode) + " for " + filename);
        return false;
    }

    logMessage("INFO", "Successfully sent " + filename + " to server");
    return true;
}

// Process and send all JSON files in output/
void processOutputFiles(const ServerConfig& config) {
    namespace fs = std::filesystem;
    if (!fs::exists("sent")) {
        fs::create_directory("sent");
        logMessage("INFO", "Created sent/ directory");
    }
    if (!fs::exists("output")) {
        fs::create_directory("output");
        logMessage("INFO", "Created output/ directory");
    }

    for (const auto& entry : fs::directory_iterator("output")) {
        if (entry.path().extension() != ".json") continue;

        std::string filename = entry.path().string();
        while (!sendJsonFile(filename, config)) {
            logMessage("INFO", "Retrying " + filename + " in 15 seconds");
            Sleep(15000); // Retry every 15 seconds
        }

        std::string sentFilename = "sent/" + entry.path().filename().string();
        try {
            fs::rename(filename, sentFilename);
            logMessage("INFO", "Moved " + filename + " to " + sentFilename);
        } catch (const fs::filesystem_error& e) {
            logMessage("ERROR", "Failed to move " + filename + " to sent/: " + e.what());
        }
    }
}

// Get session name from mSessionState
std::string getSessionName(unsigned int sessionState) {
    switch (sessionState) {
        case SESSION_INVALID: return "Invalid";
        case SESSION_PRACTICE: return "Practice";
        case SESSION_TEST: return "Test";
        case SESSION_QUALIFY: return "Qualify";
        case SESSION_FORMATION_LAP: return "Formation Lap";
        case SESSION_RACE: return "Race";
        case SESSION_TIME_ATTACK: return "Time Attack";
        default: return "Unknown";
    }
}

// Get race status from mRaceStates
std::string getRaceStatus(unsigned int raceState) {
    switch (raceState) {
        case RACESTATE_INVALID: return "Invalid";
        case RACESTATE_NOT_STARTED: return "Not Started";
        case RACESTATE_RACING: return "Racing";
        case RACESTATE_FINISHED: return "Finished";
        case RACESTATE_DISQUALIFIED: return "Disqualified";
        case RACESTATE_RETIRED: return "Retired";
        case RACESTATE_DNF: return "DNF";
        default: return "Unknown";
    }
}

// Generate timestamped filename (output/results_YYYYMMDD_HHMM.csv/json)
std::string getResultFilename(const std::string& extension) {
    time_t now = time(nullptr);
    char timeStr[32];
    strftime(timeStr, sizeof(timeStr), "output/results_%Y%m%d_%H%M", localtime(&now));
    return std::string(timeStr) + "." + extension;
}

// Escape string for JSON
std::string escapeJsonString(const std::string& input) {
    std::string output;
    for (char c : input) {
        if (c == '"') output += "\\\"";
        else if (c == '\\') output += "\\\\";
        else output += c;
    }
    return output;
}

// Log race results to CSV and JSON
void logResults(const SharedMemory* sharedData, bool enableCsv, const ServerConfig& config) {
    std::string csvFilename = getResultFilename("csv");
    std::string jsonFilename = getResultFilename("json");

    // Collect results
    std::vector<RaceResult> results;
    std::string sessionName = getSessionName(sharedData->mSessionState);
    std::string trackName = std::string(sharedData->mTranslatedTrackLocation);
    if (trackName.empty()) trackName = std::string(sharedData->mTrackLocation);
    std::string trackLayout = std::string(sharedData->mTranslatedTrackVariation);
    if (trackLayout.empty()) trackLayout = std::string(sharedData->mTrackVariation);

    for (int i = 0; i < sharedData->mNumParticipants && i < STORED_PARTICIPANTS_MAX; ++i) {
        if (!sharedData->mParticipantInfo[i].mIsActive) continue;

        RaceResult result;
        result.position = sharedData->mParticipantInfo[i].mRacePosition;
        result.driverName = std::string(sharedData->mParticipantInfo[i].mName);
        result.sessionName = sessionName;
        result.carName = std::string(sharedData->mCarNames[i]);
        result.trackName = trackName;
        result.trackLayout = trackLayout;
        result.carClass = std::string(sharedData->mCarClassNames[i]);
        results.push_back(result);
    }

    // Sort by position
    std::sort(results.begin(), results.end(), [](const RaceResult& a, const RaceResult& b) {
        return a.position < b.position;
    });

    // Write CSV if enabled
    if (enableCsv) {
        std::ofstream csvFile(csvFilename, std::ios::out); // Overwrite for new race
        if (!csvFile.is_open()) {
            logMessage("ERROR", "Failed to open CSV file: " + csvFilename);
        } else {
            csvFile << "\"Session Name\",\"TrackName\",\"Position\",\"DriverName\",\"CarName\"\n";
            logMessage("INFO", "CSV file created: " + csvFilename);

            for (const auto& result : results) {
                csvFile << "\"" << result.sessionName << "\","
                        << "\"" << result.trackName << "\","
                        << result.position << ","
                        << "\"" << result.driverName << "\","
                        << "\"" << result.carName << "\"\n";
            }
            csvFile.close();
            logMessage("INFO", "CSV results logged to " + csvFilename + " for " + std::to_string(results.size()) + " participants");
        }
    } else {
        logMessage("INFO", "CSV creation disabled, skipping: " + csvFilename);
    }

    // Write JSON
    std::ofstream jsonFile(jsonFilename, std::ios::out);
    if (!jsonFile.is_open()) {
        logMessage("ERROR", "Failed to open JSON file: " + jsonFilename);
        return;
    }

    jsonFile << "{\n";
    jsonFile << "  \"Session Name\": \"" << escapeJsonString(sessionName) << "\",\n";
    jsonFile << "  \"TrackName\": \"" << escapeJsonString(trackName) << "\",\n";
    jsonFile << "  \"TrackLayout\": \"" << escapeJsonString(trackLayout) << "\",\n";
    jsonFile << "  \"Drivers\": [\n";
    for (size_t i = 0; i < results.size(); ++i) {
        jsonFile << "    {\n";
        jsonFile << "      \"Position\": " << results[i].position << ",\n";
        jsonFile << "      \"DriverName\": \"" << escapeJsonString(results[i].driverName) << "\",\n";
        jsonFile << "      \"CarName\": \"" << escapeJsonString(results[i].carName) << "\",\n";
        jsonFile << "      \"CarClass\": \"" << escapeJsonString(results[i].carClass) << "\"\n";
        jsonFile << "    }" << (i < results.size() - 1 ? "," : "") << "\n";
    }
    jsonFile << "  ]\n";
    jsonFile << "}\n";
    jsonFile.close();
    logMessage("INFO", "JSON results logged to " + jsonFilename + " for " + std::to_string(results.size()) + " participants");
    logMessage("DEBUG", "Shared memory data fetched for race results");

    // Play WAV file after writing files
    if (!PlaySoundA("audio/racesavednotify.wav", NULL, SND_FILENAME | SND_ASYNC)) {
        logMessage("ERROR", "Failed to play audio/racesavednotify.wav (error code: " + std::to_string(GetLastError()) + ")");
    } else {
        logMessage("INFO", "Notification sound played for file write");
    }

    // Send JSON files to server
    processOutputFiles(config);
}

int main() {
    // Enable CSV creation (set to false by default)
    const bool enableCsv = false;

    // Open log file
    logFile.open("log/info.log", std::ios::app);
    if (!logFile.is_open()) {
        printf("ERROR: Failed to open log file: log/info.log\n");
        return 1;
    }
    logMessage("INFO", "AMS2 Race Logger started");
    logMessage("INFO", "CSV output " + std::string(enableCsv ? "enabled" : "disabled"));

    // Test WAV file at startup
    if (!PlaySoundA("audio/startup.wav", NULL, SND_FILENAME | SND_ASYNC)) {
        logMessage("ERROR", "Failed to play audio/startup.wav at startup (error code: " + std::to_string(GetLastError()) + ")");
    } else {
        logMessage("INFO", "Test notification sound played at startup");
    }

    // Initialize curl
    curl_global_init(CURL_GLOBAL_ALL);

    // Read server config and process existing JSON files
    ServerConfig config = readConfig();
    processOutputFiles(config);

    // Retry shared memory connection
    HANDLE fileHandle = NULL;
    const SharedMemory* sharedData = NULL;
    SharedMemory* localCopy = NULL;

    while (true) {
        fileHandle = OpenFileMappingW(PAGE_READONLY, FALSE, MAP_OBJECT_NAME);
        if (fileHandle == NULL) {
            logMessage("INFO", "Failed to open shared memory, retrying in 30 seconds (error code: " + std::to_string(GetLastError()) + ")");
            Sleep(30000); // Retry every 30 seconds
            continue;
        }

        sharedData = (SharedMemory*)MapViewOfFile(fileHandle, PAGE_READONLY, 0, 0, sizeof(SharedMemory));
        if (sharedData == NULL) {
            logMessage("INFO", "Failed to map shared memory, retrying in 30 seconds (error code: " + std::to_string(GetLastError()) + ")");
            CloseHandle(fileHandle);
            fileHandle = NULL;
            Sleep(30000); // Retry every 30 seconds
            continue;
        }

        logMessage("INFO", "Connection established to shared memory");
        break;
    }

    localCopy = new SharedMemory;

    // Check version
    if (sharedData->mVersion != SHARED_MEMORY_VERSION) {
        logMessage("ERROR", "Data version mismatch. Expected " + std::to_string(SHARED_MEMORY_VERSION) + ", got " + std::to_string(sharedData->mVersion));
        UnmapViewOfFile(sharedData);
        CloseHandle(fileHandle);
        logFile.close();
        delete localCopy;
        curl_global_cleanup();
        return 1;
    }

    bool raceEnded = false;
    unsigned int lastSessionState = SESSION_INVALID;
    std::string lastRaceStatus = "";
    unsigned int lastNumParticipants = 0;
    unsigned int lastSessionStateDebug = 0;
    unsigned int lastRaceState = 0;

    while (true) {
        // Skip if writing is in progress (odd sequence number)
        if (sharedData->mSequenceNumber % 2) {
            continue;
        }

        // Copy shared memory with error handling
        try {
            memcpy(localCopy, sharedData, sizeof(SharedMemory));
            if (localCopy->mSequenceNumber != sharedData->mSequenceNumber) {
                logMessage("DEBUG", "Sequence number mismatch, skipping");
                continue;
            }
        } catch (...) {
            logMessage("ERROR", "Exception during shared memory copy");
            continue;
        }

        // Debug logging for state changes
        if (localCopy->mNumParticipants != lastNumParticipants || localCopy->mSessionState != lastSessionStateDebug || localCopy->mRaceStates[0] != lastRaceState) {
            logMessage("DEBUG", "NumParticipants: " + std::to_string(localCopy->mNumParticipants) +
                                ", SessionState: " + std::to_string(localCopy->mSessionState) +
                                ", RaceState[0]: " + std::to_string(localCopy->mRaceStates[0]));
            lastNumParticipants = localCopy->mNumParticipants;
            lastSessionStateDebug = localCopy->mSessionState;
            lastRaceState = localCopy->mRaceStates[0];
        }

        // Log session name changes
        if (localCopy->mSessionState != lastSessionState) {
            std::string sessionName = getSessionName(localCopy->mSessionState);
            logMessage("INFO", "Session name: " + sessionName);
            lastSessionState = localCopy->mSessionState;
        }

        // Log race status for viewed participant
        if (localCopy->mViewedParticipantIndex >= 0 && localCopy->mViewedParticipantIndex < localCopy->mNumParticipants) {
            std::string raceStatus = getRaceStatus(localCopy->mRaceStates[localCopy->mViewedParticipantIndex]);
            if (raceStatus != lastRaceStatus) {
                logMessage("INFO", "Race status: " + raceStatus);
                lastRaceStatus = raceStatus;
            }
        }

        // Detect race end (session is Race and all participants finished)
        if (localCopy->mSessionState == SESSION_RACE && !raceEnded) {
            bool allFinished = true;
            for (int i = 0; i < localCopy->mNumParticipants && i < STORED_PARTICIPANTS_MAX; ++i) {
                if (localCopy->mParticipantInfo[i].mIsActive && localCopy->mRaceStates[i] != RACESTATE_FINISHED && localCopy->mRaceStates[i] != RACESTATE_DISQUALIFIED && localCopy->mRaceStates[i] != RACESTATE_RETIRED && localCopy->mRaceStates[i] != RACESTATE_DNF) {
                    allFinished = false;
                    break;
                }
            }
            if (allFinished) {
                logMessage("INFO", "Race ends");
                logResults(localCopy, enableCsv, config);
                raceEnded = true;
            }
        }

        // Reset raceEnded when a new race starts
        if (localCopy->mSessionState == SESSION_RACE && raceEnded && localCopy->mRaceStates[localCopy->mViewedParticipantIndex] == RACESTATE_RACING) {
            logMessage("INFO", "New race started, resetting raceEnded flag");
            raceEnded = false;
        }

        Sleep(500); // Check every 500ms
    }

    // Cleanup
    UnmapViewOfFile(sharedData);
    CloseHandle(fileHandle);
    delete localCopy;
    logFile.close();
    curl_global_cleanup();
    logMessage("INFO", "AMS2 Race Logger stopped");

    printf("Press Enter to exit...\n");
    getchar();

    return 0;
}