#!/bin/sh
# Runs a command on a virtual display, for Firefox with WebGL on Linux CI: headless Firefox has no GL there,
# and the map needs it. The screen is larger than the browser window and the pointer is parked outside it:
# Firefox re-hovers whatever is under the real pointer when the page changes beneath it, which undid the
# hover of tests (a paused toast closing, a menu opened by hover).
exec xvfb-run --auto-servernum --server-args="-screen 0 3200x2000x24" sh -c 'xdotool mousemove 3190 1990; exec "$@"' sh "$@"
