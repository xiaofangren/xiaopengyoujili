var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
import { Db } from '@cloudbase/database';
import { EJSON } from 'bson';
var COMPONENT_NAME = 'database';
var gateWayFunc = {
    filterRes: function (res) {
        delete res.header;
        delete res.statusCode;
        return res;
    },
    flattenResData: function (res) {
        if (typeof res.data === 'object' && res.data !== null) {
            var result = __assign(__assign({}, res), res.data);
            delete result.data;
            return result;
        }
        return res;
    },
    safeParseEJSON: function (data) {
        if (typeof data !== 'string')
            return data;
        try {
            return EJSON.parse(data);
        }
        catch (_a) {
            return data;
        }
    },
    buildQueryParams: function (params) {
        return Object.entries(params)
            .filter(function (_a) {
            var _ = _a[0], value = _a[1];
            return value !== undefined && value !== null && value !== '';
        })
            .map(function (_a) {
            var key = _a[0], value = _a[1];
            var stringValue = typeof value === 'object' ? JSON.stringify(value) : String(value);
            return "".concat(encodeURIComponent(key), "=").concat(encodeURIComponent(stringValue));
        })
            .join('&');
    },
    getUrlPrefix: function (data) {
        var instance = (data === null || data === void 0 ? void 0 : data.instance) || '(default)';
        var database = (data === null || data === void 0 ? void 0 : data.database) || '(default)';
        return "/database/instances/".concat(instance, "/databases/").concat(database);
    },
    'database.queryDocument': function (data) {
        var _a, _b, _c, _d, _e;
        return __awaiter(this, void 0, void 0, function () {
            var isQueryDoc, queryParams, url, res;
            return __generator(this, function (_f) {
                switch (_f.label) {
                    case 0:
                        isQueryDoc = !!((_a = data.query) === null || _a === void 0 ? void 0 : _a._id);
                        queryParams = gateWayFunc.buildQueryParams(__assign({ projection: data.projection, transactionId: data.transactionId }, (isQueryDoc
                            ? {}
                            : {
                                offset: (_b = data.offset) !== null && _b !== void 0 ? _b : 0,
                                limit: (_c = data.limit) !== null && _c !== void 0 ? _c : 100,
                                order: data.order,
                                query: data.query ? EJSON.stringify(data.query, { relaxed: false }) : undefined,
                            })));
                        url = "".concat(gateWayFunc.getUrlPrefix(data), "/collections/").concat(data.collectionName, "/documents?").concat(queryParams);
                        if (isQueryDoc) {
                            url = "".concat(gateWayFunc.getUrlPrefix(data), "/collections/").concat(data.collectionName, "/documents/").concat(((_d = data.query._id) === null || _d === void 0 ? void 0 : _d.$eq) || data.query._id, "?").concat(queryParams);
                        }
                        return [4, this.gateWay({
                                url: url,
                                method: 'GET',
                            })];
                    case 1:
                        res = _f.sent();
                        res.data = gateWayFunc.safeParseEJSON(JSON.stringify(res.data));
                        if (isQueryDoc && !res.code && !((_e = res.data) === null || _e === void 0 ? void 0 : _e.code)) {
                            return [2, __assign(__assign({}, res), { data: { list: [res.data] } })];
                        }
                        return [2, gateWayFunc.filterRes(res)];
                }
            });
        });
    },
    'database.addDocument': function (data) {
        var _a, _b, _c;
        return __awaiter(this, void 0, void 0, function () {
            var res;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0: return [4, this.gateWay({
                            url: "".concat(gateWayFunc.getUrlPrefix(data), "/collections/").concat(data.collectionName, "/documents"),
                            method: 'POST',
                            data: __assign({ data: Array.isArray(data.data) ? data.data : [data.data] }, (data.transactionId && { transactionId: data.transactionId })),
                        })];
                    case 1:
                        res = _d.sent();
                        if (Array.isArray(data.data)) {
                            res = __assign(__assign({}, res), { data: __assign({ ids: ((_a = res.data) === null || _a === void 0 ? void 0 : _a.insertedIds) || [] }, res.data) });
                        }
                        else if ((_c = (_b = res.data) === null || _b === void 0 ? void 0 : _b.insertedIds) === null || _c === void 0 ? void 0 : _c[0]) {
                            res = __assign(__assign({}, res), { data: __assign({ _id: res.data.insertedIds[0] }, res.data) });
                        }
                        return [2, gateWayFunc.filterRes(res)];
                }
            });
        });
    },
    'database.updateDocument': function (data) {
        return __awaiter(this, void 0, void 0, function () {
            var res;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4, this.gateWay({
                            url: "".concat(gateWayFunc.getUrlPrefix(data), "/collections/").concat(data.collectionName, "/documents"),
                            method: 'PATCH',
                            data: __assign({ query: data.query, data: data.data, multi: !!data.multi, upsert: !!data.upsert, replaceMode: !!data.replaceMode }, (data.transactionId && { transactionId: data.transactionId })),
                        })];
                    case 1:
                        res = _a.sent();
                        return [2, gateWayFunc.filterRes(res)];
                }
            });
        });
    },
    'database.deleteDocument': function (data) {
        return __awaiter(this, void 0, void 0, function () {
            var res;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4, this.gateWay({
                            url: "".concat(gateWayFunc.getUrlPrefix(data), "/collections/").concat(data.collectionName, "/documents/remove"),
                            method: 'POST',
                            data: __assign({ query: data.query, multi: !!data.multi }, (data.transactionId && { transactionId: data.transactionId })),
                        })];
                    case 1:
                        res = _a.sent();
                        return [2, gateWayFunc.filterRes(res)];
                }
            });
        });
    },
    'database.countDocument': function (data) {
        return __awaiter(this, void 0, void 0, function () {
            var queryParams, res;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        queryParams = gateWayFunc.buildQueryParams({
                            count: true,
                            query: data.query ? EJSON.stringify(data.query, { relaxed: false }) : undefined,
                        });
                        return [4, this.gateWay({
                                url: "".concat(gateWayFunc.getUrlPrefix(data), "/collections/").concat(data.collectionName, "/documents?").concat(queryParams),
                                method: 'GET',
                            })];
                    case 1:
                        res = _a.sent();
                        return [2, gateWayFunc.filterRes(res)];
                }
            });
        });
    },
    'database.addCollection': function (data) {
        return __awaiter(this, void 0, void 0, function () {
            var res;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4, this.gateWay({
                            url: "".concat(gateWayFunc.getUrlPrefix(data), "/collections"),
                            method: 'POST',
                            data: { collectionName: data.collectionName },
                        })];
                    case 1:
                        res = _a.sent();
                        return [2, gateWayFunc.filterRes(res)];
                }
            });
        });
    },
    'database.aggregate': function (data) {
        var _a;
        return __awaiter(this, void 0, void 0, function () {
            var pipeline, res;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        pipeline = data.stages.map(function (stage) {
                            var _a, _b;
                            try {
                                var value = typeof stage.stageValue === 'string' ? JSON.parse(stage.stageValue) : stage.stageValue;
                                return _a = {},
                                    _a[stage.stageKey] = EJSON.serialize(value),
                                    _a;
                            }
                            catch (_c) {
                                return _b = {}, _b[stage.stageKey] = stage.stageValue, _b;
                            }
                        });
                        return [4, this.gateWay({
                                url: "".concat(gateWayFunc.getUrlPrefix(data), "/collections/").concat(data.collectionName, "/documents/aggregations"),
                                method: 'POST',
                                data: { pipeline: pipeline },
                            })];
                    case 1:
                        res = _b.sent();
                        if (Array.isArray((_a = res.data) === null || _a === void 0 ? void 0 : _a.list)) {
                            res.data.list = JSON.stringify(res.data.list.map(function (item) { return JSON.stringify(item); }));
                        }
                        return [2, gateWayFunc.filterRes(res)];
                }
            });
        });
    },
    'database.startTransaction': function (data) {
        return __awaiter(this, void 0, void 0, function () {
            var res;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4, this.gateWay({
                            url: "".concat(gateWayFunc.getUrlPrefix(data), "/transactions"),
                            method: 'POST',
                        })];
                    case 1:
                        res = _a.sent();
                        return [2, gateWayFunc.filterRes(gateWayFunc.flattenResData(res))];
                }
            });
        });
    },
    'database.commitTransaction': function (data) {
        return __awaiter(this, void 0, void 0, function () {
            var res;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4, this.gateWay({
                            url: "".concat(gateWayFunc.getUrlPrefix(data), "/transactions/").concat(data.transactionId, "/commit"),
                            method: 'POST',
                        })];
                    case 1:
                        res = _a.sent();
                        return [2, gateWayFunc.filterRes(res)];
                }
            });
        });
    },
    'database.abortTransaction': function (data) {
        return __awaiter(this, void 0, void 0, function () {
            var res;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4, this.gateWay({
                            url: "".concat(gateWayFunc.getUrlPrefix(data), "/transactions/").concat(data.transactionId, "/rollback"),
                            method: 'POST',
                        })];
                    case 1:
                        res = _a.sent();
                        return [2, gateWayFunc.filterRes(res)];
                }
            });
        });
    },
    'database.getInTransaction': function (data) {
        var _a;
        return __awaiter(this, void 0, void 0, function () {
            var res;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4, gateWayFunc['database.queryDocument'].call(this, data)];
                    case 1:
                        res = _b.sent();
                        if (typeof res.data === 'object' && res.data !== null) {
                            if ((_a = res.data) === null || _a === void 0 ? void 0 : _a.code) {
                                return [2, gateWayFunc.flattenResData(res)];
                            }
                            return [2, __assign(__assign({}, res), { data: JSON.stringify(res.data) })];
                        }
                        return [2, res];
                }
            });
        });
    },
    'database.updateDocInTransaction': function (data) {
        return __awaiter(this, void 0, void 0, function () {
            var res;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        data.data = gateWayFunc.safeParseEJSON(data.data);
                        return [4, gateWayFunc['database.updateDocument'].call(this, data)];
                    case 1:
                        res = _a.sent();
                        return [2, gateWayFunc.flattenResData(res)];
                }
            });
        });
    },
    'database.deleteDocInTransaction': function (data) {
        return __awaiter(this, void 0, void 0, function () {
            var res;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4, gateWayFunc['database.deleteDocument'].call(this, data)];
                    case 1:
                        res = _a.sent();
                        return [2, gateWayFunc.flattenResData(res)];
                }
            });
        });
    },
    'database.insertDocInTransaction': function (data) {
        var _a;
        return __awaiter(this, void 0, void 0, function () {
            var res, hasId;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        data.data = gateWayFunc.safeParseEJSON(data.data);
                        return [4, gateWayFunc['database.addDocument'].call(this, data)];
                    case 1:
                        res = _b.sent();
                        if (typeof res.data === 'object' && res.data !== null) {
                            hasId = !!((_a = res.data) === null || _a === void 0 ? void 0 : _a._id);
                            res = __assign(__assign(__assign({}, res), { inserted: hasId ? 1 : 0, ok: hasId ? 1 : 0 }), res.data);
                        }
                        else {
                            res = __assign({ inserted: 0, ok: 0 }, res);
                        }
                        delete res.data;
                        return [2, res];
                }
            });
        });
    },
    'database.runCommands': function (data) {
        return __awaiter(this, void 0, void 0, function () {
            var res;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4, this.gateWay({
                            url: "".concat(gateWayFunc.getUrlPrefix(data), "/commands"),
                            method: 'POST',
                            data: __assign({ commands: EJSON.serialize(data.commands) }, (data.transactionId && { transactionId: data.transactionId })),
                        })];
                    case 1:
                        res = _a.sent();
                        if (typeof res.data === 'object' && res.data !== null) {
                            res = __assign(__assign({}, res), res.data);
                            delete res.data;
                            delete res.request_id;
                        }
                        try {
                            res = EJSON.deserialize(res);
                        }
                        catch (_b) {
                        }
                        return [2, gateWayFunc.filterRes(res)];
                }
            });
        });
    },
};
function database(dbConfig) {
    var _a = this.platform, adapter = _a.adapter, runtime = _a.runtime;
    var Req = (function (_super) {
        __extends(Req, _super);
        function Req(config) {
            return _super.call(this, config) || this;
        }
        Req.prototype.send = function (action, data) {
            return __awaiter(this, void 0, void 0, function () {
                var res;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            res = null;
                            if (!(this.config.endPointMode === 'GATEWAY' && gateWayFunc[action])) return [3, 2];
                            return [4, gateWayFunc[action].call(this, data)];
                        case 1:
                            res = _a.sent();
                            return [3, 4];
                        case 2: return [4, _super.prototype.send.call(this, action, data)];
                        case 3:
                            res = _a.sent();
                            _a.label = 4;
                        case 4: return [2, res];
                    }
                });
            });
        };
        return Req;
    }(this.request.constructor));
    Db.reqClass = Req;
    Db.getAccessToken = this.authInstance ? this.authInstance.getAccessToken.bind(this.authInstance) : function () { return ''; };
    Db.runtime = runtime;
    if (this.wsClientClass) {
        Db.wsClass = adapter.wsClass;
        Db.wsClientClass = this.wsClientClass;
    }
    if (!Db.ws) {
        Db.ws = null;
    }
    var NewDb = (function (_super) {
        __extends(NewDb, _super);
        function NewDb(config) {
            return _super.call(this, config) || this;
        }
        NewDb.prototype.runCommands = function (params) {
            return __awaiter(this, void 0, void 0, function () {
                var request;
                return __generator(this, function (_a) {
                    request = Db.createRequest(this.config);
                    return [2, request.send('database.runCommands', params)];
                });
            });
        };
        return NewDb;
    }(Db));
    return new NewDb(__assign(__assign(__assign({}, this.config), { _fromApp: this }), dbConfig));
}
var component = {
    name: COMPONENT_NAME,
    entity: {
        database: database,
    },
};
try {
    cloudbase.registerComponent(component);
}
catch (e) { }
export function registerDatabase(app) {
    try {
        app.registerComponent(component);
    }
    catch (e) {
        console.warn(e);
    }
}
try {
    ;
    window.registerDatabase = registerDatabase;
}
catch (e) { }

