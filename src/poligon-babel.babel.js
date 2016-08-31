Function.prototype.$asyncbind = function $asyncbind(self, catcher) {
    var resolver = this;

    if (catcher === true) {
        if (!Function.prototype.$asyncbind.EagerThenable) Function.prototype.$asyncbind.EagerThenable = function factory(tick) {
            var _tasks = [];

            if (!tick) {
                try {
                    tick = process.nextTick;
                } catch (ex) {
                    tick = function (p) {
                        setTimeout(p, 0);
                    };
                }
            }

            function _untask() {
                for (var i = 0; i < _tasks.length; i += 2) {
                    var t = _tasks[i + 1],
                        r = _tasks[i];

                    for (var j = 0; j < t.length; j++) t[j].call(null, r);
                }

                _tasks = [];
            }

            function isThenable(obj) {
                return obj && obj instanceof Object && typeof obj.then === "function";
            }

            function EagerThenable(resolver) {
                function done(inline) {
                    var w;
                    if (_sync || phase < 0 || (w = _thens[phase]).length === 0) return;

                    _tasks.push(result, w);

                    _thens = [[], []];
                    if (_tasks.length === 2) inline ? _untask() : tick(_untask);
                }

                function resolveThen(x) {
                    if (isThenable(x)) return x.then(resolveThen, rejectThen);
                    phase = 0;
                    result = x;
                    done(true);
                }

                function rejectThen(x) {
                    if (isThenable(x)) return x.then(resolveThen, rejectThen);
                    phase = 1;
                    result = x;
                    done(true);
                }

                function settler(resolver, rejecter) {
                    _thens[0].push(resolver);

                    _thens[1].push(rejecter);

                    done();
                }

                function toString() {
                    return "EagerThenable{" + {
                        "-1": "pending",
                        0: "resolved",
                        1: "rejected"
                    }[phase] + "}=" + result.toString();
                }

                this.then = settler;
                this.toString = toString;
                var _thens = [[], []],
                    _sync = true,
                    phase = -1,
                    result;
                resolver.call(null, resolveThen, rejectThen);
                _sync = false;
                done();
            }

            EagerThenable.resolve = function (v) {
                return isThenable(v) ? v : {
                    then: function (resolve, reject) {
                        return resolve(v);
                    }
                };
            };

            return EagerThenable;
        }();
        return new Function.prototype.$asyncbind.EagerThenable(boundThen);
    }

    if (catcher) {
        if (Function.prototype.$asyncbind.wrapAsyncStack) catcher = Function.prototype.$asyncbind.wrapAsyncStack(catcher);
        return then;
    }

    function then(result, error) {
        try {
            return result && result instanceof Object && typeof result.then === "function" ? result.then(then, catcher) : resolver.call(self, result, error || catcher);
        } catch (ex) {
            return (error || catcher)(ex);
        }
    }

    function boundThen(result, error) {
        return resolver.call(self, result, error);
    }

    boundThen.then = boundThen;
    return boundThen;
};

/**
 * Created by alexey2baranov on 8/31/16.
 */

function f1(p1, p2) {
    return new Promise(function ($return, $error) {
        return f2(p2).then(function ($await_1) {
            return $return();
        }.$asyncbind(this, $error), $error);
    }.$asyncbind(this));
}

function f2() {
    return new Promise(function ($return, $error) {
        return $return(new Promise((res, rej) => {
            setTimeout(() => {
                console.log("f2-promise");
                res();
            }, 1000);
        }));
    }.$asyncbind(this));
}

f1(123, 456);