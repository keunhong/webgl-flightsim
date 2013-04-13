Running the code
================
The code should be able to run without any setup given that
    1. The demo is being run in a browser that supports WebGL (such as Chromium)
    2. The computer has a graphics card that is currently supported by WebGL

Keys
====
    A/D - roll left/right
    W/S - pitch up/down
    -/+ - decrease/increase velocity

Terrain Generator
=================
I created my own terrain generator which makes use of Perlin Noise (or Coherent Noise).
    Terrain Size - the size of the terrain in model coordinate.
    # Data Points - the number of noise data points to generate. More samples generally means more spikes/mountains.
    # Noise Samples - the number of samples to take from the linearly interpolated noise data. (More means more polygons)
    Max Mountain Height - the maximum height of the mountains in model coordinates.

UFO mode is a surprise.

Sources
=======
- glMatrix (https://github.com/toji/gl-matrix) for GLUT-like functionality and some basic vector operations.
- webgl-utils.js (http://www.khronos.org/webgl/wiki/FAQ) for cross-browser webgl support.
- jQuery for general cross-browser javascript support including but not limited to keycode detection.
