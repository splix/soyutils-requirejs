define([], function() {
    return {
        /**
         * @param {*} condition Condition to check.
         */
        assert: function (condition) {
            if (!condition) {
                throw Error('Assertion error');
            }
        },
        /**
         * @param {...*} var_args
         */
        fail: function (var_args) {
        }
    };
});