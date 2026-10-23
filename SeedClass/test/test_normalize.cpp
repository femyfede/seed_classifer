#include <Arduino.h>
#include <unity.h>

#include "config.h"

String normalizeLabel(const String &label) {
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

void test_normalize_asili() {
    TEST_ASSERT_EQUAL_STRING("Asili", normalizeLabel("Asili").c_str());
    TEST_ASSERT_EQUAL_STRING("Asili", normalizeLabel("asili").c_str());
    TEST_ASSERT_EQUAL_STRING("Asili", normalizeLabel("ASILI").c_str());
}

void test_normalize_chotara() {
    TEST_ASSERT_EQUAL_STRING("Chotara", normalizeLabel("Chotara").c_str());
    TEST_ASSERT_EQUAL_STRING("Chotara", normalizeLabel("chotara").c_str());
}

void test_normalize_huria() {
    TEST_ASSERT_EQUAL_STRING("Huria", normalizeLabel("Huria").c_str());
    TEST_ASSERT_EQUAL_STRING("Huria", normalizeLabel("huria").c_str());
}

void test_normalize_unrelated() {
    TEST_ASSERT_EQUAL_STRING("Unrelated", normalizeLabel("unrelated").c_str());
    TEST_ASSERT_EQUAL_STRING("Unrelated", normalizeLabel("UNRELATED").c_str());
}

void test_normalize_unknown() {
    TEST_ASSERT_EQUAL_STRING("Unknown", normalizeLabel("Unknown").c_str());
    TEST_ASSERT_EQUAL_STRING("test", normalizeLabel("test").c_str());
}

void setUp() {}

void tearDown() {}

void setup() {
    delay(2000);
    UNITY_BEGIN();
    RUN_TEST(test_normalize_asili);
    RUN_TEST(test_normalize_chotara);
    RUN_TEST(test_normalize_huria);
    RUN_TEST(test_normalize_unrelated);
    RUN_TEST(test_normalize_unknown);
    UNITY_END();
}

void loop() {}