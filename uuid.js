// Type definitions for UUID.js v3.3.0
// Project: https://github.com/LiosK/UUID.js
// Definitions by: Jason Jarrett <https://github.com/staxmanade/>
// Definitions: https://github.com/DefinitelyTyped/DefinitelyTyped
var UUID = (function () {
    function UUID() {
    }
    UUID.prototype._init = function (timeLow, timeMid, timeHiAndVersion, clockSeqHiAndReserved, clockSeqLow, node) {
        var names = UUID.FIELD_NAMES, sizes = UUID.FIELD_SIZES;
        var bin = UUID._binAligner, hex = UUID._hexAligner;
        /**
         * List of UUID field values (as integer values).
         * @type int[]
         */
        this.intFields = new Array(6);
        /**
         * List of UUID field values (as binary bit string values).
         * @type string[]
         */
        this.bitFields = new Array(6);
        /**
         * List of UUID field values (as hexadecimal string values).
         * @type string[]
         */
        this.hexFields = new Array(6);
        for (var i = 0; i < 6; i++) {
            var intValue = parseInt(arguments[i] || 0);
            this.intFields[i] = this.intFields[names[i]] = intValue;
            this.bitFields[i] = this.bitFields[names[i]] = bin(intValue, sizes[i]);
            this.hexFields[i] = this.hexFields[names[i]] = hex(intValue, sizes[i] / 4);
        }
        /**
         * UUID version number defined in RFC 4122.
         * @type int
         */
        this.version = (this.intFields[2] >> 12) & 0xF;
        /**
         * 128-bit binary bit string representation.
         * @type string
         */
        this.bitString = this.bitFields.join("");
        /**
         * Non-delimited hexadecimal string representation ("xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx").
         * @type string
         * @since v3.3.0
         */
        this.hexNoDelim = this.hexFields.join("");
        /**
         * UUID hexadecimal string representation ("xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx").
         * @type string
         */
        this.hexString = this.hexFields[0] + "-" + this.hexFields[1] + "-" + this.hexFields[2]
            + "-" + this.hexFields[3] + this.hexFields[4] + "-" + this.hexFields[5];
        /**
         * UUID string representation as a URN ("urn:uuid:xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx").
         * @type string
         */
        this.urn = "urn:uuid:" + this.hexString;
        return this;
    };
    UUID.prototype.equals = function (uuid) {
        if (!(uuid instanceof UUID)) {
            return false;
        }
        for (var i = 0; i < 6; i++) {
            if (this.intFields[i] !== uuid.intFields[i]) {
                return false;
            }
        }
        return true;
    };
    UUID.prototype.toString = function () {
        return this.hexString;
    };
    /**
     * The simplest function to get an UUID string.
     * @returns {string} A version 4 UUID string.
     */
    UUID.generate = function (o) {
        var rand = UUID._getRandomInt, hex = UUID._hexAligner;
        return hex(rand(32), 8) // time_low
            + "-"
            + hex(rand(16), 4) // time_mid
            + "-"
            + hex(0x4000 | rand(12), 4) // time_hi_and_version
            + "-"
            + hex(0x8000 | rand(14), 4) // clock_seq_hi_and_reserved clock_seq_low
            + "-"
            + hex(rand(48), 12); // node
    };
    UUID.genV1 = function () {
        var now = new Date().getTime(), st = UUID._state;
        if (now != st.timestamp) {
            if (now < st.timestamp) {
                st.sequence++;
            }
            st.timestamp = now;
            st.tick = UUID._getRandomInt(4);
        }
        else if (Math.random() < UUID._tsRatio && st.tick < 9984) {
            // advance the timestamp fraction at a probability
            // to compensate for the low timestamp resolution
            st.tick += 1 + UUID._getRandomInt(4);
        }
        else {
            st.sequence++;
        }
        // format time fields
        var tf = UUID._getTimeFieldValues(st.timestamp);
        var tl = tf.low + st.tick;
        var thav = (tf.hi & 0xFFF) | 0x1000; // set version '0001'
        // format clock sequence
        st.sequence &= 0x3FFF;
        var cshar = (st.sequence >>> 8) | 0x80; // set variant '10'
        var csl = st.sequence & 0xFF;
        return new UUID()._init(tl, tf.mid, thav, cshar, csl, st.node);
    };
    /**
     * Generates a version 4 {@link UUID}.
     * @returns {UUID} A version 4 {@link UUID} object.
     * @since 3.0
     */
    UUID.genV4 = function () {
        var rand = UUID._getRandomInt;
        return new UUID()._init(rand(32), rand(16), // time_low time_mid
        0x4000 | rand(12), // time_hi_and_version
        0x80 | rand(6), // clock_seq_hi_and_reserved
        rand(8), rand(48));
    };
    UUID.parse = function (strId) {
    };
    /**
     * Returns an unsigned x-bit random integer.
     * @param {int} x A positive integer ranging from 0 to 53, inclusive.
     * @returns {int} An unsigned x-bit random integer (0 <= f(x) < 2^x).
     */
    UUID._getRandomInt = function (x) {
        if (x < 0)
            return NaN;
        if (x <= 30)
            return (0 | Math.random() * (1 << x));
        if (x <= 53)
            return (0 | Math.random() * (1 << 30))
                + (0 | Math.random() * (1 << x - 30)) * (1 << 30);
        return NaN;
    };
    /**
     * Returns a function that converts an integer to a zero-filled string.
     * @param {int} radix
     * @returns {function(num&#44; length)}
     */
    UUID._getIntAligner = function (radix) {
        return function (num, length) {
            var str = num.toString(radix), i = length - str.length, z = "0";
            for (; i > 0; i >>>= 1, z += z) {
                if (i & 1) {
                    str = z + str;
                }
            }
            return str;
        };
    };
    UUID.resetState = function () {
        UUID._state = new UUID._state.constructor();
    };
    /**
     * @param {Date|int} time ECMAScript Date Object or milliseconds from 1970-01-01.
     * @returns {object}
     */
    UUID._getTimeFieldValues = function (time) {
        var ts = time - Date.UTC(1582, 9, 15);
        var hm = ((ts / 0x100000000) * 10000) & 0xFFFFFFF;
        return {
            low: ((ts & 0xFFFFFFF) * 10000) % 0x100000000,
            mid: hm & 0xFFFF, hi: hm >>> 16, timestamp: ts
        };
    };
    UUID.makeBackwardCompatible = function () {
        var f = UUID.generate;
        UUID.generate = function (o) {
            return (o && o.version == 1) ? UUID.genV1().hexString : f.call(UUID);
        };
        UUID.makeBackwardCompatible = function () {
        };
    };
    /**
     * Names of each UUID field.
     * @type string[]
     * @constant
     * @since 3.0
     */
    UUID.FIELD_NAMES = ["timeLow", "timeMid", "timeHiAndVersion",
        "clockSeqHiAndReserved", "clockSeqLow", "node"];
    /**
     * Sizes of each UUID field.
     * @type int[]
     * @constant
     * @since 3.0
     */
    UUID.FIELD_SIZES = [32, 16, 16, 8, 8, 48];
    UUID._tsRatio = 1 / 4;
    UUID._hexAligner = UUID._getIntAligner(16);
    UUID._binAligner = UUID._getIntAligner(2);
    UUID._state = new function UUIDState() {
        var rand = UUID._getRandomInt;
        this.timestamp = 0;
        this.sequence = rand(14);
        this.node = (rand(8) | 1) * 0x10000000000 + rand(40); // set multicast bit '1'
        this.tick = rand(4); // timestamp fraction smaller than a millisecond
    };
    return UUID;
}());
//# sourceMappingURL=uuid.js.map