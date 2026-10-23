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

#endif