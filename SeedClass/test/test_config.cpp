#include <Arduino.h>
#include <unity.h>

#include "config.h"
#include "inference.h"

void test_config_threshold() {
    TEST_ASSERT_FLOAT_WITHIN(0.001f, 0.6f, CONFIDENCE_THRESHOLD);
}

void test_classification_samples() {
    TEST_ASSERT_EQUAL(3, CLASSIFICATION_SAMPLES);
}

void test_sample_gap() {
    TEST_ASSERT_EQUAL(250, SAMPLE_GAP_MS);
}

void test_seed_position_delay() {
    TEST_ASSERT_EQUAL(1500, SEED_POSITION_DELAY_MS);
}

void test_inference_interval() {
    TEST_ASSERT_EQUAL(3000, INFERENCE_INTERVAL_MS);
}

void test_camera_dimensions() {
    TEST_ASSERT_EQUAL(320, CAMERA_RAW_WIDTH);
    TEST_ASSERT_EQUAL(240, CAMERA_RAW_HEIGHT);
    TEST_ASSERT_EQUAL(3, CAMERA_IMAGE_CHANNELS);
}

void test_camera_warmup() {
    TEST_ASSERT_EQUAL(15, CAMERA_WARMUP_FRAMES);
    TEST_ASSERT_EQUAL(100, CAMERA_WARMUP_FRAME_DELAY_MS);
}

void setUp() {}

void tearDown() {}

void setup() {
    delay(2000);
    UNITY_BEGIN();
    RUN_TEST(test_config_threshold);
    RUN_TEST(test_classification_samples);
    RUN_TEST(test_sample_gap);
    RUN_TEST(test_seed_position_delay);
    RUN_TEST(test_inference_interval);
    RUN_TEST(test_camera_dimensions);
    RUN_TEST(test_camera_warmup);
    UNITY_END();
}

void loop() {}