#include <Arduino.h>

#include "config.h"
#include "camera.h"
#include "inference.h"
#include "lcd.h"

// =====================================================
// Function declarations
// =====================================================

static void showStartupProgress(
    uint8_t percentage,
    const String &message
);

static PredictionResult getStablePrediction();

static void displayPrediction(
    const PredictionResult &result
);

static String normalizeLabel(
    const String &label
);

static void stopWithError(
    const String &line1,
    const String &line2
);

// =====================================================
// Setup
// =====================================================

void setup()
{
    Serial.begin(SERIAL_BAUD_RATE);
    delay(300);

    if (!initLcd()) {
        while (true) {
            delay(1000);
        }
    }

    displayLcdMessage(
        "Seed Classifier",
        "Powering On..."
    );

    delay(800);

    // -------------------------------------------------
    // 25%: memory check
    // -------------------------------------------------

    showStartupProgress(
        25,
        "Checking Memory"
    );

    if (!psramFound()) {
        stopWithError(
            "Memory Error",
            "Restart Device"
        );
    }

    delay(700);

    // -------------------------------------------------
    // 50%: camera initialization
    // -------------------------------------------------

    showStartupProgress(
        50,
        "Starting Camera"
    );

    if (!initCamera()) {
        stopWithError(
            "Camera Error",
            "Restart Device"
        );
    }

    delay(700);

    // -------------------------------------------------
    // 75%: model initialization
    // -------------------------------------------------

    showStartupProgress(
        75,
        "Loading Model"
    );

    if (!initInference()) {
        stopWithError(
            "Model Error",
            "Restart Device"
        );
    }

    delay(700);

    // -------------------------------------------------
    // 100%: ready
    // -------------------------------------------------

    showStartupProgress(
        100,
        "System Ready"
    );

    delay(1000);

    displayLcdMessage(
        "Seed Classifier",
        "Starts..."
    );

    delay(1200);

    displayLcdMessage(
        "Place Seed",
        "Under Camera"
    );

    delay(2000);
}

// =====================================================
// Main loop
// =====================================================

void loop()
{
    displayLcdMessage(
        "Hold Seed Still",
        "Preparing..."
    );

    // Give the camera time to adjust to the new seed.
    delay(SEED_POSITION_DELAY_MS);

    displayLcdMessage(
        "Scanning Seed",
        "Samples: 1-3"
    );

    PredictionResult result =
        getStablePrediction();

    displayPrediction(result);

    // Keep the result visible.
    delay(INFERENCE_INTERVAL_MS);

    displayLcdMessage(
        "Place Seed",
        "Under Camera"
    );

    delay(1000);
}

// =====================================================
// Capture three predictions and use majority voting
// =====================================================

static PredictionResult getStablePrediction()
{
    PredictionResult samples[CLASSIFICATION_SAMPLES];

    for (
        uint8_t index = 0;
        index < CLASSIFICATION_SAMPLES;
        index++
    ) {
        displayLcdMessage(
            "Scanning Seed",
            "Sample " +
                String(index + 1) +
                "/" +
                String(CLASSIFICATION_SAMPLES)
        );

        samples[index] = runSeedInference();

        if (index < CLASSIFICATION_SAMPLES - 1) {
            delay(SAMPLE_GAP_MS);
        }
    }

    String label0 = normalizeLabel(samples[0].label);
    String label1 = normalizeLabel(samples[1].label);
    String label2 = normalizeLabel(samples[2].label);

    String majorityLabel = "";

    if (label0 == label1 || label0 == label2) {
        majorityLabel = label0;
    }
    else if (label1 == label2) {
        majorityLabel = label1;
    }

    PredictionResult stableResult;

    stableResult.label = "unknown";
    stableResult.confidence = 0.0f;
    stableResult.valid = false;

    // No class appeared at least twice.
    if (majorityLabel.length() == 0) {
        return stableResult;
    }

    float confidenceTotal = 0.0f;
    uint8_t matchingSamples = 0;

    for (
        uint8_t index = 0;
        index < CLASSIFICATION_SAMPLES;
        index++
    ) {
        if (
            normalizeLabel(samples[index].label) ==
            majorityLabel
        ) {
            confidenceTotal +=
                samples[index].confidence;

            matchingSamples++;
        }
    }

    if (matchingSamples == 0) {
        return stableResult;
    }

    stableResult.label = majorityLabel;

    stableResult.confidence =
        confidenceTotal /
        static_cast<float>(matchingSamples);

    stableResult.valid =
        stableResult.confidence >=
        CONFIDENCE_THRESHOLD;

    return stableResult;
}

// =====================================================
// Normalize Edge Impulse labels
// =====================================================

static String normalizeLabel(
    const String &label
)
{
    if (label.equalsIgnoreCase("Asili")) {
        return "Asili";
    }

    if (label.equalsIgnoreCase("Chotara")) {
        return "Chotara";
    }

    if (label.equalsIgnoreCase("Huria")) {
        return "Huria";
    }

    if (label.equalsIgnoreCase("unrelated")) {
        return "Unrelated";
    }

    return label;
}

// =====================================================
// Display prediction
// =====================================================

static String getSeedRegion(
    const String &label
)
{
    if (label.equalsIgnoreCase("Asili")) {
        return "Central/E.Kenya";
    }

    if (label.equalsIgnoreCase("Chotara")) {
        return "W.Kenya";
    }

    if (label.equalsIgnoreCase("Huria")) {
        return "Rift Valley";
    }

    return "";
}

static String getSeedSoil(
    const String &label
)
{
    if (label.equalsIgnoreCase("Asili")) {
        return "Sandy loam";
    }

    if (label.equalsIgnoreCase("Chotara")) {
        return "Loam/clay";
    }

    if (label.equalsIgnoreCase("Huria")) {
        return "Volcanic";
    }

    return "";
}

static void displayPrediction(
    const PredictionResult &result
)
{
    const float confidencePercent =
        result.confidence * 100.0f;

    String confidenceLine =
        "Conf: " +
        String(confidencePercent, 1) +
        "%";

    if (!result.valid) {
        displayLcdMessage(
            "Unknown Seed",
            confidenceLine
        );

        delay(3000);
        return;
    }

    if (
        result.label.equalsIgnoreCase("Unrelated")
    ) {
        displayLcdMessage(
            "No Seed Found",
            "Try Again"
        );

        return;
    }

    String normalized =
        normalizeLabel(result.label);

    String classLine =
        "Class: " + normalized;

    displayLcdMessage(
        classLine,
        confidenceLine
    );

    delay(3000);

    String region = getSeedRegion(normalized);

    if (region.length() > 0) {
        displayLcdMessage(
            "Region:",
            region
        );

        delay(3000);

        String soil = getSeedSoil(normalized);

        displayLcdMessage(
            "Soil Type:",
            soil
        );

        delay(3000);
    }
}

// =====================================================
// Startup progress
// =====================================================

static void showStartupProgress(
    uint8_t percentage,
    const String &message
)
{
    displayLcdMessage(
        "Loading: " +
            String(percentage) +
            "%",
        message
    );
}

// =====================================================
// Fatal error
// =====================================================

static void stopWithError(
    const String &line1,
    const String &line2
)
{
    displayLcdMessage(
        line1,
        line2
    );

    while (true) {
        delay(1000);
    }
}