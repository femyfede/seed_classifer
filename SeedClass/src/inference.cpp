#include "inference.h"
#include "camera.h"
#include "config.h"

#include <Arduino.h>
#include <seedy_final_inferencing.h>

#include "esp_camera.h"
#include "esp_heap_caps.h"
#include "edge-impulse-sdk/dsp/image/image.hpp"

static constexpr uint32_t RAW_IMAGE_WIDTH = CAMERA_RAW_WIDTH;
static constexpr uint32_t RAW_IMAGE_HEIGHT = CAMERA_RAW_HEIGHT;
static constexpr uint32_t IMAGE_CHANNELS = CAMERA_IMAGE_CHANNELS;

static uint8_t *cameraImageBuffer = nullptr;
static uint8_t *modelWorkingBuffer = nullptr;

static size_t cameraBufferSize = 0;
static size_t modelWorkingBufferSize = 0;

static bool inferenceReady = false;

static int getImageData(
    size_t offset,
    size_t length,
    float *outputPtr
)
{
    if (
        modelWorkingBuffer == nullptr ||
        outputPtr == nullptr
    ) {
        return -1;
    }

    const size_t totalPixels =
        EI_CLASSIFIER_INPUT_WIDTH *
        EI_CLASSIFIER_INPUT_HEIGHT;

    if ((offset + length) > totalPixels) {
        return -1;
    }

    size_t byteIndex = offset * IMAGE_CHANNELS;

    for (size_t index = 0; index < length; index++) {
        const uint8_t red =
            modelWorkingBuffer[byteIndex];

        const uint8_t green =
            modelWorkingBuffer[byteIndex + 1];

        const uint8_t blue =
            modelWorkingBuffer[byteIndex + 2];

        outputPtr[index] = static_cast<float>(
            (static_cast<uint32_t>(red) << 16) |
            (static_cast<uint32_t>(green) << 8) |
            static_cast<uint32_t>(blue)
        );

        byteIndex += IMAGE_CHANNELS;
    }

    return 0;
}

