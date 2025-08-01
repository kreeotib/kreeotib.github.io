!function(e, t) {
    "object" == typeof exports && "undefined" != typeof module ? module.exports = t() : "function" == typeof define && define.amd ? define(t) : (e = "undefined" != typeof globalThis ? globalThis : e || self).axios = t()
}(this, (function() {
    "use strict";
    function e(t) {
        return e = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function(e) {
            return typeof e
        }
        : function(e) {
            return e && "function" == typeof Symbol && e.constructor === Symbol && e !== Symbol.prototype ? "symbol" : typeof e
        }
        ,
        e(t)
    }
    function t(e, t) {
        if (!(e instanceof t))
            throw new TypeError("Cannot call a class as a function")
    }
    function n(e, t) {
        for (var n = 0; n < t.length; n++) {
            var r = t[n];
            r.enumerable = r.enumerable || !1,
            r.configurable = !0,
            "value"in r && (r.writable = !0),
            Object.defineProperty(e, r.key, r)
        }
    }
    function r(e, t, r) {
        return t && n(e.prototype, t),
        r && n(e, r),
        Object.defineProperty(e, "prototype", {
            writable: !1
        }),
        e
    }
    function o(e, t) {
        return function(e) {
            if (Array.isArray(e))
                return e
        }(e) || function(e, t) {
            var n = null == e ? null : "undefined" != typeof Symbol && e[Symbol.iterator] || e["@@iterator"];
            if (null == n)
                return;
            var r, o, i = [], a = !0, s = !1;
            try {
                for (n = n.call(e); !(a = (r = n.next()).done) && (i.push(r.value),
                !t || i.length !== t); a = !0)
                    ;
            } catch (e) {
                s = !0,
                o = e
            } finally {
                try {
                    a || null == n.return || n.return()
                } finally {
                    if (s)
                        throw o
                }
            }
            return i
        }(e, t) || function(e, t) {
            if (!e)
                return;
            if ("string" == typeof e)
                return i(e, t);
            var n = Object.prototype.toString.call(e).slice(8, -1);
            "Object" === n && e.constructor && (n = e.constructor.name);
            if ("Map" === n || "Set" === n)
                return Array.from(e);
            if ("Arguments" === n || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n))
                return i(e, t)
        }(e, t) || function() {
            throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.")
        }()
    }
    function i(e, t) {
        (null == t || t > e.length) && (t = e.length);
        for (var n = 0, r = new Array(t); n < t; n++)
            r[n] = e[n];
        return r
    }
    function a(e, t) {
        return function() {
            return e.apply(t, arguments)
        }
    }
    var s, u = Object.prototype.toString, c = Object.getPrototypeOf, f = (s = Object.create(null),
    function(e) {
        var t = u.call(e);
        return s[t] || (s[t] = t.slice(8, -1).toLowerCase())
    }
    ), l = function(e) {
        return e = e.toLowerCase(),
        function(t) {
            return f(t) === e
        }
    }, d = function(t) {
        return function(n) {
            return e(n) === t
        }
    }, p = Array.isArray, h = d("undefined");
    var m = l("ArrayBuffer");
    var y = d("string")
      , v = d("function")
      , b = d("number")
      , g = function(t) {
        return null !== t && "object" === e(t)
    }
      , w = function(e) {
        if ("object" !== f(e))
            return !1;
        var t = c(e);
        return !(null !== t && t !== Object.prototype && null !== Object.getPrototypeOf(t) || Symbol.toStringTag in e || Symbol.iterator in e)
    }
      , E = l("Date")
      , O = l("File")
      , S = l("Blob")
      , R = l("FileList")
      , A = l("URLSearchParams");
    function T(t, n) {
        var r, o, i = arguments.length > 2 && void 0 !== arguments[2] ? arguments[2] : {}, a = i.allOwnKeys, s = void 0 !== a && a;
        if (null != t)
            if ("object" !== e(t) && (t = [t]),
            p(t))
                for (r = 0,
                o = t.length; r < o; r++)
                    n.call(null, t[r], r, t);
            else {
                var u, c = s ? Object.getOwnPropertyNames(t) : Object.keys(t), f = c.length;
                for (r = 0; r < f; r++)
                    u = c[r],
                    n.call(null, t[u], u, t)
            }
    }
    function j(e, t) {
        t = t.toLowerCase();
        for (var n, r = Object.keys(e), o = r.length; o-- > 0; )
            if (t === (n = r[o]).toLowerCase())
                return n;
        return null
    }
    var N = "undefined" != typeof globalThis ? globalThis : "undefined" != typeof self ? self : "undefined" != typeof window ? window : global
      , C = function(e) {
        return !h(e) && e !== N
    };
    var x, P = (x = "undefined" != typeof Uint8Array && c(Uint8Array),
    function(e) {
        return x && e instanceof x
    }
    ), k = l("HTMLFormElement"), U = function(e) {
        var t = Object.prototype.hasOwnProperty;
        return function(e, n) {
            return t.call(e, n)
        }
    }(), _ = l("RegExp"), F = function(e, t) {
        var n = Object.getOwnPropertyDescriptors(e)
          , r = {};
        T(n, (function(n, o) {
            !1 !== t(n, o, e) && (r[o] = n)
        }
        )),
        Object.defineProperties(e, r)
    }, B = "abcdefghijklmnopqrstuvwxyz", L = "0123456789", D = {
        DIGIT: L,
        ALPHA: B,
        ALPHA_DIGIT: B + B.toUpperCase() + L
    };
    var I = l("AsyncFunction")
      , q = {
        isArray: p,
        isArrayBuffer: m,
        isBuffer: function(e) {
            return null !== e && !h(e) && null !== e.constructor && !h(e.constructor) && v(e.constructor.isBuffer) && e.constructor.isBuffer(e)
        },
        isFormData: function(e) {
            var t;
            return e && ("function" == typeof FormData && e instanceof FormData || v(e.append) && ("formdata" === (t = f(e)) || "object" === t && v(e.toString) && "[object FormData]" === e.toString()))
        },
        isArrayBufferView: function(e) {
            return "undefined" != typeof ArrayBuffer && ArrayBuffer.isView ? ArrayBuffer.isView(e) : e && e.buffer && m(e.buffer)
        },
        isString: y,
        isNumber: b,
        isBoolean: function(e) {
            return !0 === e || !1 === e
        },
        isObject: g,
        isPlainObject: w,
        isUndefined: h,
        isDate: E,
        isFile: O,
        isBlob: S,
        isRegExp: _,
        isFunction: v,
        isStream: function(e) {
            return g(e) && v(e.pipe)
        },
        isURLSearchParams: A,
        isTypedArray: P,
        isFileList: R,
        forEach: T,
        merge: function e() {
            for (var t = C(this) && this || {}, n = t.caseless, r = {}, o = function(t, o) {
                var i = n && j(r, o) || o;
                w(r[i]) && w(t) ? r[i] = e(r[i], t) : w(t) ? r[i] = e({}, t) : p(t) ? r[i] = t.slice() : r[i] = t
            }, i = 0, a = arguments.length; i < a; i++)
                arguments[i] && T(arguments[i], o);
            return r
        },
        extend: function(e, t, n) {
            var r = arguments.length > 3 && void 0 !== arguments[3] ? arguments[3] : {}
              , o = r.allOwnKeys;
            return T(t, (function(t, r) {
                n && v(t) ? e[r] = a(t, n) : e[r] = t
            }
            ), {
                allOwnKeys: o
            }),
            e
        },
        trim: function(e) {
            return e.trim ? e.trim() : e.replace(/^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g, "")
        },
        stripBOM: function(e) {
            return 65279 === e.charCodeAt(0) && (e = e.slice(1)),
            e
        },
        inherits: function(e, t, n, r) {
            e.prototype = Object.create(t.prototype, r),
            e.prototype.constructor = e,
            Object.defineProperty(e, "super", {
                value: t.prototype
            }),
            n && Object.assign(e.prototype, n)
        },
        toFlatObject: function(e, t, n, r) {
            var o, i, a, s = {};
            if (t = t || {},
            null == e)
                return t;
            do {
                for (i = (o = Object.getOwnPropertyNames(e)).length; i-- > 0; )
                    a = o[i],
                    r && !r(a, e, t) || s[a] || (t[a] = e[a],
                    s[a] = !0);
                e = !1 !== n && c(e)
            } while (e && (!n || n(e, t)) && e !== Object.prototype);
            return t
        },
        kindOf: f,
        kindOfTest: l,
        endsWith: function(e, t, n) {
            e = String(e),
            (void 0 === n || n > e.length) && (n = e.length),
            n -= t.length;
            var r = e.indexOf(t, n);
            return -1 !== r && r === n
        },
        toArray: function(e) {
            if (!e)
                return null;
            if (p(e))
                return e;
            var t = e.length;
            if (!b(t))
                return null;
            for (var n = new Array(t); t-- > 0; )
                n[t] = e[t];
            return n
        },
        forEachEntry: function(e, t) {
            for (var n, r = (e && e[Symbol.iterator]).call(e); (n = r.next()) && !n.done; ) {
                var o = n.value;
                t.call(e, o[0], o[1])
            }
        },
        matchAll: function(e, t) {
            for (var n, r = []; null !== (n = e.exec(t)); )
                r.push(n);
            return r
        },
        isHTMLForm: k,
        hasOwnProperty: U,
        hasOwnProp: U,
        reduceDescriptors: F,
        freezeMethods: function(e) {
            F(e, (function(t, n) {
                if (v(e) && -1 !== ["arguments", "caller", "callee"].indexOf(n))
                    return !1;
                var r = e[n];
                v(r) && (t.enumerable = !1,
                "writable"in t ? t.writable = !1 : t.set || (t.set = function() {
                    throw Error("Can not rewrite read-only method '" + n + "'")
                }
                ))
            }
            ))
        },
        toObjectSet: function(e, t) {
            var n = {}
              , r = function(e) {
                e.forEach((function(e) {
                    n[e] = !0
                }
                ))
            };
            return p(e) ? r(e) : r(String(e).split(t)),
            n
        },
        toCamelCase: function(e) {
            return e.toLowerCase().replace(/[-_\s]([a-z\d])(\w*)/g, (function(e, t, n) {
                return t.toUpperCase() + n
            }
            ))
        },
        noop: function() {},
        toFiniteNumber: function(e, t) {
            return e = +e,
            Number.isFinite(e) ? e : t
        },
        findKey: j,
        global: N,
        isContextDefined: C,
        ALPHABET: D,
        generateString: function() {
            for (var e = arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : 16, t = arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : D.ALPHA_DIGIT, n = "", r = t.length; e--; )
                n += t[Math.random() * r | 0];
            return n
        },
        isSpecCompliantForm: function(e) {
            return !!(e && v(e.append) && "FormData" === e[Symbol.toStringTag] && e[Symbol.iterator])
        },
        toJSONObject: function(e) {
            var t = new Array(10);
            return function e(n, r) {
                if (g(n)) {
                    if (t.indexOf(n) >= 0)
                        return;
                    if (!("toJSON"in n)) {
                        t[r] = n;
                        var o = p(n) ? [] : {};
                        return T(n, (function(t, n) {
                            var i = e(t, r + 1);
                            !h(i) && (o[n] = i)
                        }
                        )),
                        t[r] = void 0,
                        o
                    }
                }
                return n
            }(e, 0)
        },
        isAsyncFn: I,
        isThenable: function(e) {
            return e && (g(e) || v(e)) && v(e.then) && v(e.catch)
        }
    };
    function M(e, t, n, r, o) {
        Error.call(this),
        Error.captureStackTrace ? Error.captureStackTrace(this, this.constructor) : this.stack = (new Error).stack,
        this.message = e,
        this.name = "AxiosError",
        t && (this.code = t),
        n && (this.config = n),
        r && (this.request = r),
        o && (this.response = o)
    }
    q.inherits(M, Error, {
        toJSON: function() {
            return {
                message: this.message,
                name: this.name,
                description: this.description,
                number: this.number,
                fileName: this.fileName,
                lineNumber: this.lineNumber,
                columnNumber: this.columnNumber,
                stack: this.stack,
                config: q.toJSONObject(this.config),
                code: this.code,
                status: this.response && this.response.status ? this.response.status : null
            }
        }
    });
    var z = M.prototype
      , H = {};
    ["ERR_BAD_OPTION_VALUE", "ERR_BAD_OPTION", "ECONNABORTED", "ETIMEDOUT", "ERR_NETWORK", "ERR_FR_TOO_MANY_REDIRECTS", "ERR_DEPRECATED", "ERR_BAD_RESPONSE", "ERR_BAD_REQUEST", "ERR_CANCELED", "ERR_NOT_SUPPORT", "ERR_INVALID_URL"].forEach((function(e) {
        H[e] = {
            value: e
        }
    }
    )),
    Object.defineProperties(M, H),
    Object.defineProperty(z, "isAxiosError", {
        value: !0
    }),
    M.from = function(e, t, n, r, o, i) {
        var a = Object.create(z);
        return q.toFlatObject(e, a, (function(e) {
            return e !== Error.prototype
        }
        ), (function(e) {
            return "isAxiosError" !== e
        }
        )),
        M.call(a, e.message, t, n, r, o),
        a.cause = e,
        a.name = e.name,
        i && Object.assign(a, i),
        a
    }
    ;
    function J(e) {
        return q.isPlainObject(e) || q.isArray(e)
    }
    function W(e) {
        return q.endsWith(e, "[]") ? e.slice(0, -2) : e
    }
    function K(e, t, n) {
        return e ? e.concat(t).map((function(e, t) {
            return e = W(e),
            !n && t ? "[" + e + "]" : e
        }
        )).join(n ? "." : "") : t
    }
    var V = q.toFlatObject(q, {}, null, (function(e) {
        return /^is[A-Z]/.test(e)
    }
    ));
    function G(t, n, r) {
        if (!q.isObject(t))
            throw new TypeError("target must be an object");
        n = n || new FormData;
        var o = (r = q.toFlatObject(r, {
            metaTokens: !0,
            dots: !1,
            indexes: !1
        }, !1, (function(e, t) {
            return !q.isUndefined(t[e])
        }
        ))).metaTokens
          , i = r.visitor || f
          , a = r.dots
          , s = r.indexes
          , u = (r.Blob || "undefined" != typeof Blob && Blob) && q.isSpecCompliantForm(n);
        if (!q.isFunction(i))
            throw new TypeError("visitor must be a function");
        function c(e) {
            if (null === e)
                return "";
            if (q.isDate(e))
                return e.toISOString();
            if (!u && q.isBlob(e))
                throw new M("Blob is not supported. Use a Buffer instead.");
            return q.isArrayBuffer(e) || q.isTypedArray(e) ? u && "function" == typeof Blob ? new Blob([e]) : Buffer.from(e) : e
        }
        function f(t, r, i) {
            var u = t;
            if (t && !i && "object" === e(t))
                if (q.endsWith(r, "{}"))
                    r = o ? r : r.slice(0, -2),
                    t = JSON.stringify(t);
                else if (q.isArray(t) && function(e) {
                    return q.isArray(e) && !e.some(J)
                }(t) || (q.isFileList(t) || q.endsWith(r, "[]")) && (u = q.toArray(t)))
                    return r = W(r),
                    u.forEach((function(e, t) {
                        !q.isUndefined(e) && null !== e && n.append(!0 === s ? K([r], t, a) : null === s ? r : r + "[]", c(e))
                    }
                    )),
                    !1;
            return !!J(t) || (n.append(K(i, r, a), c(t)),
            !1)
        }
        var l = []
          , d = Object.assign(V, {
            defaultVisitor: f,
            convertValue: c,
            isVisitable: J
        });
        if (!q.isObject(t))
            throw new TypeError("data must be an object");
        return function e(t, r) {
            if (!q.isUndefined(t)) {
                if (-1 !== l.indexOf(t))
                    throw Error("Circular reference detected in " + r.join("."));
                l.push(t),
                q.forEach(t, (function(t, o) {
                    !0 === (!(q.isUndefined(t) || null === t) && i.call(n, t, q.isString(o) ? o.trim() : o, r, d)) && e(t, r ? r.concat(o) : [o])
                }
                )),
                l.pop()
            }
        }(t),
        n
    }
    function $(e) {
        var t = {
            "!": "%21",
            "'": "%27",
            "(": "%28",
            ")": "%29",
            "~": "%7E",
            "%20": "+",
            "%00": "\0"
        };
        return encodeURIComponent(e).replace(/[!'()~]|%20|%00/g, (function(e) {
            return t[e]
        }
        ))
    }
    function X(e, t) {
        this._pairs = [],
        e && G(e, this, t)
    }
    var Q = X.prototype;
    function Z(e) {
        return encodeURIComponent(e).replace(/%3A/gi, ":").replace(/%24/g, "$").replace(/%2C/gi, ",").replace(/%20/g, "+").replace(/%5B/gi, "[").replace(/%5D/gi, "]")
    }
    function Y(e, t, n) {
        if (!t)
            return e;
        var r, o = n && n.encode || Z, i = n && n.serialize;
        if (r = i ? i(t, n) : q.isURLSearchParams(t) ? t.toString() : new X(t,n).toString(o)) {
            var a = e.indexOf("#");
            -1 !== a && (e = e.slice(0, a)),
            e += (-1 === e.indexOf("?") ? "?" : "&") + r
        }
        return e
    }
    Q.append = function(e, t) {
        this._pairs.push([e, t])
    }
    ,
    Q.toString = function(e) {
        var t = e ? function(t) {
            return e.call(this, t, $)
        }
        : $;
        return this._pairs.map((function(e) {
            return t(e[0]) + "=" + t(e[1])
        }
        ), "").join("&")
    }
    ;
    var ee, te = function() {
        function e() {
            t(this, e),
            this.handlers = []
        }
        return r(e, [{
            key: "use",
            value: function(e, t, n) {
                return this.handlers.push({
                    fulfilled: e,
                    rejected: t,
                    synchronous: !!n && n.synchronous,
                    runWhen: n ? n.runWhen : null
                }),
                this.handlers.length - 1
            }
        }, {
            key: "eject",
            value: function(e) {
                this.handlers[e] && (this.handlers[e] = null)
            }
        }, {
            key: "clear",
            value: function() {
                this.handlers && (this.handlers = [])
            }
        }, {
            key: "forEach",
            value: function(e) {
                q.forEach(this.handlers, (function(t) {
                    null !== t && e(t)
                }
                ))
            }
        }]),
        e
    }(), ne = {
        silentJSONParsing: !0,
        forcedJSONParsing: !0,
        clarifyTimeoutError: !1
    }, re = {
        isBrowser: !0,
        classes: {
            URLSearchParams: "undefined" != typeof URLSearchParams ? URLSearchParams : X,
            FormData: "undefined" != typeof FormData ? FormData : null,
            Blob: "undefined" != typeof Blob ? Blob : null
        },
        isStandardBrowserEnv: ("undefined" == typeof navigator || "ReactNative" !== (ee = navigator.product) && "NativeScript" !== ee && "NS" !== ee) && "undefined" != typeof window && "undefined" != typeof document,
        isStandardBrowserWebWorkerEnv: "undefined" != typeof WorkerGlobalScope && self instanceof WorkerGlobalScope && "function" == typeof self.importScripts,
        protocols: ["http", "https", "file", "blob", "url", "data"]
    };
    function oe(e) {
        function t(e, n, r, o) {
            var i = e[o++]
              , a = Number.isFinite(+i)
              , s = o >= e.length;
            return i = !i && q.isArray(r) ? r.length : i,
            s ? (q.hasOwnProp(r, i) ? r[i] = [r[i], n] : r[i] = n,
            !a) : (r[i] && q.isObject(r[i]) || (r[i] = []),
            t(e, n, r[i], o) && q.isArray(r[i]) && (r[i] = function(e) {
                var t, n, r = {}, o = Object.keys(e), i = o.length;
                for (t = 0; t < i; t++)
                    r[n = o[t]] = e[n];
                return r
            }(r[i])),
            !a)
        }
        if (q.isFormData(e) && q.isFunction(e.entries)) {
            var n = {};
            return q.forEachEntry(e, (function(e, r) {
                t(function(e) {
                    return q.matchAll(/\w+|\[(\w*)]/g, e).map((function(e) {
                        return "[]" === e[0] ? "" : e[1] || e[0]
                    }
                    ))
                }(e), r, n, 0)
            }
            )),
            n
        }
        return null
    }
    var ie = {
        "Content-Type": void 0
    };
    var ae = {
        transitional: ne,
        adapter: ["xhr", "http"],
        transformRequest: [function(e, t) {
            var n, r = t.getContentType() || "", o = r.indexOf("application/json") > -1, i = q.isObject(e);
            if (i && q.isHTMLForm(e) && (e = new FormData(e)),
            q.isFormData(e))
                return o && o ? JSON.stringify(oe(e)) : e;
            if (q.isArrayBuffer(e) || q.isBuffer(e) || q.isStream(e) || q.isFile(e) || q.isBlob(e))
                return e;
            if (q.isArrayBufferView(e))
                return e.buffer;
            if (q.isURLSearchParams(e))
                return t.setContentType("application/x-www-form-urlencoded;charset=utf-8", !1),
                e.toString();
            if (i) {
                if (r.indexOf("application/x-www-form-urlencoded") > -1)
                    return function(e, t) {
                        return G(e, new re.classes.URLSearchParams, Object.assign({
                            visitor: function(e, t, n, r) {
                                return re.isNode && q.isBuffer(e) ? (this.append(t, e.toString("base64")),
                                !1) : r.defaultVisitor.apply(this, arguments)
                            }
                        }, t))
                    }(e, this.formSerializer).toString();
                if ((n = q.isFileList(e)) || r.indexOf("multipart/form-data") > -1) {
                    var a = this.env && this.env.FormData;
                    return G(n ? {
                        "files[]": e
                    } : e, a && new a, this.formSerializer)
                }
            }
            return i || o ? (t.setContentType("application/json", !1),
            function(e, t, n) {
                if (q.isString(e))
                    try {
                        return (t || JSON.parse)(e),
                        q.trim(e)
                    } catch (e) {
                        if ("SyntaxError" !== e.name)
                            throw e
                    }
                return (n || JSON.stringify)(e)
            }(e)) : e
        }
        ],
        transformResponse: [function(e) {
            var t = this.transitional || ae.transitional
              , n = t && t.forcedJSONParsing
              , r = "json" === this.responseType;
            if (e && q.isString(e) && (n && !this.responseType || r)) {
                var o = !(t && t.silentJSONParsing) && r;
                try {
                    return JSON.parse(e)
                } catch (e) {
                    if (o) {
                        if ("SyntaxError" === e.name)
                            throw M.from(e, M.ERR_BAD_RESPONSE, this, null, this.response);
                        throw e
                    }
                }
            }
            return e
        }
        ],
        timeout: 0,
        xsrfCookieName: "XSRF-TOKEN",
        xsrfHeaderName: "X-XSRF-TOKEN",
        maxContentLength: -1,
        maxBodyLength: -1,
        env: {
            FormData: re.classes.FormData,
            Blob: re.classes.Blob
        },
        validateStatus: function(e) {
            return e >= 200 && e < 300
        },
        headers: {
            common: {
                Accept: "application/json, text/plain, */*"
            }
        }
    };
    q.forEach(["delete", "get", "head"], (function(e) {
        ae.headers[e] = {}
    }
    )),
    q.forEach(["post", "put", "patch"], (function(e) {
        ae.headers[e] = q.merge(ie)
    }
    ));
    var se = ae
      , ue = q.toObjectSet(["age", "authorization", "content-length", "content-type", "etag", "expires", "from", "host", "if-modified-since", "if-unmodified-since", "last-modified", "location", "max-forwards", "proxy-authorization", "referer", "retry-after", "user-agent"])
      , ce = Symbol("internals");
    function fe(e) {
        return e && String(e).trim().toLowerCase()
    }
    function le(e) {
        return !1 === e || null == e ? e : q.isArray(e) ? e.map(le) : String(e)
    }
    function de(e, t, n, r, o) {
        return q.isFunction(r) ? r.call(this, t, n) : (o && (t = n),
        q.isString(t) ? q.isString(r) ? -1 !== t.indexOf(r) : q.isRegExp(r) ? r.test(t) : void 0 : void 0)
    }
    var pe = function(e, n) {
        function i(e) {
            t(this, i),
            e && this.set(e)
        }
        return r(i, [{
            key: "set",
            value: function(e, t, n) {
                var r = this;
                function o(e, t, n) {
                    var o = fe(t);
                    if (!o)
                        throw new Error("header name must be a non-empty string");
                    var i = q.findKey(r, o);
                    (!i || void 0 === r[i] || !0 === n || void 0 === n && !1 !== r[i]) && (r[i || t] = le(e))
                }
                var i, a, s, u, c, f = function(e, t) {
                    return q.forEach(e, (function(e, n) {
                        return o(e, n, t)
                    }
                    ))
                };
                return q.isPlainObject(e) || e instanceof this.constructor ? f(e, t) : q.isString(e) && (e = e.trim()) && !/^[-_a-zA-Z0-9^`|~,!#$%&'*+.]+$/.test(e.trim()) ? f((c = {},
                (i = e) && i.split("\n").forEach((function(e) {
                    u = e.indexOf(":"),
                    a = e.substring(0, u).trim().toLowerCase(),
                    s = e.substring(u + 1).trim(),
                    !a || c[a] && ue[a] || ("set-cookie" === a ? c[a] ? c[a].push(s) : c[a] = [s] : c[a] = c[a] ? c[a] + ", " + s : s)
                }
                )),
                c), t) : null != e && o(t, e, n),
                this
            }
        }, {
            key: "get",
            value: function(e, t) {
                if (e = fe(e)) {
                    var n = q.findKey(this, e);
                    if (n) {
                        var r = this[n];
                        if (!t)
                            return r;
                        if (!0 === t)
                            return function(e) {
                                for (var t, n = Object.create(null), r = /([^\s,;=]+)\s*(?:=\s*([^,;]+))?/g; t = r.exec(e); )
                                    n[t[1]] = t[2];
                                return n
                            }(r);
                        if (q.isFunction(t))
                            return t.call(this, r, n);
                        if (q.isRegExp(t))
                            return t.exec(r);
                        throw new TypeError("parser must be boolean|regexp|function")
                    }
                }
            }
        }, {
            key: "has",
            value: function(e, t) {
                if (e = fe(e)) {
                    var n = q.findKey(this, e);
                    return !(!n || void 0 === this[n] || t && !de(0, this[n], n, t))
                }
                return !1
            }
        }, {
            key: "delete",
            value: function(e, t) {
                var n = this
                  , r = !1;
                function o(e) {
                    if (e = fe(e)) {
                        var o = q.findKey(n, e);
                        !o || t && !de(0, n[o], o, t) || (delete n[o],
                        r = !0)
                    }
                }
                return q.isArray(e) ? e.forEach(o) : o(e),
                r
            }
        }, {
            key: "clear",
            value: function(e) {
                for (var t = Object.keys(this), n = t.length, r = !1; n--; ) {
                    var o = t[n];
                    e && !de(0, this[o], o, e, !0) || (delete this[o],
                    r = !0)
                }
                return r
            }
        }, {
            key: "normalize",
            value: function(e) {
                var t = this
                  , n = {};
                return q.forEach(this, (function(r, o) {
                    var i = q.findKey(n, o);
                    if (i)
                        return t[i] = le(r),
                        void delete t[o];
                    var a = e ? function(e) {
                        return e.trim().toLowerCase().replace(/([a-z\d])(\w*)/g, (function(e, t, n) {
                            return t.toUpperCase() + n
                        }
                        ))
                    }(o) : String(o).trim();
                    a !== o && delete t[o],
                    t[a] = le(r),
                    n[a] = !0
                }
                )),
                this
            }
        }, {
            key: "concat",
            value: function() {
                for (var e, t = arguments.length, n = new Array(t), r = 0; r < t; r++)
                    n[r] = arguments[r];
                return (e = this.constructor).concat.apply(e, [this].concat(n))
            }
        }, {
            key: "toJSON",
            value: function(e) {
                var t = Object.create(null);
                return q.forEach(this, (function(n, r) {
                    null != n && !1 !== n && (t[r] = e && q.isArray(n) ? n.join(", ") : n)
                }
                )),
                t
            }
        }, {
            key: Symbol.iterator,
            value: function() {
                return Object.entries(this.toJSON())[Symbol.iterator]()
            }
        }, {
            key: "toString",
            value: function() {
                return Object.entries(this.toJSON()).map((function(e) {
                    var t = o(e, 2);
                    return t[0] + ": " + t[1]
                }
                )).join("\n")
            }
        }, {
            key: Symbol.toStringTag,
            get: function() {
                return "AxiosHeaders"
            }
        }], [{
            key: "from",
            value: function(e) {
                return e instanceof this ? e : new this(e)
            }
        }, {
            key: "concat",
            value: function(e) {
                for (var t = new this(e), n = arguments.length, r = new Array(n > 1 ? n - 1 : 0), o = 1; o < n; o++)
                    r[o - 1] = arguments[o];
                return r.forEach((function(e) {
                    return t.set(e)
                }
                )),
                t
            }
        }, {
            key: "accessor",
            value: function(e) {
                var t = (this[ce] = this[ce] = {
                    accessors: {}
                }).accessors
                  , n = this.prototype;
                function r(e) {
                    var r = fe(e);
                    t[r] || (!function(e, t) {
                        var n = q.toCamelCase(" " + t);
                        ["get", "set", "has"].forEach((function(r) {
                            Object.defineProperty(e, r + n, {
                                value: function(e, n, o) {
                                    return this[r].call(this, t, e, n, o)
                                },
                                configurable: !0
                            })
                        }
                        ))
                    }(n, e),
                    t[r] = !0)
                }
                return q.isArray(e) ? e.forEach(r) : r(e),
                this
            }
        }]),
        i
    }();
    pe.accessor(["Content-Type", "Content-Length", "Accept", "Accept-Encoding", "User-Agent", "Authorization"]),
    q.freezeMethods(pe.prototype),
    q.freezeMethods(pe);
    var he = pe;
    function me(e, t) {
        var n = this || se
          , r = t || n
          , o = he.from(r.headers)
          , i = r.data;
        return q.forEach(e, (function(e) {
            i = e.call(n, i, o.normalize(), t ? t.status : void 0)
        }
        )),
        o.normalize(),
        i
    }
    function ye(e) {
        return !(!e || !e.__CANCEL__)
    }
    function ve(e, t, n) {
        M.call(this, null == e ? "canceled" : e, M.ERR_CANCELED, t, n),
        this.name = "CanceledError"
    }
    q.inherits(ve, M, {
        __CANCEL__: !0
    });
    var be = re.isStandardBrowserEnv ? {
        write: function(e, t, n, r, o, i) {
            var a = [];
            a.push(e + "=" + encodeURIComponent(t)),
            q.isNumber(n) && a.push("expires=" + new Date(n).toGMTString()),
            q.isString(r) && a.push("path=" + r),
            q.isString(o) && a.push("domain=" + o),
            !0 === i && a.push("secure"),
            document.cookie = a.join("; ")
        },
        read: function(e) {
            var t = document.cookie.match(new RegExp("(^|;\\s*)(" + e + ")=([^;]*)"));
            return t ? decodeURIComponent(t[3]) : null
        },
        remove: function(e) {
            this.write(e, "", Date.now() - 864e5)
        }
    } : {
        write: function() {},
        read: function() {
            return null
        },
        remove: function() {}
    };
    function ge(e, t) {
        return e && !/^([a-z][a-z\d+\-.]*:)?\/\//i.test(t) ? function(e, t) {
            return t ? e.replace(/\/+$/, "") + "/" + t.replace(/^\/+/, "") : e
        }(e, t) : t
    }
    var we = re.isStandardBrowserEnv ? function() {
        var e, t = /(msie|trident)/i.test(navigator.userAgent), n = document.createElement("a");
        function r(e) {
            var r = e;
            return t && (n.setAttribute("href", r),
            r = n.href),
            n.setAttribute("href", r),
            {
                href: n.href,
                protocol: n.protocol ? n.protocol.replace(/:$/, "") : "",
                host: n.host,
                search: n.search ? n.search.replace(/^\?/, "") : "",
                hash: n.hash ? n.hash.replace(/^#/, "") : "",
                hostname: n.hostname,
                port: n.port,
                pathname: "/" === n.pathname.charAt(0) ? n.pathname : "/" + n.pathname
            }
        }
        return e = r(window.location.href),
        function(t) {
            var n = q.isString(t) ? r(t) : t;
            return n.protocol === e.protocol && n.host === e.host
        }
    }() : function() {
        return !0
    }
    ;
    function Ee(e, t) {
        var n = 0
          , r = function(e, t) {
            e = e || 10;
            var n, r = new Array(e), o = new Array(e), i = 0, a = 0;
            return t = void 0 !== t ? t : 1e3,
            function(s) {
                var u = Date.now()
                  , c = o[a];
                n || (n = u),
                r[i] = s,
                o[i] = u;
                for (var f = a, l = 0; f !== i; )
                    l += r[f++],
                    f %= e;
                if ((i = (i + 1) % e) === a && (a = (a + 1) % e),
                !(u - n < t)) {
                    var d = c && u - c;
                    return d ? Math.round(1e3 * l / d) : void 0
                }
            }
        }(50, 250);
        return function(o) {
            var i = o.loaded
              , a = o.lengthComputable ? o.total : void 0
              , s = i - n
              , u = r(s);
            n = i;
            var c = {
                loaded: i,
                total: a,
                progress: a ? i / a : void 0,
                bytes: s,
                rate: u || void 0,
                estimated: u && a && i <= a ? (a - i) / u : void 0,
                event: o
            };
            c[t ? "download" : "upload"] = !0,
            e(c)
        }
    }
    var Oe = {
        http: null,
        xhr: "undefined" != typeof XMLHttpRequest && function(e) {
            return new Promise((function(t, n) {
                var r, o = e.data, i = he.from(e.headers).normalize(), a = e.responseType;
                function s() {
                    e.cancelToken && e.cancelToken.unsubscribe(r),
                    e.signal && e.signal.removeEventListener("abort", r)
                }
                q.isFormData(o) && (re.isStandardBrowserEnv || re.isStandardBrowserWebWorkerEnv ? i.setContentType(!1) : i.setContentType("multipart/form-data;", !1));
                var u = new XMLHttpRequest;
                if (e.auth) {
                    var c = e.auth.username || ""
                      , f = e.auth.password ? unescape(encodeURIComponent(e.auth.password)) : "";
                    i.set("Authorization", "Basic " + btoa(c + ":" + f))
                }
                var l = ge(e.baseURL, e.url);
                function d() {
                    if (u) {
                        var r = he.from("getAllResponseHeaders"in u && u.getAllResponseHeaders());
                        !function(e, t, n) {
                            var r = n.config.validateStatus;
                            n.status && r && !r(n.status) ? t(new M("Request failed with status code " + n.status,[M.ERR_BAD_REQUEST, M.ERR_BAD_RESPONSE][Math.floor(n.status / 100) - 4],n.config,n.request,n)) : e(n)
                        }((function(e) {
                            t(e),
                            s()
                        }
                        ), (function(e) {
                            n(e),
                            s()
                        }
                        ), {
                            data: a && "text" !== a && "json" !== a ? u.response : u.responseText,
                            status: u.status,
                            statusText: u.statusText,
                            headers: r,
                            config: e,
                            request: u
                        }),
                        u = null
                    }
                }
                if (u.open(e.method.toUpperCase(), Y(l, e.params, e.paramsSerializer), !0),
                u.timeout = e.timeout,
                "onloadend"in u ? u.onloadend = d : u.onreadystatechange = function() {
                    u && 4 === u.readyState && (0 !== u.status || u.responseURL && 0 === u.responseURL.indexOf("file:")) && setTimeout(d)
                }
                ,
                u.onabort = function() {
                    u && (n(new M("Request aborted",M.ECONNABORTED,e,u)),
                    u = null)
                }
                ,
                u.onerror = function() {
                    n(new M("Network Error",M.ERR_NETWORK,e,u)),
                    u = null
                }
                ,
                u.ontimeout = function() {
                    var t = e.timeout ? "timeout of " + e.timeout + "ms exceeded" : "timeout exceeded"
                      , r = e.transitional || ne;
                    e.timeoutErrorMessage && (t = e.timeoutErrorMessage),
                    n(new M(t,r.clarifyTimeoutError ? M.ETIMEDOUT : M.ECONNABORTED,e,u)),
                    u = null
                }
                ,
                re.isStandardBrowserEnv) {
                    var p = (e.withCredentials || we(l)) && e.xsrfCookieName && be.read(e.xsrfCookieName);
                    p && i.set(e.xsrfHeaderName, p)
                }
                void 0 === o && i.setContentType(null),
                "setRequestHeader"in u && q.forEach(i.toJSON(), (function(e, t) {
                    u.setRequestHeader(t, e)
                }
                )),
                q.isUndefined(e.withCredentials) || (u.withCredentials = !!e.withCredentials),
                a && "json" !== a && (u.responseType = e.responseType),
                "function" == typeof e.onDownloadProgress && u.addEventListener("progress", Ee(e.onDownloadProgress, !0)),
                "function" == typeof e.onUploadProgress && u.upload && u.upload.addEventListener("progress", Ee(e.onUploadProgress)),
                (e.cancelToken || e.signal) && (r = function(t) {
                    u && (n(!t || t.type ? new ve(null,e,u) : t),
                    u.abort(),
                    u = null)
                }
                ,
                e.cancelToken && e.cancelToken.subscribe(r),
                e.signal && (e.signal.aborted ? r() : e.signal.addEventListener("abort", r)));
                var h, m = (h = /^([-+\w]{1,25})(:?\/\/|:)/.exec(l)) && h[1] || "";
                m && -1 === re.protocols.indexOf(m) ? n(new M("Unsupported protocol " + m + ":",M.ERR_BAD_REQUEST,e)) : u.send(o || null)
            }
            ))
        }
    };
    q.forEach(Oe, (function(e, t) {
        if (e) {
            try {
                Object.defineProperty(e, "name", {
                    value: t
                })
            } catch (e) {}
            Object.defineProperty(e, "adapterName", {
                value: t
            })
        }
    }
    ));
    var Se = function(e) {
        for (var t, n, r = (e = q.isArray(e) ? e : [e]).length, o = 0; o < r && (t = e[o],
        !(n = q.isString(t) ? Oe[t.toLowerCase()] : t)); o++)
            ;
        if (!n) {
            if (!1 === n)
                throw new M("Adapter ".concat(t, " is not supported by the environment"),"ERR_NOT_SUPPORT");
            throw new Error(q.hasOwnProp(Oe, t) ? "Adapter '".concat(t, "' is not available in the build") : "Unknown adapter '".concat(t, "'"))
        }
        if (!q.isFunction(n))
            throw new TypeError("adapter is not a function");
        return n
    };
    function Re(e) {
        if (e.cancelToken && e.cancelToken.throwIfRequested(),
        e.signal && e.signal.aborted)
            throw new ve(null,e)
    }
    function Ae(e) {
        return Re(e),
        e.headers = he.from(e.headers),
        e.data = me.call(e, e.transformRequest),
        -1 !== ["post", "put", "patch"].indexOf(e.method) && e.headers.setContentType("application/x-www-form-urlencoded", !1),
        Se(e.adapter || se.adapter)(e).then((function(t) {
            return Re(e),
            t.data = me.call(e, e.transformResponse, t),
            t.headers = he.from(t.headers),
            t
        }
        ), (function(t) {
            return ye(t) || (Re(e),
            t && t.response && (t.response.data = me.call(e, e.transformResponse, t.response),
            t.response.headers = he.from(t.response.headers))),
            Promise.reject(t)
        }
        ))
    }
    var Te = function(e) {
        return e instanceof he ? e.toJSON() : e
    };
    function je(e, t) {
        t = t || {};
        var n = {};
        function r(e, t, n) {
            return q.isPlainObject(e) && q.isPlainObject(t) ? q.merge.call({
                caseless: n
            }, e, t) : q.isPlainObject(t) ? q.merge({}, t) : q.isArray(t) ? t.slice() : t
        }
        function o(e, t, n) {
            return q.isUndefined(t) ? q.isUndefined(e) ? void 0 : r(void 0, e, n) : r(e, t, n)
        }
        function i(e, t) {
            if (!q.isUndefined(t))
                return r(void 0, t)
        }
        function a(e, t) {
            return q.isUndefined(t) ? q.isUndefined(e) ? void 0 : r(void 0, e) : r(void 0, t)
        }
        function s(n, o, i) {
            return i in t ? r(n, o) : i in e ? r(void 0, n) : void 0
        }
        var u = {
            url: i,
            method: i,
            data: i,
            baseURL: a,
            transformRequest: a,
            transformResponse: a,
            paramsSerializer: a,
            timeout: a,
            timeoutMessage: a,
            withCredentials: a,
            adapter: a,
            responseType: a,
            xsrfCookieName: a,
            xsrfHeaderName: a,
            onUploadProgress: a,
            onDownloadProgress: a,
            decompress: a,
            maxContentLength: a,
            maxBodyLength: a,
            beforeRedirect: a,
            transport: a,
            httpAgent: a,
            httpsAgent: a,
            cancelToken: a,
            socketPath: a,
            responseEncoding: a,
            validateStatus: s,
            headers: function(e, t) {
                return o(Te(e), Te(t), !0)
            }
        };
        return q.forEach(Object.keys(Object.assign({}, e, t)), (function(r) {
            var i = u[r] || o
              , a = i(e[r], t[r], r);
            q.isUndefined(a) && i !== s || (n[r] = a)
        }
        )),
        n
    }
    var Ne = "1.4.0"
      , Ce = {};
    ["object", "boolean", "number", "function", "string", "symbol"].forEach((function(t, n) {
        Ce[t] = function(r) {
            return e(r) === t || "a" + (n < 1 ? "n " : " ") + t
        }
    }
    ));
    var xe = {};
    Ce.transitional = function(e, t, n) {
        function r(e, t) {
            return "[Axios v1.4.0] Transitional option '" + e + "'" + t + (n ? ". " + n : "")
        }
        return function(n, o, i) {
            if (!1 === e)
                throw new M(r(o, " has been removed" + (t ? " in " + t : "")),M.ERR_DEPRECATED);
            return t && !xe[o] && (xe[o] = !0,
            console.warn(r(o, " has been deprecated since v" + t + " and will be removed in the near future"))),
            !e || e(n, o, i)
        }
    }
    ;
    var Pe = {
        assertOptions: function(t, n, r) {
            if ("object" !== e(t))
                throw new M("options must be an object",M.ERR_BAD_OPTION_VALUE);
            for (var o = Object.keys(t), i = o.length; i-- > 0; ) {
                var a = o[i]
                  , s = n[a];
                if (s) {
                    var u = t[a]
                      , c = void 0 === u || s(u, a, t);
                    if (!0 !== c)
                        throw new M("option " + a + " must be " + c,M.ERR_BAD_OPTION_VALUE)
                } else if (!0 !== r)
                    throw new M("Unknown option " + a,M.ERR_BAD_OPTION)
            }
        },
        validators: Ce
    }
      , ke = Pe.validators
      , Ue = function() {
        function e(n) {
            t(this, e),
            this.defaults = n,
            this.interceptors = {
                request: new te,
                response: new te
            }
        }
        return r(e, [{
            key: "request",
            value: function(e, t) {
                "string" == typeof e ? (t = t || {}).url = e : t = e || {};
                var n, r = t = je(this.defaults, t), o = r.transitional, i = r.paramsSerializer, a = r.headers;
                void 0 !== o && Pe.assertOptions(o, {
                    silentJSONParsing: ke.transitional(ke.boolean),
                    forcedJSONParsing: ke.transitional(ke.boolean),
                    clarifyTimeoutError: ke.transitional(ke.boolean)
                }, !1),
                null != i && (q.isFunction(i) ? t.paramsSerializer = {
                    serialize: i
                } : Pe.assertOptions(i, {
                    encode: ke.function,
                    serialize: ke.function
                }, !0)),
                t.method = (t.method || this.defaults.method || "get").toLowerCase(),
                (n = a && q.merge(a.common, a[t.method])) && q.forEach(["delete", "get", "head", "post", "put", "patch", "common"], (function(e) {
                    delete a[e]
                }
                )),
                t.headers = he.concat(n, a);
                var s = []
                  , u = !0;
                this.interceptors.request.forEach((function(e) {
                    "function" == typeof e.runWhen && !1 === e.runWhen(t) || (u = u && e.synchronous,
                    s.unshift(e.fulfilled, e.rejected))
                }
                ));
                var c, f = [];
                this.interceptors.response.forEach((function(e) {
                    f.push(e.fulfilled, e.rejected)
                }
                ));
                var l, d = 0;
                if (!u) {
                    var p = [Ae.bind(this), void 0];
                    for (p.unshift.apply(p, s),
                    p.push.apply(p, f),
                    l = p.length,
                    c = Promise.resolve(t); d < l; )
                        c = c.then(p[d++], p[d++]);
                    return c
                }
                l = s.length;
                var h = t;
                for (d = 0; d < l; ) {
                    var m = s[d++]
                      , y = s[d++];
                    try {
                        h = m(h)
                    } catch (e) {
                        y.call(this, e);
                        break
                    }
                }
                try {
                    c = Ae.call(this, h)
                } catch (e) {
                    return Promise.reject(e)
                }
                for (d = 0,
                l = f.length; d < l; )
                    c = c.then(f[d++], f[d++]);
                return c
            }
        }, {
            key: "getUri",
            value: function(e) {
                return Y(ge((e = je(this.defaults, e)).baseURL, e.url), e.params, e.paramsSerializer)
            }
        }]),
        e
    }();
    q.forEach(["delete", "get", "head", "options"], (function(e) {
        Ue.prototype[e] = function(t, n) {
            return this.request(je(n || {}, {
                method: e,
                url: t,
                data: (n || {}).data
            }))
        }
    }
    )),
    q.forEach(["post", "put", "patch"], (function(e) {
        function t(t) {
            return function(n, r, o) {
                return this.request(je(o || {}, {
                    method: e,
                    headers: t ? {
                        "Content-Type": "multipart/form-data"
                    } : {},
                    url: n,
                    data: r
                }))
            }
        }
        Ue.prototype[e] = t(),
        Ue.prototype[e + "Form"] = t(!0)
    }
    ));
    var _e = Ue
      , Fe = function() {
        function e(n) {
            if (t(this, e),
            "function" != typeof n)
                throw new TypeError("executor must be a function.");
            var r;
            this.promise = new Promise((function(e) {
                r = e
            }
            ));
            var o = this;
            this.promise.then((function(e) {
                if (o._listeners) {
                    for (var t = o._listeners.length; t-- > 0; )
                        o._listeners[t](e);
                    o._listeners = null
                }
            }
            )),
            this.promise.then = function(e) {
                var t, n = new Promise((function(e) {
                    o.subscribe(e),
                    t = e
                }
                )).then(e);
                return n.cancel = function() {
                    o.unsubscribe(t)
                }
                ,
                n
            }
            ,
            n((function(e, t, n) {
                o.reason || (o.reason = new ve(e,t,n),
                r(o.reason))
            }
            ))
        }
        return r(e, [{
            key: "throwIfRequested",
            value: function() {
                if (this.reason)
                    throw this.reason
            }
        }, {
            key: "subscribe",
            value: function(e) {
                this.reason ? e(this.reason) : this._listeners ? this._listeners.push(e) : this._listeners = [e]
            }
        }, {
            key: "unsubscribe",
            value: function(e) {
                if (this._listeners) {
                    var t = this._listeners.indexOf(e);
                    -1 !== t && this._listeners.splice(t, 1)
                }
            }
        }], [{
            key: "source",
            value: function() {
                var t;
                return {
                    token: new e((function(e) {
                        t = e
                    }
                    )),
                    cancel: t
                }
            }
        }]),
        e
    }();
    var Be = {
        Continue: 100,
        SwitchingProtocols: 101,
        Processing: 102,
        EarlyHints: 103,
        Ok: 200,
        Created: 201,
        Accepted: 202,
        NonAuthoritativeInformation: 203,
        NoContent: 204,
        ResetContent: 205,
        PartialContent: 206,
        MultiStatus: 207,
        AlreadyReported: 208,
        ImUsed: 226,
        MultipleChoices: 300,
        MovedPermanently: 301,
        Found: 302,
        SeeOther: 303,
        NotModified: 304,
        UseProxy: 305,
        Unused: 306,
        TemporaryRedirect: 307,
        PermanentRedirect: 308,
        BadRequest: 400,
        Unauthorized: 401,
        PaymentRequired: 402,
        Forbidden: 403,
        NotFound: 404,
        MethodNotAllowed: 405,
        NotAcceptable: 406,
        ProxyAuthenticationRequired: 407,
        RequestTimeout: 408,
        Conflict: 409,
        Gone: 410,
        LengthRequired: 411,
        PreconditionFailed: 412,
        PayloadTooLarge: 413,
        UriTooLong: 414,
        UnsupportedMediaType: 415,
        RangeNotSatisfiable: 416,
        ExpectationFailed: 417,
        ImATeapot: 418,
        MisdirectedRequest: 421,
        UnprocessableEntity: 422,
        Locked: 423,
        FailedDependency: 424,
        TooEarly: 425,
        UpgradeRequired: 426,
        PreconditionRequired: 428,
        TooManyRequests: 429,
        RequestHeaderFieldsTooLarge: 431,
        UnavailableForLegalReasons: 451,
        InternalServerError: 500,
        NotImplemented: 501,
        BadGateway: 502,
        ServiceUnavailable: 503,
        GatewayTimeout: 504,
        HttpVersionNotSupported: 505,
        VariantAlsoNegotiates: 506,
        InsufficientStorage: 507,
        LoopDetected: 508,
        NotExtended: 510,
        NetworkAuthenticationRequired: 511
    };
    Object.entries(Be).forEach((function(e) {
        var t = o(e, 2)
          , n = t[0]
          , r = t[1];
        Be[r] = n
    }
    ));
    var Le = Be;
    var De = function e(t) {
        var n = new _e(t)
          , r = a(_e.prototype.request, n);
        return q.extend(r, _e.prototype, n, {
            allOwnKeys: !0
        }),
        q.extend(r, n, null, {
            allOwnKeys: !0
        }),
        r.create = function(n) {
            return e(je(t, n))
        }
        ,
        r
    }(se);
    return De.Axios = _e,
    De.CanceledError = ve,
    De.CancelToken = Fe,
    De.isCancel = ye,
    De.VERSION = Ne,
    De.toFormData = G,
    De.AxiosError = M,
    De.Cancel = De.CanceledError,
    De.all = function(e) {
        return Promise.all(e)
    }
    ,
    De.spread = function(e) {
        return function(t) {
            return e.apply(null, t)
        }
    }
    ,
    De.isAxiosError = function(e) {
        return q.isObject(e) && !0 === e.isAxiosError
    }
    ,
    De.mergeConfig = je,
    De.AxiosHeaders = he,
    De.formToJSON = function(e) {
        return oe(q.isHTMLForm(e) ? new FormData(e) : e)
    }
    ,
    De.HttpStatusCode = Le,
    De.default = De,
    De
}
));
//# sourceMappingURL=axios.min.js.map
