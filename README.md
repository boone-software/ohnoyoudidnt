Oh no you didn't!
=================

Chrome has a habit of crashing, often for no real reason. When running a Kiosk, or Digital Signage - the ability the quickly reload the page is essential. This plugin does exactly that.

This is not a replacement for correcting problems in the first place (memory leaks especially) and isn't particularly useful in an everyday environment, where you can simply press the refresh button yourself.


# Installation

1. Download and unzip package onto kiosk or machine running Chrome
2. Open Chrome extensions - chrome://extensions
3. Enable developer mode
4. Select "Load unpacked", select the base folder ("ohnoyoudidnt"), and click 'ok'
5. Turn developer mode off
6. Simulate a failure!

# Additional notes

-The extension will check the status of tabs every 60 seconds, this is configurable in `background.js`
-Events will be stored in Insights under the "ChromeStat" event type