//# sourceMappingURL=data:application/json;charset=utf8;base64,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SUFDckMsSUFBSSxFQUFFLGNBQWM7SUFDcEIsTUFBTSxFQUFFO1FBQ04sUUFBUSxVQUFBO0tBQ1Q7Q0FDRixDQUFBO0FBQ0QsSUFBSTtJQUNGLFNBQVMsQ0FBQyxpQkFBaUIsQ0FBQyxTQUFTLENBQUMsQ0FBQTtDQUN2QztBQUFDLE9BQU8sQ0FBQyxFQUFFLEdBQUU7QUFFZCxNQUFNLFVBQVUsZ0JBQWdCLENBQUMsR0FBb0M7SUFDbkUsSUFBSTtRQUNGLEdBQUcsQ0FBQyxpQkFBaUIsQ0FBQyxTQUFTLENBQUMsQ0FBQTtLQUNqQztJQUFDLE9BQU8sQ0FBQyxFQUFFO1FBQ1YsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQTtLQUNoQjtBQUNILENBQUM7QUFFRCxJQUFJO0lBQ0YsQ0FBQztJQUFDLE1BQWMsQ0FBQyxnQkFBZ0IsR0FBRyxnQkFBZ0IsQ0FBQTtDQUNyRDtBQUFDLE9BQU8sQ0FBQyxFQUFFLEdBQUUiLCJmaWxlIjoiaW5kZXguZXNtLmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgRGIgfSBmcm9tICdAY2xvdWRiYXNlL2RhdGFiYXNlJ1xuaW1wb3J0IHsgSUNsb3VkYmFzZSB9IGZyb20gJ0BjbG91ZGJhc2UvdHlwZXMnXG5pbXBvcnQgeyBJQ2xvdWRiYXNlQ29tcG9uZW50IH0gZnJvbSAnQGNsb3VkYmFzZS90eXBlcy9jb21wb25lbnQnXG5pbXBvcnQgY2xvdWRiYXNlTlMgZnJvbSAnLi4vLi4vaW5kZXgnXG5pbXBvcnQgeyBFSlNPTiB9IGZyb20gJ2Jzb24nXG5cbmRlY2xhcmUgY29uc3QgY2xvdWRiYXNlOiBJQ2xvdWRiYXNlXG5kZWNsYXJlIHR5cGUgUXVlcnlUeXBlID0gJ1dIRVJFJyB8ICdET0MnXG5cbi8qKlxuICog5pWw5o2u5bqT6YWN572u5o6l5Y+jXG4gKi9cbmludGVyZmFjZSBJRGJDb25maWcge1xuICAvKiog5a6e5L6LIElE77yI5Y+v6YCJ77yM6buY6K6kICcoZGVmYXVsdCkn77yJICovXG4gIGluc3RhbmNlPzogc3RyaW5nXG4gIC8qKiDmlbDmja7lupPlkI3np7DvvIjlj6/pgInvvIzpu5jorqQgJyhkZWZhdWx0KSfvvIkgKi9cbiAgZGF0YWJhc2U/OiBzdHJpbmdcbn1cblxuaW50ZXJmYWNlIElCYXNlUmVxIGV4dGVuZHMgSURiQ29uZmlnIHtcbiAgY29sbGVjdGlvbk5hbWU6IHN0cmluZ1xuICB0cmFuc2FjdGlvbklkPzogc3RyaW5nXG59XG5cbmludGVyZmFjZSBJRG9jdW1lbnRzUXVlcnlSZXEgZXh0ZW5kcyBJQmFzZVJlcSB7XG4gIHF1ZXJ5PzogYW55XG4gIC8qKiBAZGVwcmVjYXRlZCDkvb/nlKggcXVlcnkg5pu/5LujICovXG4gIHF1ZXJ5VHlwZT86IFF1ZXJ5VHlwZVxuICBvcmRlcj86IHN0cmluZ1tdXG4gIG9mZnNldD86IG51bWJlclxuICBsaW1pdD86IG51bWJlclxuICBwcm9qZWN0aW9uPzogT2JqZWN0XG59XG5cbmludGVyZmFjZSBJRG9jdW1lbnRzQWRkUmVxIGV4dGVuZHMgSUJhc2VSZXEge1xuICBkYXRhOiBPYmplY3QgfCBPYmplY3RbXVxufVxuXG5pbnRlcmZhY2UgSURvY3VtZW50c1VwZGF0ZVJlcSBleHRlbmRzIElCYXNlUmVxIHtcbiAgcXVlcnk6IE9iamVjdFxuICBkYXRhOiBPYmplY3RcbiAgLyoqIOaYr+WQpuaJuemHj+abtOaWsO+8iOm7mOiupCBmYWxzZe+8iSAqL1xuICBtdWx0aT86IGJvb2xlYW5cbiAgLyoqIOaKiuaJgOacieabtOaWsOaVsOaNrui9rOS4uuW4puaTjeS9nOespueahCAqL1xuICBtZXJnZT86IGJvb2xlYW5cbiAgLyoqIOS4jeWtmOWcqOaXtuaYr+WQpuWIm+W7uu+8iOm7mOiupCBmYWxzZe+8iSAqL1xuICB1cHNlcnQ/OiBib29sZWFuXG4gIC8qKiDmmK/lkKbmm7/mjaLmlbTkuKrmlofmoaPvvIjpu5jorqQgZmFsc2XvvIzkuLogdHJ1ZSDml7bmm7/mjaLmlbTkuKrmlofmoaPogIzpnZ7lkIjlubbmm7TmlrDvvIkgKi9cbiAgcmVwbGFjZU1vZGU/OiBib29sZWFuXG4gIC8qKiBAZGVwcmVjYXRlZCDkvb/nlKggcXVlcnkg5pu/5LujICovXG4gIHF1ZXJ5VHlwZT86IFF1ZXJ5VHlwZVxufVxuXG5pbnRlcmZhY2UgSURvY3VtZW50c1JlbW92ZVJlcSBleHRlbmRzIElCYXNlUmVxIHtcbiAgcXVlcnk6IE9iamVjdFxuICAvKiog5piv5ZCm5om56YeP5Yig6Zmk77yI6buY6K6kIGZhbHNl77yJICovXG4gIG11bHRpPzogYm9vbGVhblxuICAvKiogQGRlcHJlY2F0ZWQg5L2/55SoIHF1ZXJ5IOabv+S7oyAqL1xuICBxdWVyeVR5cGU/OiBRdWVyeVR5cGVcbn1cblxuaW50ZXJmYWNlIElEb2N1bWVudHNDb3VudFJlcSBleHRlbmRzIElCYXNlUmVxIHtcbiAgcXVlcnk6IE9iamVjdFxuICAvKiogQGRlcHJlY2F0ZWQg5L2/55SoIHF1ZXJ5IOabv+S7oyAqL1xuICBxdWVyeVR5cGU/OiBRdWVyeVR5cGVcbn1cblxuaW50ZXJmYWNlIElDb21tb25SZXM8VD4ge1xuICBkYXRhPzogVCAmIHsgY29kZT86IHN0cmluZyB9XG4gIHJlcXVlc3RJZDogc3RyaW5nXG4gIGNvZGU/OiBzdHJpbmdcbiAgbWVzc2FnZT86IHN0cmluZ1xufVxuXG5pbnRlcmZhY2UgSUFkZFJlcyB7XG4gIC8qKiDljZXmnaHmj5LlhaXml7bov5Tlm57nmoTmlofmoaMgSUTvvIjmibnph4/mj5LlhaXml7bkuI3ov5Tlm57vvIkgKi9cbiAgX2lkPzogc3RyaW5nXG4gIC8qKiDmibnph4/mj5LlhaXml7bov5Tlm57nmoTmlofmoaMgSUQg5YiX6KGoICovXG4gIGlkcz86IHN0cmluZ1tdXG4gIGluc2VydGVkSWRzOiBzdHJpbmdbXVxufVxuXG5pbnRlcmZhY2UgSVJ1bkNvbW1hbmRzUmVxIHtcbiAgdHJhbnNhY3Rpb25JZD86IHN0cmluZ1xuICAvKiog5ZG95Luk5pWw57uE77yM5pa55rOV5Lya5bCG5YW26L2s5Li6IE1vbmdvREIg5Y6f55Sf5ZG95Luk77yIRUpTT04g5a+56LGh5qC85byP77yJICovXG4gIGNvbW1hbmRzOiBPYmplY3RbXVxufVxuXG5jb25zdCBDT01QT05FTlRfTkFNRSA9ICdkYXRhYmFzZSdcblxuY29uc3QgZ2F0ZVdheUZ1bmMgPSB7XG4gIC8qKlxuICAgKiDov4fmu6Tlk43lupTvvIznp7vpmaTkuI3lv4XopoHnmoTlrZfmrrVcbiAgICovXG4gIGZpbHRlclJlczogZnVuY3Rpb24gPFQ+KHJlczogSUNvbW1vblJlczxUPiAmIHsgaGVhZGVyPzogYW55OyBzdGF0dXNDb2RlPzogbnVtYmVyIH0pOiBJQ29tbW9uUmVzPFQ+IHtcbiAgICBkZWxldGUgcmVzLmhlYWRlclxuICAgIGRlbGV0ZSByZXMuc3RhdHVzQ29kZVxuICAgIHJldHVybiByZXNcbiAgfSxcblxuICAvKipcbiAgICog5bGV5byA5ZON5bqU5pWw5o2u5Yiw6aG25bGC77yI55So5LqO5LqL5Yqh562J5Zy65pmv77yJXG4gICAqL1xuICBmbGF0dGVuUmVzRGF0YTogZnVuY3Rpb24gPFQ+KHJlczogSUNvbW1vblJlczxUPik6IGFueSB7XG4gICAgaWYgKHR5cGVvZiByZXMuZGF0YSA9PT0gJ29iamVjdCcgJiYgcmVzLmRhdGEgIT09IG51bGwpIHtcbiAgICAgIGNvbnN0IHJlc3VsdCA9IHsgLi4ucmVzLCAuLi5yZXMuZGF0YSB9XG4gICAgICBkZWxldGUgcmVzdWx0LmRhdGFcbiAgICAgIHJldHVybiByZXN1bHRcbiAgICB9XG4gICAgcmV0dXJuIHJlc1xuICB9LFxuXG4gIC8qKlxuICAgKiDlronlhajop6PmnpAgRUpTT05cbiAgICovXG4gIHNhZmVQYXJzZUVKU09OOiBmdW5jdGlvbiAoZGF0YTogYW55KTogYW55IHtcbiAgICBpZiAodHlwZW9mIGRhdGEgIT09ICdzdHJpbmcnKSByZXR1cm4gZGF0YVxuICAgIHRyeSB7XG4gICAgICByZXR1cm4gRUpTT04ucGFyc2UoZGF0YSlcbiAgICB9IGNhdGNoIHtcbiAgICAgIHJldHVybiBkYXRhXG4gICAgfVxuICB9LFxuXG4gIC8qKlxuICAgKiDmnoTlu7ogVVJMIOafpeivouWPguaVsFxuICAgKi9cbiAgYnVpbGRRdWVyeVBhcmFtczogZnVuY3Rpb24gKHBhcmFtczogUmVjb3JkPHN0cmluZywgYW55Pik6IHN0cmluZyB7XG4gICAgcmV0dXJuIE9iamVjdC5lbnRyaWVzKHBhcmFtcylcbiAgICAgIC5maWx0ZXIoKFtfLCB2YWx1ZV0pID0+IHZhbHVlICE9PSB1bmRlZmluZWQgJiYgdmFsdWUgIT09IG51bGwgJiYgdmFsdWUgIT09ICcnKVxuICAgICAgLm1hcCgoW2tleSwgdmFsdWVdKSA9PiB7XG4gICAgICAgIGNvbnN0IHN0cmluZ1ZhbHVlID0gdHlwZW9mIHZhbHVlID09PSAnb2JqZWN0JyA/IEpTT04uc3RyaW5naWZ5KHZhbHVlKSA6IFN0cmluZyh2YWx1ZSlcbiAgICAgICAgcmV0dXJuIGAke2VuY29kZVVSSUNvbXBvbmVudChrZXkpfT0ke2VuY29kZVVSSUNvbXBvbmVudChzdHJpbmdWYWx1ZSl9YFxuICAgICAgfSlcbiAgICAgIC5qb2luKCcmJylcbiAgfSxcblxuICAvKipcbiAgICog6I635Y+WIFVSTCDliY3nvIBcbiAgICovXG4gIGdldFVybFByZWZpeDogZnVuY3Rpb24gKGRhdGE6IElEYkNvbmZpZyk6IHN0cmluZyB7XG4gICAgY29uc3QgaW5zdGFuY2UgPSBkYXRhPy5pbnN0YW5jZSB8fCAnKGRlZmF1bHQpJ1xuICAgIGNvbnN0IGRhdGFiYXNlID0gZGF0YT8uZGF0YWJhc2UgfHwgJyhkZWZhdWx0KSdcbiAgICByZXR1cm4gYC9kYXRhYmFzZS9pbnN0YW5jZXMvJHtpbnN0YW5jZX0vZGF0YWJhc2VzLyR7ZGF0YWJhc2V9YFxuICB9LFxuXG4gICdkYXRhYmFzZS5xdWVyeURvY3VtZW50JzogYXN5bmMgZnVuY3Rpb24gKFxuICAgIGRhdGE6IElEb2N1bWVudHNRdWVyeVJlcSxcbiAgKTogUHJvbWlzZTxJQ29tbW9uUmVzPHsgb2Zmc2V0PzogbnVtYmVyOyBsaW1pdD86IG51bWJlcjsgbGlzdDogYW55W10gfT4+IHtcbiAgICBjb25zdCBpc1F1ZXJ5RG9jID0gISFkYXRhLnF1ZXJ5Py5faWRcbiAgICBjb25zdCBxdWVyeVBhcmFtcyA9IGdhdGVXYXlGdW5jLmJ1aWxkUXVlcnlQYXJhbXMoe1xuICAgICAgcHJvamVjdGlvbjogZGF0YS5wcm9qZWN0aW9uLFxuICAgICAgdHJhbnNhY3Rpb25JZDogZGF0YS50cmFuc2FjdGlvbklkLFxuICAgICAgLi4uKGlzUXVlcnlEb2NcbiAgICAgICAgPyB7fVxuICAgICAgICA6IHtcbiAgICAgICAgICAgIG9mZnNldDogZGF0YS5vZmZzZXQgPz8gMCxcbiAgICAgICAgICAgIGxpbWl0OiBkYXRhLmxpbWl0ID8/IDEwMCxcbiAgICAgICAgICAgIG9yZGVyOiBkYXRhLm9yZGVyLFxuICAgICAgICAgICAgcXVlcnk6IGRhdGEucXVlcnkgPyBFSlNPTi5zdHJpbmdpZnkoZGF0YS5xdWVyeSwgeyByZWxheGVkOiBmYWxzZSB9KSA6IHVuZGVmaW5lZCxcbiAgICAgICAgICB9KSxcbiAgICB9KVxuXG4gICAgbGV0IHVybCA9IGAke2dhdGVXYXlGdW5jLmdldFVybFByZWZpeChkYXRhKX0vY29sbGVjdGlvbnMvJHtkYXRhLmNvbGxlY3Rpb25OYW1lfS9kb2N1bWVudHM/JHtxdWVyeVBhcmFtc31gXG5cbiAgICAvLyDmn6Xor6LljZXkuKrmlofmoaNcbiAgICBpZiAoaXNRdWVyeURvYykge1xuICAgICAgdXJsID0gYCR7Z2F0ZVdheUZ1bmMuZ2V0VXJsUHJlZml4KGRhdGEpfS9jb2xsZWN0aW9ucy8ke2RhdGEuY29sbGVjdGlvbk5hbWV9L2RvY3VtZW50cy8ke1xuICAgICAgICBkYXRhLnF1ZXJ5Ll9pZD8uJGVxIHx8IGRhdGEucXVlcnkuX2lkXG4gICAgICB9PyR7cXVlcnlQYXJhbXN9YFxuICAgIH1cblxuICAgIGNvbnN0IHJlcyA9IGF3YWl0IHRoaXMuZ2F0ZVdheSh7XG4gICAgICB1cmwsXG4gICAgICBtZXRob2Q6ICdHRVQnLFxuICAgIH0pXG5cbiAgICAvLyDlsJ3or5Xop6PmnpAgRUpTT04g5qC85byP55qE5pWw5o2uXG4gICAgcmVzLmRhdGEgPSBnYXRlV2F5RnVuYy5zYWZlUGFyc2VFSlNPTihKU09OLnN0cmluZ2lmeShyZXMuZGF0YSkpXG5cbiAgICBpZiAoaXNRdWVyeURvYyAmJiAhcmVzLmNvZGUgJiYgIXJlcy5kYXRhPy5jb2RlKSB7XG4gICAgICByZXR1cm4ge1xuICAgICAgICAuLi5yZXMsXG4gICAgICAgIGRhdGE6IHsgbGlzdDogW3Jlcy5kYXRhXSB9XG4gICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIGdhdGVXYXlGdW5jLmZpbHRlclJlcyhyZXMpXG4gIH0sXG5cbiAgJ2RhdGFiYXNlLmFkZERvY3VtZW50JzogYXN5bmMgZnVuY3Rpb24gKGRhdGE6IElEb2N1bWVudHNBZGRSZXEpOiBQcm9taXNlPElDb21tb25SZXM8SUFkZFJlcz4+IHtcbiAgICBsZXQgcmVzID0gYXdhaXQgdGhpcy5nYXRlV2F5KHtcbiAgICAgIHVybDogYCR7Z2F0ZVdheUZ1bmMuZ2V0VXJsUHJlZml4KGRhdGEpfS9jb2xsZWN0aW9ucy8ke2RhdGEuY29sbGVjdGlvbk5hbWV9L2RvY3VtZW50c2AsXG4gICAgICBtZXRob2Q6ICdQT1NUJyxcbiAgICAgIGRhdGE6IHtcbiAgICAgICAgZGF0YTogQXJyYXkuaXNBcnJheShkYXRhLmRhdGEpID8gZGF0YS5kYXRhIDogW2RhdGEuZGF0YV0sXG4gICAgICAgIC4uLihkYXRhLnRyYW5zYWN0aW9uSWQgJiYgeyB0cmFuc2FjdGlvbklkOiBkYXRhLnRyYW5zYWN0aW9uSWQgfSksXG4gICAgICB9LFxuICAgIH0pXG5cbiAgICBpZiAoQXJyYXkuaXNBcnJheShkYXRhLmRhdGEpKSB7XG4gICAgICAvLyDmlbDnu4TmqKHlvI/vvIjmibnph4/mj5LlhaXvvInvvIzov5Tlm54gaWRzIOWIl+ihqFxuICAgICAgcmVzID0ge1xuICAgICAgICAuLi5yZXMsXG4gICAgICAgIGRhdGE6IHtcbiAgICAgICAgICBpZHM6IHJlcy5kYXRhPy5pbnNlcnRlZElkcyB8fCBbXSxcbiAgICAgICAgICAuLi5yZXMuZGF0YSxcbiAgICAgICAgfSxcbiAgICAgIH1cbiAgICB9IGVsc2UgaWYgKHJlcy5kYXRhPy5pbnNlcnRlZElkcz8uWzBdKSB7XG4gICAgICAvLyDpnZ7mlbDnu4TmqKHlvI/vvIjljZXmnaHmj5LlhaXvvInvvIzlsIYgX2lkIOaPkOWNh+WIsOmhtuWxglxuICAgICAgcmVzID0ge1xuICAgICAgICAuLi5yZXMsXG4gICAgICAgIGRhdGE6IHtcbiAgICAgICAgICBfaWQ6IHJlcy5kYXRhLmluc2VydGVkSWRzWzBdLFxuICAgICAgICAgIC4uLnJlcy5kYXRhLFxuICAgICAgICB9LFxuICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiBnYXRlV2F5RnVuYy5maWx0ZXJSZXMocmVzKVxuICB9LFxuXG4gICdkYXRhYmFzZS51cGRhdGVEb2N1bWVudCc6IGFzeW5jIGZ1bmN0aW9uIChcbiAgICBkYXRhOiBJRG9jdW1lbnRzVXBkYXRlUmVxLFxuICApOiBQcm9taXNlPElDb21tb25SZXM8eyBtYXRjaGVkOiBudW1iZXI7IHVwZGF0ZWQ6IG51bWJlcjsgdXBzZXJ0X2lkOiBzdHJpbmcgfT4+IHtcbiAgICBjb25zdCByZXMgPSBhd2FpdCB0aGlzLmdhdGVXYXkoe1xuICAgICAgdXJsOiBgJHtnYXRlV2F5RnVuYy5nZXRVcmxQcmVmaXgoZGF0YSl9L2NvbGxlY3Rpb25zLyR7ZGF0YS5jb2xsZWN0aW9uTmFtZX0vZG9jdW1lbnRzYCxcbiAgICAgIG1ldGhvZDogJ1BBVENIJyxcbiAgICAgIGRhdGE6IHtcbiAgICAgICAgcXVlcnk6IGRhdGEucXVlcnksXG4gICAgICAgIGRhdGE6IGRhdGEuZGF0YSxcbiAgICAgICAgbXVsdGk6ICEhZGF0YS5tdWx0aSxcbiAgICAgICAgdXBzZXJ0OiAhIWRhdGEudXBzZXJ0LFxuICAgICAgICByZXBsYWNlTW9kZTogISFkYXRhLnJlcGxhY2VNb2RlLFxuICAgICAgICAuLi4oZGF0YS50cmFuc2FjdGlvbklkICYmIHsgdHJhbnNhY3Rpb25JZDogZGF0YS50cmFuc2FjdGlvbklkIH0pLFxuICAgICAgfSxcbiAgICB9KVxuXG4gICAgcmV0dXJuIGdhdGVXYXlGdW5jLmZpbHRlclJlcyhyZXMpXG4gIH0sXG5cbiAgJ2RhdGFiYXNlLmRlbGV0ZURvY3VtZW50JzogYXN5bmMgZnVuY3Rpb24gKGRhdGE6IElEb2N1bWVudHNSZW1vdmVSZXEpOiBQcm9taXNlPElDb21tb25SZXM8eyBkZWxldGVkOiBudW1iZXIgfT4+IHtcbiAgICBjb25zdCByZXMgPSBhd2FpdCB0aGlzLmdhdGVXYXkoe1xuICAgICAgdXJsOiBgJHtnYXRlV2F5RnVuYy5nZXRVcmxQcmVmaXgoZGF0YSl9L2NvbGxlY3Rpb25zLyR7ZGF0YS5jb2xsZWN0aW9uTmFtZX0vZG9jdW1lbnRzL3JlbW92ZWAsXG4gICAgICBtZXRob2Q6ICdQT1NUJyxcbiAgICAgIGRhdGE6IHtcbiAgICAgICAgcXVlcnk6IGRhdGEucXVlcnksXG4gICAgICAgIG11bHRpOiAhIWRhdGEubXVsdGksXG4gICAgICAgIC4uLihkYXRhLnRyYW5zYWN0aW9uSWQgJiYgeyB0cmFuc2FjdGlvbklkOiBkYXRhLnRyYW5zYWN0aW9uSWQgfSksXG4gICAgICB9LFxuICAgIH0pXG5cbiAgICByZXR1cm4gZ2F0ZVdheUZ1bmMuZmlsdGVyUmVzKHJlcylcbiAgfSxcblxuICAnZGF0YWJhc2UuY291bnREb2N1bWVudCc6IGFzeW5jIGZ1bmN0aW9uIChkYXRhOiBJRG9jdW1lbnRzQ291bnRSZXEpOiBQcm9taXNlPElDb21tb25SZXM8eyB0b3RhbDogbnVtYmVyIH0+PiB7XG4gICAgY29uc3QgcXVlcnlQYXJhbXMgPSBnYXRlV2F5RnVuYy5idWlsZFF1ZXJ5UGFyYW1zKHtcbiAgICAgIGNvdW50OiB0cnVlLFxuICAgICAgcXVlcnk6IGRhdGEucXVlcnkgPyBFSlNPTi5zdHJpbmdpZnkoZGF0YS5xdWVyeSwgeyByZWxheGVkOiBmYWxzZSB9KSA6IHVuZGVmaW5lZCxcbiAgICB9KVxuXG4gICAgY29uc3QgcmVzID0gYXdhaXQgdGhpcy5nYXRlV2F5KHtcbiAgICAgIHVybDogYCR7Z2F0ZVdheUZ1bmMuZ2V0VXJsUHJlZml4KGRhdGEpfS9jb2xsZWN0aW9ucy8ke2RhdGEuY29sbGVjdGlvbk5hbWV9L2RvY3VtZW50cz8ke3F1ZXJ5UGFyYW1zfWAsXG4gICAgICBtZXRob2Q6ICdHRVQnLFxuICAgIH0pXG5cbiAgICByZXR1cm4gZ2F0ZVdheUZ1bmMuZmlsdGVyUmVzKHJlcylcbiAgfSxcblxuICAnZGF0YWJhc2UuYWRkQ29sbGVjdGlvbic6IGFzeW5jIGZ1bmN0aW9uIChkYXRhOiB7IGNvbGxlY3Rpb25OYW1lOiBzdHJpbmcgfSAmIElEYkNvbmZpZyk6IFByb21pc2U8SUNvbW1vblJlczwnJz4+IHtcbiAgICBjb25zdCByZXMgPSBhd2FpdCB0aGlzLmdhdGVXYXkoe1xuICAgICAgdXJsOiBgJHtnYXRlV2F5RnVuYy5nZXRVcmxQcmVmaXgoZGF0YSl9L2NvbGxlY3Rpb25zYCxcbiAgICAgIG1ldGhvZDogJ1BPU1QnLFxuICAgICAgZGF0YTogeyBjb2xsZWN0aW9uTmFtZTogZGF0YS5jb2xsZWN0aW9uTmFtZSB9LFxuICAgIH0pXG5cbiAgICByZXR1cm4gZ2F0ZVdheUZ1bmMuZmlsdGVyUmVzKHJlcylcbiAgfSxcblxuICAnZGF0YWJhc2UuYWdncmVnYXRlJzogYXN5bmMgZnVuY3Rpb24gKFxuICAgIGRhdGE6IHsgY29sbGVjdGlvbk5hbWU6IHN0cmluZzsgc3RhZ2VzOiB7IHN0YWdlS2V5OiBzdHJpbmc7IHN0YWdlVmFsdWU6IGFueSB9W10gfSAmIElEYkNvbmZpZyxcbiAgKTogUHJvbWlzZTxJQ29tbW9uUmVzPHsgbGlzdDogc3RyaW5nIH0+PiB7XG4gICAgY29uc3QgcGlwZWxpbmUgPSBkYXRhLnN0YWdlcy5tYXAoKHN0YWdlKSA9PiB7XG4gICAgICB0cnkge1xuICAgICAgICAvLyBzdGFnZVZhbHVlIOWPr+iDveaYr+Wtl+espuS4suaIluWvueixoe+8jOe7n+S4gOWkhOeQhlxuICAgICAgICBjb25zdCB2YWx1ZSA9IHR5cGVvZiBzdGFnZS5zdGFnZVZhbHVlID09PSAnc3RyaW5nJyA/IEpTT04ucGFyc2Uoc3RhZ2Uuc3RhZ2VWYWx1ZSkgOiBzdGFnZS5zdGFnZVZhbHVlXG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgW3N0YWdlLnN0YWdlS2V5XTogRUpTT04uc2VyaWFsaXplKHZhbHVlKSxcbiAgICAgICAgfVxuICAgICAgfSBjYXRjaCB7XG4gICAgICAgIHJldHVybiB7IFtzdGFnZS5zdGFnZUtleV06IHN0YWdlLnN0YWdlVmFsdWUgfVxuICAgICAgfVxuICAgIH0pXG5cbiAgICBjb25zdCByZXMgPSBhd2FpdCB0aGlzLmdhdGVXYXkoe1xuICAgICAgdXJsOiBgJHtnYXRlV2F5RnVuYy5nZXRVcmxQcmVmaXgoZGF0YSl9L2NvbGxlY3Rpb25zLyR7ZGF0YS5jb2xsZWN0aW9uTmFtZX0vZG9jdW1lbnRzL2FnZ3JlZ2F0aW9uc2AsXG4gICAgICBtZXRob2Q6ICdQT1NUJyxcbiAgICAgIGRhdGE6IHsgcGlwZWxpbmUgfSxcbiAgICB9KVxuXG4gICAgLy8g5bCG57uT5p6c5YiX6KGo6L2s5Li65a2X56ym5Liy5qC85byP77yI5YW85a655Y6f5pyJ6YC76L6R77yJXG4gICAgaWYgKEFycmF5LmlzQXJyYXkocmVzLmRhdGE/Lmxpc3QpKSB7XG4gICAgICByZXMuZGF0YS5saXN0ID0gSlNPTi5zdHJpbmdpZnkocmVzLmRhdGEubGlzdC5tYXAoKGl0ZW06IGFueSkgPT4gSlNPTi5zdHJpbmdpZnkoaXRlbSkpKVxuICAgIH1cblxuICAgIHJldHVybiBnYXRlV2F5RnVuYy5maWx0ZXJSZXMocmVzKVxuICB9LFxuXG4gICdkYXRhYmFzZS5zdGFydFRyYW5zYWN0aW9uJzogYXN5bmMgZnVuY3Rpb24gKGRhdGE6IElEYkNvbmZpZykge1xuICAgIGNvbnN0IHJlcyA9IGF3YWl0IHRoaXMuZ2F0ZVdheSh7XG4gICAgICB1cmw6IGAke2dhdGVXYXlGdW5jLmdldFVybFByZWZpeChkYXRhKX0vdHJhbnNhY3Rpb25zYCxcbiAgICAgIG1ldGhvZDogJ1BPU1QnLFxuICAgIH0pXG5cbiAgICByZXR1cm4gZ2F0ZVdheUZ1bmMuZmlsdGVyUmVzKGdhdGVXYXlGdW5jLmZsYXR0ZW5SZXNEYXRhKHJlcykpXG4gIH0sXG5cbiAgJ2RhdGFiYXNlLmNvbW1pdFRyYW5zYWN0aW9uJzogYXN5bmMgZnVuY3Rpb24gKGRhdGE6IHsgdHJhbnNhY3Rpb25JZDogc3RyaW5nIH0gJiBJRGJDb25maWcpIHtcbiAgICBjb25zdCByZXMgPSBhd2FpdCB0aGlzLmdhdGVXYXkoe1xuICAgICAgdXJsOiBgJHtnYXRlV2F5RnVuYy5nZXRVcmxQcmVmaXgoZGF0YSl9L3RyYW5zYWN0aW9ucy8ke2RhdGEudHJhbnNhY3Rpb25JZH0vY29tbWl0YCxcbiAgICAgIG1ldGhvZDogJ1BPU1QnLFxuICAgIH0pXG5cbiAgICByZXR1cm4gZ2F0ZVdheUZ1bmMuZmlsdGVyUmVzKHJlcylcbiAgfSxcblxuICAnZGF0YWJhc2UuYWJvcnRUcmFuc2FjdGlvbic6IGFzeW5jIGZ1bmN0aW9uIChkYXRhOiB7IHRyYW5zYWN0aW9uSWQ6IHN0cmluZyB9ICYgSURiQ29uZmlnKSB7XG4gICAgY29uc3QgcmVzID0gYXdhaXQgdGhpcy5nYXRlV2F5KHtcbiAgICAgIHVybDogYCR7Z2F0ZVdheUZ1bmMuZ2V0VXJsUHJlZml4KGRhdGEpfS90cmFuc2FjdGlvbnMvJHtkYXRhLnRyYW5zYWN0aW9uSWR9L3JvbGxiYWNrYCxcbiAgICAgIG1ldGhvZDogJ1BPU1QnLFxuICAgIH0pXG5cbiAgICByZXR1cm4gZ2F0ZVdheUZ1bmMuZmlsdGVyUmVzKHJlcylcbiAgfSxcblxuICAnZGF0YWJhc2UuZ2V0SW5UcmFuc2FjdGlvbic6IGFzeW5jIGZ1bmN0aW9uIChkYXRhOiBJRG9jdW1lbnRzUXVlcnlSZXEpIHtcbiAgICBjb25zdCByZXMgPSBhd2FpdCBnYXRlV2F5RnVuY1snZGF0YWJhc2UucXVlcnlEb2N1bWVudCddLmNhbGwodGhpcywgZGF0YSlcblxuICAgIGlmICh0eXBlb2YgcmVzLmRhdGEgPT09ICdvYmplY3QnICYmIHJlcy5kYXRhICE9PSBudWxsKSB7XG4gICAgICBpZiAocmVzLmRhdGE/LmNvZGUpIHtcbiAgICAgICAgcmV0dXJuIGdhdGVXYXlGdW5jLmZsYXR0ZW5SZXNEYXRhKHJlcylcbiAgICAgIH1cbiAgICAgIHJldHVybiB7IC4uLnJlcywgZGF0YTogSlNPTi5zdHJpbmdpZnkocmVzLmRhdGEpIGFzIGFueSB9XG4gICAgfVxuXG4gICAgcmV0dXJuIHJlc1xuICB9LFxuXG4gICdkYXRhYmFzZS51cGRhdGVEb2NJblRyYW5zYWN0aW9uJzogYXN5bmMgZnVuY3Rpb24gKGRhdGE6IElEb2N1bWVudHNVcGRhdGVSZXEpIHtcbiAgICAvLyDlsJ3or5Xop6PmnpAgRUpTT04g5qC85byP55qE5pWw5o2uXG4gICAgZGF0YS5kYXRhID0gZ2F0ZVdheUZ1bmMuc2FmZVBhcnNlRUpTT04oZGF0YS5kYXRhKVxuXG4gICAgY29uc3QgcmVzID0gYXdhaXQgZ2F0ZVdheUZ1bmNbJ2RhdGFiYXNlLnVwZGF0ZURvY3VtZW50J10uY2FsbCh0aGlzLCBkYXRhKVxuICAgIHJldHVybiBnYXRlV2F5RnVuYy5mbGF0dGVuUmVzRGF0YShyZXMpXG4gIH0sXG5cbiAgJ2RhdGFiYXNlLmRlbGV0ZURvY0luVHJhbnNhY3Rpb24nOiBhc3luYyBmdW5jdGlvbiAoZGF0YTogSURvY3VtZW50c1JlbW92ZVJlcSkge1xuICAgIGNvbnN0IHJlcyA9IGF3YWl0IGdhdGVXYXlGdW5jWydkYXRhYmFzZS5kZWxldGVEb2N1bWVudCddLmNhbGwodGhpcywgZGF0YSlcbiAgICByZXR1cm4gZ2F0ZVdheUZ1bmMuZmxhdHRlblJlc0RhdGEocmVzKVxuICB9LFxuXG4gICdkYXRhYmFzZS5pbnNlcnREb2NJblRyYW5zYWN0aW9uJzogYXN5bmMgZnVuY3Rpb24gKFxuICAgIGRhdGE6IElEb2N1bWVudHNBZGRSZXEsXG4gICk6IFByb21pc2U8SUNvbW1vblJlczxJQWRkUmVzICYgeyBpbnNlcnRlZD86IG51bWJlciB9Pj4ge1xuICAgIC8vIOWwneivleino+aekCBFSlNPTiDmoLzlvI/nmoTmlbDmja5cbiAgICBkYXRhLmRhdGEgPSBnYXRlV2F5RnVuYy5zYWZlUGFyc2VFSlNPTihkYXRhLmRhdGEpXG5cbiAgICBsZXQgcmVzID0gYXdhaXQgZ2F0ZVdheUZ1bmNbJ2RhdGFiYXNlLmFkZERvY3VtZW50J10uY2FsbCh0aGlzLCBkYXRhKVxuXG4gICAgaWYgKHR5cGVvZiByZXMuZGF0YSA9PT0gJ29iamVjdCcgJiYgcmVzLmRhdGEgIT09IG51bGwpIHtcbiAgICAgIGNvbnN0IGhhc0lkID0gISFyZXMuZGF0YT8uX2lkXG4gICAgICByZXMgPSB7XG4gICAgICAgIC4uLnJlcyxcbiAgICAgICAgaW5zZXJ0ZWQ6IGhhc0lkID8gMSA6IDAsXG4gICAgICAgIG9rOiBoYXNJZCA/IDEgOiAwLFxuICAgICAgICAuLi5yZXMuZGF0YSxcbiAgICAgIH0gYXMgYW55XG4gICAgfSBlbHNlIHtcbiAgICAgIHJlcyA9IHsgaW5zZXJ0ZWQ6IDAsIG9rOiAwLCAuLi5yZXMgfSBhcyBhbnlcbiAgICB9XG5cbiAgICBkZWxldGUgcmVzLmRhdGFcblxuICAgIHJldHVybiByZXNcbiAgfSxcblxuICAnZGF0YWJhc2UucnVuQ29tbWFuZHMnOiBhc3luYyBmdW5jdGlvbiAoXG4gICAgZGF0YTogSVJ1bkNvbW1hbmRzUmVxICYgSURiQ29uZmlnLFxuICApOiBQcm9taXNlPElDb21tb25SZXM8eyBsaXN0OiBPYmplY3RbXVtdIH0+PiB7XG4gICAgbGV0IHJlcyA9IGF3YWl0IHRoaXMuZ2F0ZVdheSh7XG4gICAgICB1cmw6IGAke2dhdGVXYXlGdW5jLmdldFVybFByZWZpeChkYXRhKX0vY29tbWFuZHNgLFxuICAgICAgbWV0aG9kOiAnUE9TVCcsXG4gICAgICBkYXRhOiB7XG4gICAgICAgIGNvbW1hbmRzOiBFSlNPTi5zZXJpYWxpemUoZGF0YS5jb21tYW5kcyksXG4gICAgICAgIC4uLihkYXRhLnRyYW5zYWN0aW9uSWQgJiYgeyB0cmFuc2FjdGlvbklkOiBkYXRhLnRyYW5zYWN0aW9uSWQgfSksXG4gICAgICB9LFxuICAgIH0pXG5cbiAgICBpZiAodHlwZW9mIHJlcy5kYXRhID09PSAnb2JqZWN0JyAmJiByZXMuZGF0YSAhPT0gbnVsbCkge1xuICAgICAgcmVzID0geyAuLi5yZXMsIC4uLnJlcy5kYXRhIH1cbiAgICAgIGRlbGV0ZSByZXMuZGF0YVxuICAgICAgZGVsZXRlIHJlcy5yZXF1ZXN0X2lkXG4gICAgfVxuXG4gICAgLy8g5bCd6K+V5bCG57uT5p6c6L2s5o2i5Li65pmu6YCa5a+56LGhXG4gICAgdHJ5IHtcbiAgICAgIHJlcyA9IEVKU09OLmRlc2VyaWFsaXplKHJlcylcbiAgICB9IGNhdGNoIHtcbiAgICAgIC8vIOW/veeVpei9rOaNouWksei0pVxuICAgIH1cblxuICAgIHJldHVybiBnYXRlV2F5RnVuYy5maWx0ZXJSZXMocmVzKVxuICB9LFxufVxuXG5mdW5jdGlvbiBkYXRhYmFzZShkYkNvbmZpZz86IElEYkNvbmZpZykge1xuICBjb25zdCB7IGFkYXB0ZXIsIHJ1bnRpbWUgfSA9IHRoaXMucGxhdGZvcm1cblxuICBjbGFzcyBSZXEgZXh0ZW5kcyB0aGlzLnJlcXVlc3QuY29uc3RydWN0b3Ige1xuICAgIGNvbnN0cnVjdG9yKGNvbmZpZykge1xuICAgICAgc3VwZXIoY29uZmlnKVxuICAgIH1cblxuICAgIGFzeW5jIHNlbmQoYWN0aW9uOiBzdHJpbmcsIGRhdGE6IGFueSkge1xuICAgICAgbGV0IHJlcyA9IG51bGxcblxuICAgICAgaWYgKHRoaXMuY29uZmlnLmVuZFBvaW50TW9kZSA9PT0gJ0dBVEVXQVknICYmIGdhdGVXYXlGdW5jW2FjdGlvbl0pIHtcbiAgICAgICAgcmVzID0gYXdhaXQgZ2F0ZVdheUZ1bmNbYWN0aW9uXS5jYWxsKHRoaXMsIGRhdGEpXG4gICAgICB9IGVsc2Uge1xuICAgICAgICByZXMgPSBhd2FpdCBzdXBlci5zZW5kKGFjdGlvbiwgZGF0YSlcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIHJlc1xuICAgIH1cbiAgfVxuXG4gIERiLnJlcUNsYXNzID0gUmVxXG4gIC8vIOacqueZu+W9leaDheWGteS4i+S8oOWFpeepuuWHveaVsFxuICBEYi5nZXRBY2Nlc3NUb2tlbiA9IHRoaXMuYXV0aEluc3RhbmNlID8gdGhpcy5hdXRoSW5zdGFuY2UuZ2V0QWNjZXNzVG9rZW4uYmluZCh0aGlzLmF1dGhJbnN0YW5jZSkgOiAoKSA9PiAnJ1xuICBEYi5ydW50aW1lID0gcnVudGltZVxuICBpZiAodGhpcy53c0NsaWVudENsYXNzKSB7XG4gICAgRGIud3NDbGFzcyA9IGFkYXB0ZXIud3NDbGFzc1xuICAgIERiLndzQ2xpZW50Q2xhc3MgPSB0aGlzLndzQ2xpZW50Q2xhc3NcbiAgfVxuXG4gIGlmICghRGIud3MpIHtcbiAgICBEYi53cyA9IG51bGxcbiAgfVxuXG4gIGNsYXNzIE5ld0RiIGV4dGVuZHMgRGIge1xuICAgIGNvbnN0cnVjdG9yKGNvbmZpZz86IElEYkNvbmZpZykge1xuICAgICAgc3VwZXIoY29uZmlnKVxuICAgIH1cblxuICAgIGFzeW5jIHJ1bkNvbW1hbmRzKHBhcmFtczogSVJ1bkNvbW1hbmRzUmVxKTogUHJvbWlzZTxJQ29tbW9uUmVzPHsgbGlzdDogT2JqZWN0W11bXSB9Pj4ge1xuICAgICAgbGV0IHJlcXVlc3QgPSBEYi5jcmVhdGVSZXF1ZXN0KHRoaXMuY29uZmlnKVxuXG4gICAgICByZXR1cm4gcmVxdWVzdC5zZW5kKCdkYXRhYmFzZS5ydW5Db21tYW5kcycsIHBhcmFtcylcbiAgICB9XG4gIH1cblxuICByZXR1cm4gbmV3IE5ld0RiKHsgLi4udGhpcy5jb25maWcsIF9mcm9tQXBwOiB0aGlzLCAuLi5kYkNvbmZpZyB9KVxufVxuXG5jb25zdCBjb21wb25lbnQ6IElDbG91ZGJhc2VDb21wb25lbnQgPSB7XG4gIG5hbWU6IENPTVBPTkVOVF9OQU1FLFxuICBlbnRpdHk6IHtcbiAgICBkYXRhYmFzZSxcbiAgfSxcbn1cbnRyeSB7XG4gIGNsb3VkYmFzZS5yZWdpc3RlckNvbXBvbmVudChjb21wb25lbnQpXG59IGNhdGNoIChlKSB7fVxuXG5leHBvcnQgZnVuY3Rpb24gcmVnaXN0ZXJEYXRhYmFzZShhcHA6IElDbG91ZGJhc2UgfCB0eXBlb2YgY2xvdWRiYXNlTlMpIHtcbiAgdHJ5IHtcbiAgICBhcHAucmVnaXN0ZXJDb21wb25lbnQoY29tcG9uZW50KVxuICB9IGNhdGNoIChlKSB7XG4gICAgY29uc29sZS53YXJuKGUpXG4gIH1cbn1cblxudHJ5IHtcbiAgOyh3aW5kb3cgYXMgYW55KS5yZWdpc3RlckRhdGFiYXNlID0gcmVnaXN0ZXJEYXRhYmFzZVxufSBjYXRjaCAoZSkge31cbiJdfQ==
