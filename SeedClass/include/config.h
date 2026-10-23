#ifndef CONFIG_H
#define CONFIG_H

// =====================================================
// Serial configuration
// =====================================================

#define SERIAL_BAUD_RATE 115200

// =====================================================
// Classification configuration
// =====================================================

// Align with Edge Impulse model's EI_CLASSIFIER_THRESHOLD (0.6)
//
// Increase this gradually after confirming that:
// - Asili is detected correctly
// - Chotara is detected correctly
// - Huria is detected correctly
// - Unrelated scenes are rejected correctly
//
// Recommended final range: 0.65f to 0.70f
#define CONFIDENCE_THRESHOLD 0.6f

// Number of predictions used for majority voting.
#define CLASSIFICATION_SAMPLES 3

// Time between individual classification samples.
#define SAMPLE_GAP_MS 250

// Gives the user time to position the seed and allows
// the camera exposure to adjust to the changed scene.
#define SEED_POSITION_DELAY_MS 1500

// Time the final prediction remains visible on the LCD.
#define INFERENCE_INTERVAL_MS 3000

// =====================================================
// Camera warm-up configuration
// =====================================================

// Number of camera frames discarded during startup.
#define CAMERA_WARMUP_FRAMES 15

// Delay after each discarded startup frame.
#define CAMERA_WARMUP_FRAME_DELAY_MS 100

// =====================================================
// Camera image dimensions
// =====================================================

#define CAMERA_RAW_WIDTH 320
#define CAMERA_RAW_HEIGHT 240
#define CAMERA_IMAGE_CHANNELS 3

// =====================================================
// Camera orientation
// =====================================================
//
// These must match the orientation of the images the model was trained on.
// If the device sees a mirrored/upside-down scene, flip the corresponding
// value. Verify with a known seed before deploying.

#define CAMERA_VFLIP 1
#define CAMERA_HMIRROR 1

#endif