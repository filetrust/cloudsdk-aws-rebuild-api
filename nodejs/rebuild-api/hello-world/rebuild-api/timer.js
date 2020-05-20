const NS_PER_MS = 1e6;
const MS_PER_SEC = 1e3;
const TICKS_PER_NS = 1e4;

const moment = require("moment");
const momentDurationFormatSetup = require("moment-duration-format");
momentDurationFormatSetup(moment);

class TimerInstance {
    time

    constructor() {
        this.time = process.hrtime();
    }

    Restart() {
        this.time = process.hrtime();
    }

    Elapsed() {
        const [seconds, nanoSeconds] = process.hrtime(this.time);
        const hourMinuteSeconds = moment.duration(seconds, 'seconds').format("HH:mm:ss", { trim: false });
        const ticks = Math.round(nanoSeconds / 1e4).toString().padStart(7, "0");
        return hourMinuteSeconds + "." + ticks;
    }
}

const Timer = {
    StartNew: () => {
        return new TimerInstance();
    },

    Elapsed: (instance) => {
        return instance.Elapsed();
    }
}

module.exports = Timer;