/*
 * Shared image preprocessing for the maize seed classifier.
 *
 * This module is the single source of truth for how a captured image is
 * converted into the model input tensor. It is used by the browser app
 * (deploy/index.html) and by the Node.js parity test (tools/parity_test.js).
 *
 * Contract (must match train_model.py):
 *   - input : RGBA pixels (Uint8/Uint8ClampedArray), length = size*size*4
 *   - resize: caller draws the image to a `size x size` canvas first
 *   - scale : /255 -> [0,1]
 *   - norm  : (x - MEAN) / STD   (ImageNet statistics)
 *   - layout: NCHW planar, i.e. [1, 3, size, size]
 *
 * The planar layout is critical: the ONNX model input is [1,3,H,W], so all
 * red values come first, then green, then blue. Writing channel-interleaved
 * (NHWC) data here silently produces garbage predictions.
 */
(function (root, factory) {
    const api = factory();
    if (typeof module !== 'undefined' && module.exports) {
        module.exports = api;
    } else {
        root.SeedPreprocess = api;
    }
})(typeof self !== 'undefined' ? self : this, function () {
    const MEAN = [0.485, 0.456, 0.406];
    const STD = [0.229, 0.224, 0.225];

    /**
     * Convert RGBA pixels to a normalized planar NCHW Float32Array.
     * @param {Uint8Array|Uint8ClampedArray} rgba
     * @param {number} size
     * @returns {Float32Array}
     */
    function preprocessRGBA(rgba, size) {
        const pixels = size * size;
        const out = new Float32Array(3 * pixels);
        const plane = pixels;

        for (let i = 0; i < pixels; i++) {
            const r = rgba[i * 4] / 255.0;
            const g = rgba[i * 4 + 1] / 255.0;
            const b = rgba[i * 4 + 2] / 255.0;

            out[0 * plane + i] = (r - MEAN[0]) / STD[0];
            out[1 * plane + i] = (g - MEAN[1]) / STD[1];
            out[2 * plane + i] = (b - MEAN[2]) / STD[2];
        }
        return out;
    }

    function softmax(values) {
        let max = -Infinity;
        for (const v of values) if (v > max) max = v;
        let sum = 0;
        const exps = new Array(values.length);
        for (let i = 0; i < values.length; i++) {
            exps[i] = Math.exp(values[i] - max);
            sum += exps[i];
        }
        for (let i = 0; i < exps.length; i++) exps[i] /= sum;
        return exps;
    }

    return { MEAN, STD, preprocessRGBA, softmax };
});