bool initInference()
{
    if (inferenceReady) {
        return true;
    }

#if !defined(EI_CLASSIFIER_SENSOR)

    Serial.println(
        "[INFERENCE] ERROR: EI_CLASSIFIER_SENSOR is undefined."
    );

    return false;

#endif

#if EI_CLASSIFIER_SENSOR != EI_CLASSIFIER_SENSOR_CAMERA

    Serial.println(
        "[INFERENCE] ERROR: Model is not an image model."
    );

    return false;

#endif

#if EI_CLASSIFIER_OBJECT_DETECTION == 1

    Serial.println(
        "[INFERENCE] ERROR: Image classification model required."
    );

    return false;

#endif

    Serial.println("[INFERENCE] Model information:");

    Serial.printf(
        "[INFERENCE] Input size: %d x %d\n",
        EI_CLASSIFIER_INPUT_WIDTH,
        EI_CLASSIFIER_INPUT_HEIGHT
    );

    Serial.printf(
        "[INFERENCE] DSP frame size: %d\n",
        EI_CLASSIFIER_DSP_INPUT_FRAME_SIZE
    );

    Serial.printf(
        "[INFERENCE] Number of labels: %d\n",
        EI_CLASSIFIER_LABEL_COUNT
    );

    Serial.printf(
        "[INFERENCE] Resize mode: %d\n",
        EI_CLASSIFIER_RESIZE_MODE
    );

    Serial.println("[INFERENCE] Labels:");

    for (
        size_t index = 0;
        index < EI_CLASSIFIER_LABEL_COUNT;
        index++
    ) {
        Serial.printf(
            "  %u: %s\n",
            static_cast<unsigned int>(index),
            ei_classifier_inferencing_categories[index]
        );
    }

    cameraBufferSize =
        RAW_IMAGE_WIDTH *
        RAW_IMAGE_HEIGHT *
        IMAGE_CHANNELS;

    modelWorkingBufferSize =
        RAW_IMAGE_WIDTH *
        RAW_IMAGE_HEIGHT *
        IMAGE_CHANNELS;

    cameraImageBuffer = static_cast<uint8_t *>(
        heap_caps_malloc(
            cameraBufferSize,
            MALLOC_CAP_SPIRAM | MALLOC_CAP_8BIT
        )
    );

    if (cameraImageBuffer == nullptr) {
        Serial.println(
            "[INFERENCE] ERROR: Camera buffer allocation failed."
        );

        return false;
    }

    modelWorkingBuffer = static_cast<uint8_t *>(
        heap_caps_malloc(
            modelWorkingBufferSize,
            MALLOC_CAP_SPIRAM | MALLOC_CAP_8BIT
        )
    );

    if (modelWorkingBuffer == nullptr) {
        Serial.println(
            "[INFERENCE] ERROR: Model buffer allocation failed."
        );

        free(cameraImageBuffer);
        cameraImageBuffer = nullptr;

        return false;
    }

    memset(
        cameraImageBuffer,
        0,
        cameraBufferSize
    );

    memset(
        modelWorkingBuffer,
        0,
        modelWorkingBufferSize
    );

    Serial.printf(
        "[INFERENCE] Camera buffer allocated: %u bytes\n",
        static_cast<unsigned int>(cameraBufferSize)
    );

    Serial.printf(
        "[INFERENCE] Model working buffer allocated: %u bytes\n",
        static_cast<unsigned int>(modelWorkingBufferSize)
    );

    Serial.printf(
        "[MEMORY] Internal free after buffers: %u bytes\n",
        static_cast<unsigned int>(
            heap_caps_get_free_size(MALLOC_CAP_INTERNAL)
        )
    );

    Serial.printf(
        "[MEMORY] Free PSRAM after buffers: %u bytes\n",
        static_cast<unsigned int>(
            heap_caps_get_free_size(MALLOC_CAP_SPIRAM)
        )
    );

    inferenceReady = true;

    return true;
}

