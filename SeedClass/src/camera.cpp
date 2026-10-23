#include "camera.h"
#include "config.h"

#include <Arduino.h>
#include "esp_camera.h"

// =====================================================
// XIAO ESP32S3 Sense camera pin configuration
// =====================================================

#define CAMERA_PIN_PWDN   -1
#define CAMERA_PIN_RESET  -1
#define CAMERA_PIN_XCLK   10
#define CAMERA_PIN_SIOD   40
#define CAMERA_PIN_SIOC   39

#define CAMERA_PIN_Y9     48
#define CAMERA_PIN_Y8     11
#define CAMERA_PIN_Y7     12
#define CAMERA_PIN_Y6     14
#define CAMERA_PIN_Y5     16
#define CAMERA_PIN_Y4     18
#define CAMERA_PIN_Y3     17
#define CAMERA_PIN_Y2     15

#define CAMERA_PIN_VSYNC  38
#define CAMERA_PIN_HREF   47
#define CAMERA_PIN_PCLK   13

// =====================================================
// Internal camera state
// =====================================================

static bool cameraReady = false;

// =====================================================
// Initialize camera
// =====================================================

bool initCamera()
{
    if (cameraReady) {
        return true;
    }

    camera_config_t config = {};

    config.ledc_channel = LEDC_CHANNEL_0;
    config.ledc_timer = LEDC_TIMER_0;

    config.pin_d0 = CAMERA_PIN_Y2;
    config.pin_d1 = CAMERA_PIN_Y3;
    config.pin_d2 = CAMERA_PIN_Y4;
    config.pin_d3 = CAMERA_PIN_Y5;
    config.pin_d4 = CAMERA_PIN_Y6;
    config.pin_d5 = CAMERA_PIN_Y7;
    config.pin_d6 = CAMERA_PIN_Y8;
    config.pin_d7 = CAMERA_PIN_Y9;

    config.pin_xclk = CAMERA_PIN_XCLK;
    config.pin_pclk = CAMERA_PIN_PCLK;
    config.pin_vsync = CAMERA_PIN_VSYNC;
    config.pin_href = CAMERA_PIN_HREF;

    config.pin_sccb_sda = CAMERA_PIN_SIOD;
    config.pin_sccb_scl = CAMERA_PIN_SIOC;

    config.pin_pwdn = CAMERA_PIN_PWDN;
    config.pin_reset = CAMERA_PIN_RESET;

    config.xclk_freq_hz = 20000000;

    config.pixel_format = PIXFORMAT_JPEG;
    config.frame_size = FRAMESIZE_QVGA; // 320 x 240
    config.jpeg_quality = 12;
    config.fb_count = 1;

    if (psramFound()) {
        config.fb_location = CAMERA_FB_IN_PSRAM;
        config.grab_mode = CAMERA_GRAB_LATEST;
    }
    else {
        config.fb_location = CAMERA_FB_IN_DRAM;
        config.grab_mode = CAMERA_GRAB_WHEN_EMPTY;
    }

    const esp_err_t cameraError =
        esp_camera_init(&config);

    if (cameraError != ESP_OK) {
        Serial.printf(
            "[CAMERA] Initialization failed: 0x%x\n",
            cameraError
        );

        return false;
    }

    sensor_t *sensor =
        esp_camera_sensor_get();

    if (sensor == nullptr) {
        Serial.println(
            "[CAMERA] ERROR: Camera sensor not found."
        );

        esp_camera_deinit();

        return false;
    }

    // Keep the camera at the expected source resolution.
    sensor->set_framesize(
        sensor,
        FRAMESIZE_QVGA
    );

    // Orientation must match the training data (see config.h).
    sensor->set_vflip(sensor, CAMERA_VFLIP);
    sensor->set_hmirror(sensor, CAMERA_HMIRROR);

    // Basic image settings.
    sensor->set_brightness(sensor, 0);
    sensor->set_contrast(sensor, 0);
    sensor->set_saturation(sensor, 0);
    sensor->set_sharpness(sensor, 0);

    // Automatic camera controls.
    sensor->set_whitebal(sensor, 1);
    sensor->set_awb_gain(sensor, 1);
    sensor->set_wb_mode(sensor, 0);

    sensor->set_exposure_ctrl(sensor, 1);
    sensor->set_aec2(sensor, 1);
    sensor->set_ae_level(sensor, 0);

    sensor->set_gain_ctrl(sensor, 1);
    sensor->set_agc_gain(sensor, 0);
    sensor->set_gainceiling(
        sensor,
        static_cast<gainceiling_t>(2)
    );

    sensor->set_bpc(sensor, 1);
    sensor->set_wpc(sensor, 1);
    sensor->set_raw_gma(sensor, 1);
    sensor->set_lenc(sensor, 1);

    sensor->set_dcw(sensor, 1);
    sensor->set_colorbar(sensor, 0);

    // Allow exposure, gain, and white balance to stabilize.
    //
    // This is important because the first few camera frames
    // can be too dark, too bright, or incorrectly coloured.
    for (int frameIndex = 0;
         frameIndex < CAMERA_WARMUP_FRAMES;
         frameIndex++) {

        camera_fb_t *frame =
            esp_camera_fb_get();

        if (frame != nullptr) {
            esp_camera_fb_return(frame);
        }

        delay(CAMERA_WARMUP_FRAME_DELAY_MS);
    }

    cameraReady = true;

    return true;
}

// =====================================================
// Return current camera state
// =====================================================

bool isCameraReady()
{
    return cameraReady;
}