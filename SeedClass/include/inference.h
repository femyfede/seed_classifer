#ifndef INFERENCE_H
#define INFERENCE_H

#include <Arduino.h>

struct PredictionResult {
    String label;
    float confidence;
    bool valid;
};

bool initInference();
PredictionResult runSeedInference();

// Debug: send 'p' over serial to receive the current camera frame as hex JPEG.
void dumpFrameIfRequested();

#endif