PredictionResult runSeedInference()
{
    PredictionResult prediction;

    prediction.label = "unknown";
    prediction.confidence = 0.0f;
    prediction.valid = false;

    if (
        !inferenceReady ||
        !isCameraReady() ||
        cameraImageBuffer == nullptr ||
        modelWorkingBuffer == nullptr
    ) {
        Serial.println(
            "[INFERENCE] ERROR: Inference system is not initialized."
        );

        return prediction;
    }

    camera_fb_t *frame = esp_camera_fb_get();

    if (frame == nullptr) {
        Serial.println(
            "[CAMERA] ERROR: Frame capture failed."
        );

        return prediction;
    }

    Serial.printf(
        "[CAMERA] Frame: %u x %u, %u bytes\n",
        static_cast<unsigned int>(frame->width),
        static_cast<unsigned int>(frame->height),
        static_cast<unsigned int>(frame->len)
    );

    Serial.printf(
        "[CAMERA] Pixel format: %d\n",
        frame->format
    );

    if (
        frame->width != RAW_IMAGE_WIDTH ||
        frame->height != RAW_IMAGE_HEIGHT
    ) {
        Serial.println(
            "[CAMERA] ERROR: Unexpected frame dimensions."
        );

        esp_camera_fb_return(frame);

        return prediction;
    }

    const bool converted = fmt2rgb888(
        frame->buf,
        frame->len,
        frame->format,
        cameraImageBuffer
    );

    esp_camera_fb_return(frame);
    frame = nullptr;

    if (!converted) {
        Serial.println(
            "[INFERENCE] ERROR: JPEG-to-RGB conversion failed."
        );

        return prediction;
    }

    memset(
        modelWorkingBuffer,
        0,
        modelWorkingBufferSize
    );

    const int resizeResult =
        ei::image::processing::resize_image_using_mode(
            cameraImageBuffer,
            RAW_IMAGE_WIDTH,
            RAW_IMAGE_HEIGHT,
            modelWorkingBuffer,
            EI_CLASSIFIER_INPUT_WIDTH,
            EI_CLASSIFIER_INPUT_HEIGHT,
            IMAGE_CHANNELS,
            EI_CLASSIFIER_RESIZE_MODE
        );

    if (resizeResult != 0) {
        Serial.printf(
            "[INFERENCE] ERROR: Image resize failed: %d\n",
            resizeResult
        );

        return prediction;
    }

    ei::signal_t signal = {};

    signal.total_length =
        EI_CLASSIFIER_INPUT_WIDTH *
        EI_CLASSIFIER_INPUT_HEIGHT;

    signal.get_data = getImageData;

    if (
        signal.total_length !=
        EI_CLASSIFIER_DSP_INPUT_FRAME_SIZE
    ) {
        Serial.printf(
            "[INFERENCE] ERROR: Input size mismatch. "
            "Pixels=%u DSP=%u\n",
            static_cast<unsigned int>(signal.total_length),
            static_cast<unsigned int>(
                EI_CLASSIFIER_DSP_INPUT_FRAME_SIZE
            )
        );

        return prediction;
    }

    Serial.printf(
        "[MEMORY] Internal free before classifier: %u bytes\n",
        static_cast<unsigned int>(
            heap_caps_get_free_size(MALLOC_CAP_INTERNAL)
        )
    );

    Serial.printf(
        "[MEMORY] Largest internal block: %u bytes\n",
        static_cast<unsigned int>(
            heap_caps_get_largest_free_block(
                MALLOC_CAP_INTERNAL
            )
        )
    );

    Serial.printf(
        "[MEMORY] Free PSRAM before classifier: %u bytes\n",
        static_cast<unsigned int>(
            heap_caps_get_free_size(MALLOC_CAP_SPIRAM)
        )
    );

    ei_impulse_result_t result = {};

    Serial.println("[INFERENCE] Running classifier...");

    const EI_IMPULSE_ERROR error =
        run_classifier(
            &signal,
            &result,
            false
        );

    if (error != EI_IMPULSE_OK) {
        Serial.printf(
            "[INFERENCE] ERROR: run_classifier returned %d\n",
            error
        );

        return prediction;
    }

    Serial.println();
    Serial.println("========== IMAGE INFERENCE ==========");

    float highestConfidence = 0.0f;
    const char *highestLabel = "unknown";

    for (
        size_t index = 0;
        index < EI_CLASSIFIER_LABEL_COUNT;
        index++
    ) {
        const char *label =
            result.classification[index].label;

        const float confidence =
            result.classification[index].value;

        Serial.printf(
            "%-12s: %.4f\n",
            label,
            confidence
        );

        if (confidence > highestConfidence) {
            highestConfidence = confidence;
            highestLabel = label;
        }
    }

    prediction.label = highestLabel;
    prediction.confidence = highestConfidence;

    prediction.valid =
        highestConfidence >= CONFIDENCE_THRESHOLD;

    Serial.printf(
        "DSP time:       %d ms\n",
        result.timing.dsp
    );

    Serial.printf(
        "Inference time: %d ms\n",
        result.timing.classification
    );

#if EI_CLASSIFIER_HAS_ANOMALY == 1

    Serial.printf(
        "Anomaly time:   %d ms\n",
        result.timing.anomaly
    );

    Serial.printf(
        "Anomaly score:  %.4f\n",
        result.anomaly
    );

#endif

    Serial.printf(
        "Predicted class: %s\n",
        prediction.label.c_str()
    );

    Serial.printf(
        "Confidence:      %.2f%%\n",
        prediction.confidence * 100.0f
    );

    Serial.printf(
        "Accepted:        %s\n",
        prediction.valid ? "YES" : "NO"
    );

    Serial.println("=====================================");
    Serial.println();

    return prediction;
}