# Adds include paths the Edge Impulse library's esp-dsp assembly (.S) files need.
import os

Import("env")

libs_dir = env.PioPlatform().get_package_dir("framework-arduinoespressif32-esp32s3-libs")
if not libs_dir:
    raise RuntimeError("PlatformIO package framework-arduinoespressif32-esp32s3-libs is not installed")

env.Append(CPPPATH=[
    os.path.join(env.subst("$PROJECT_DIR"), "lib", "fedeSeed_inferencing_new", "src",
                 "edge-impulse-sdk", "porting", "espressif", "esp-dsp", "modules", "fft", "include"),
    os.path.join(libs_dir, "include", "xtensa", "esp32s3", "include"),
])
