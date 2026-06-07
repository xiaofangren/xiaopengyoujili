"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerDatabase = void 0;
var database_1 = require("@cloudbase/database");
var bson_1 = require("bson");
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
            return bson_1.EJSON.parse(data);
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
                                query: data.query ? bson_1.EJSON.stringify(data.query, { relaxed: false }) : undefined,
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
                            query: data.query ? bson_1.EJSON.stringify(data.query, { relaxed: false }) : undefined,
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
                                    _a[stage.stageKey] = bson_1.EJSON.serialize(value),
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
                            data: __assign({ commands: bson_1.EJSON.serialize(data.commands) }, (data.transactionId && { transactionId: data.transactionId })),
                        })];
                    case 1:
                        res = _a.sent();
                        if (typeof res.data === 'object' && res.data !== null) {
                            res = __assign(__assign({}, res), res.data);
                            delete res.data;
                            delete res.request_id;
                        }
                        try {
                            res = bson_1.EJSON.deserialize(res);
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
    database_1.Db.reqClass = Req;
    database_1.Db.getAccessToken = this.authInstance ? this.authInstance.getAccessToken.bind(this.authInstance) : function () { return ''; };
    database_1.Db.runtime = runtime;
    if (this.wsClientClass) {
        database_1.Db.wsClass = adapter.wsClass;
        database_1.Db.wsClientClass = this.wsClientClass;
    }
    if (!database_1.Db.ws) {
        database_1.Db.ws = null;
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
                    request = database_1.Db.createRequest(this.config);
                    return [2, request.send('database.runCommands', params)];
                });
            });
        };
        return NewDb;
    }(database_1.Db));
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
function registerDatabase(app) {
    try {
        app.registerComponent(component);
    }
    catch (e) {
        console.warn(e);
    }
}
exports.registerDatabase = registerDatabase;
try {
    ;
    window.registerDatabase = registerDatabase;
}
catch (e) { }

//# sourceMappingURL=data:application/json;charset=utf8;base64,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VDtDQUNGLENBQUE7QUFDRCxJQUFJO0lBQ0YsU0FBUyxDQUFDLGlCQUFpQixDQUFDLFNBQVMsQ0FBQyxDQUFBO0NBQ3ZDO0FBQUMsT0FBTyxDQUFDLEVBQUUsR0FBRTtBQUVkLFNBQWdCLGdCQUFnQixDQUFDLEdBQW9DO0lBQ25FLElBQUk7UUFDRixHQUFHLENBQUMsaUJBQWlCLENBQUMsU0FBUyxDQUFDLENBQUE7S0FDakM7SUFBQyxPQUFPLENBQUMsRUFBRTtRQUNWLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUE7S0FDaEI7QUFDSCxDQUFDO0FBTkQsNENBTUM7QUFFRCxJQUFJO0lBQ0YsQ0FBQztJQUFDLE1BQWMsQ0FBQyxnQkFBZ0IsR0FBRyxnQkFBZ0IsQ0FBQTtDQUNyRDtBQUFDLE9BQU8sQ0FBQyxFQUFFLEdBQUUiLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBEYiB9IGZyb20gJ0BjbG91ZGJhc2UvZGF0YWJhc2UnXG5pbXBvcnQgeyBJQ2xvdWRiYXNlIH0gZnJvbSAnQGNsb3VkYmFzZS90eXBlcydcbmltcG9ydCB7IElDbG91ZGJhc2VDb21wb25lbnQgfSBmcm9tICdAY2xvdWRiYXNlL3R5cGVzL2NvbXBvbmVudCdcbmltcG9ydCBjbG91ZGJhc2VOUyBmcm9tICcuLi8uLi9pbmRleCdcbmltcG9ydCB7IEVKU09OIH0gZnJvbSAnYnNvbidcblxuZGVjbGFyZSBjb25zdCBjbG91ZGJhc2U6IElDbG91ZGJhc2VcbmRlY2xhcmUgdHlwZSBRdWVyeVR5cGUgPSAnV0hFUkUnIHwgJ0RPQydcblxuLyoqXG4gKiDmlbDmja7lupPphY3nva7mjqXlj6NcbiAqL1xuaW50ZXJmYWNlIElEYkNvbmZpZyB7XG4gIC8qKiDlrp7kvosgSUTvvIjlj6/pgInvvIzpu5jorqQgJyhkZWZhdWx0KSfvvIkgKi9cbiAgaW5zdGFuY2U/OiBzdHJpbmdcbiAgLyoqIOaVsOaNruW6k+WQjeensO+8iOWPr+mAie+8jOm7mOiupCAnKGRlZmF1bHQpJ++8iSAqL1xuICBkYXRhYmFzZT86IHN0cmluZ1xufVxuXG5pbnRlcmZhY2UgSUJhc2VSZXEgZXh0ZW5kcyBJRGJDb25maWcge1xuICBjb2xsZWN0aW9uTmFtZTogc3RyaW5nXG4gIHRyYW5zYWN0aW9uSWQ/OiBzdHJpbmdcbn1cblxuaW50ZXJmYWNlIElEb2N1bWVudHNRdWVyeVJlcSBleHRlbmRzIElCYXNlUmVxIHtcbiAgcXVlcnk/OiBhbnlcbiAgLyoqIEBkZXByZWNhdGVkIOS9v+eUqCBxdWVyeSDmm7/ku6MgKi9cbiAgcXVlcnlUeXBlPzogUXVlcnlUeXBlXG4gIG9yZGVyPzogc3RyaW5nW11cbiAgb2Zmc2V0PzogbnVtYmVyXG4gIGxpbWl0PzogbnVtYmVyXG4gIHByb2plY3Rpb24/OiBPYmplY3Rcbn1cblxuaW50ZXJmYWNlIElEb2N1bWVudHNBZGRSZXEgZXh0ZW5kcyBJQmFzZVJlcSB7XG4gIGRhdGE6IE9iamVjdCB8IE9iamVjdFtdXG59XG5cbmludGVyZmFjZSBJRG9jdW1lbnRzVXBkYXRlUmVxIGV4dGVuZHMgSUJhc2VSZXEge1xuICBxdWVyeTogT2JqZWN0XG4gIGRhdGE6IE9iamVjdFxuICAvKiog5piv5ZCm5om56YeP5pu05paw77yI6buY6K6kIGZhbHNl77yJICovXG4gIG11bHRpPzogYm9vbGVhblxuICAvKiog5oqK5omA5pyJ5pu05paw5pWw5o2u6L2s5Li65bim5pON5L2c56ym55qEICovXG4gIG1lcmdlPzogYm9vbGVhblxuICAvKiog5LiN5a2Y5Zyo5pe25piv5ZCm5Yib5bu677yI6buY6K6kIGZhbHNl77yJICovXG4gIHVwc2VydD86IGJvb2xlYW5cbiAgLyoqIOaYr+WQpuabv+aNouaVtOS4quaWh+aho++8iOm7mOiupCBmYWxzZe+8jOS4uiB0cnVlIOaXtuabv+aNouaVtOS4quaWh+aho+iAjOmdnuWQiOW5tuabtOaWsO+8iSAqL1xuICByZXBsYWNlTW9kZT86IGJvb2xlYW5cbiAgLyoqIEBkZXByZWNhdGVkIOS9v+eUqCBxdWVyeSDmm7/ku6MgKi9cbiAgcXVlcnlUeXBlPzogUXVlcnlUeXBlXG59XG5cbmludGVyZmFjZSBJRG9jdW1lbnRzUmVtb3ZlUmVxIGV4dGVuZHMgSUJhc2VSZXEge1xuICBxdWVyeTogT2JqZWN0XG4gIC8qKiDmmK/lkKbmibnph4/liKDpmaTvvIjpu5jorqQgZmFsc2XvvIkgKi9cbiAgbXVsdGk/OiBib29sZWFuXG4gIC8qKiBAZGVwcmVjYXRlZCDkvb/nlKggcXVlcnkg5pu/5LujICovXG4gIHF1ZXJ5VHlwZT86IFF1ZXJ5VHlwZVxufVxuXG5pbnRlcmZhY2UgSURvY3VtZW50c0NvdW50UmVxIGV4dGVuZHMgSUJhc2VSZXEge1xuICBxdWVyeTogT2JqZWN0XG4gIC8qKiBAZGVwcmVjYXRlZCDkvb/nlKggcXVlcnkg5pu/5LujICovXG4gIHF1ZXJ5VHlwZT86IFF1ZXJ5VHlwZVxufVxuXG5pbnRlcmZhY2UgSUNvbW1vblJlczxUPiB7XG4gIGRhdGE/OiBUICYgeyBjb2RlPzogc3RyaW5nIH1cbiAgcmVxdWVzdElkOiBzdHJpbmdcbiAgY29kZT86IHN0cmluZ1xuICBtZXNzYWdlPzogc3RyaW5nXG59XG5cbmludGVyZmFjZSBJQWRkUmVzIHtcbiAgLyoqIOWNleadoeaPkuWFpeaXtui/lOWbnueahOaWh+ahoyBJRO+8iOaJuemHj+aPkuWFpeaXtuS4jei/lOWbnu+8iSAqL1xuICBfaWQ/OiBzdHJpbmdcbiAgLyoqIOaJuemHj+aPkuWFpeaXtui/lOWbnueahOaWh+ahoyBJRCDliJfooaggKi9cbiAgaWRzPzogc3RyaW5nW11cbiAgaW5zZXJ0ZWRJZHM6IHN0cmluZ1tdXG59XG5cbmludGVyZmFjZSBJUnVuQ29tbWFuZHNSZXEge1xuICB0cmFuc2FjdGlvbklkPzogc3RyaW5nXG4gIC8qKiDlkb3ku6TmlbDnu4TvvIzmlrnms5XkvJrlsIblhbbovazkuLogTW9uZ29EQiDljp/nlJ/lkb3ku6TvvIhFSlNPTiDlr7nosaHmoLzlvI/vvIkgKi9cbiAgY29tbWFuZHM6IE9iamVjdFtdXG59XG5cbmNvbnN0IENPTVBPTkVOVF9OQU1FID0gJ2RhdGFiYXNlJ1xuXG5jb25zdCBnYXRlV2F5RnVuYyA9IHtcbiAgLyoqXG4gICAqIOi/h+a7pOWTjeW6lO+8jOenu+mZpOS4jeW/heimgeeahOWtl+autVxuICAgKi9cbiAgZmlsdGVyUmVzOiBmdW5jdGlvbiA8VD4ocmVzOiBJQ29tbW9uUmVzPFQ+ICYgeyBoZWFkZXI/OiBhbnk7IHN0YXR1c0NvZGU/OiBudW1iZXIgfSk6IElDb21tb25SZXM8VD4ge1xuICAgIGRlbGV0ZSByZXMuaGVhZGVyXG4gICAgZGVsZXRlIHJlcy5zdGF0dXNDb2RlXG4gICAgcmV0dXJuIHJlc1xuICB9LFxuXG4gIC8qKlxuICAgKiDlsZXlvIDlk43lupTmlbDmja7liLDpobblsYLvvIjnlKjkuo7kuovliqHnrYnlnLrmma/vvIlcbiAgICovXG4gIGZsYXR0ZW5SZXNEYXRhOiBmdW5jdGlvbiA8VD4ocmVzOiBJQ29tbW9uUmVzPFQ+KTogYW55IHtcbiAgICBpZiAodHlwZW9mIHJlcy5kYXRhID09PSAnb2JqZWN0JyAmJiByZXMuZGF0YSAhPT0gbnVsbCkge1xuICAgICAgY29uc3QgcmVzdWx0ID0geyAuLi5yZXMsIC4uLnJlcy5kYXRhIH1cbiAgICAgIGRlbGV0ZSByZXN1bHQuZGF0YVxuICAgICAgcmV0dXJuIHJlc3VsdFxuICAgIH1cbiAgICByZXR1cm4gcmVzXG4gIH0sXG5cbiAgLyoqXG4gICAqIOWuieWFqOino+aekCBFSlNPTlxuICAgKi9cbiAgc2FmZVBhcnNlRUpTT046IGZ1bmN0aW9uIChkYXRhOiBhbnkpOiBhbnkge1xuICAgIGlmICh0eXBlb2YgZGF0YSAhPT0gJ3N0cmluZycpIHJldHVybiBkYXRhXG4gICAgdHJ5IHtcbiAgICAgIHJldHVybiBFSlNPTi5wYXJzZShkYXRhKVxuICAgIH0gY2F0Y2gge1xuICAgICAgcmV0dXJuIGRhdGFcbiAgICB9XG4gIH0sXG5cbiAgLyoqXG4gICAqIOaehOW7uiBVUkwg5p+l6K+i5Y+C5pWwXG4gICAqL1xuICBidWlsZFF1ZXJ5UGFyYW1zOiBmdW5jdGlvbiAocGFyYW1zOiBSZWNvcmQ8c3RyaW5nLCBhbnk+KTogc3RyaW5nIHtcbiAgICByZXR1cm4gT2JqZWN0LmVudHJpZXMocGFyYW1zKVxuICAgICAgLmZpbHRlcigoW18sIHZhbHVlXSkgPT4gdmFsdWUgIT09IHVuZGVmaW5lZCAmJiB2YWx1ZSAhPT0gbnVsbCAmJiB2YWx1ZSAhPT0gJycpXG4gICAgICAubWFwKChba2V5LCB2YWx1ZV0pID0+IHtcbiAgICAgICAgY29uc3Qgc3RyaW5nVmFsdWUgPSB0eXBlb2YgdmFsdWUgPT09ICdvYmplY3QnID8gSlNPTi5zdHJpbmdpZnkodmFsdWUpIDogU3RyaW5nKHZhbHVlKVxuICAgICAgICByZXR1cm4gYCR7ZW5jb2RlVVJJQ29tcG9uZW50KGtleSl9PSR7ZW5jb2RlVVJJQ29tcG9uZW50KHN0cmluZ1ZhbHVlKX1gXG4gICAgICB9KVxuICAgICAgLmpvaW4oJyYnKVxuICB9LFxuXG4gIC8qKlxuICAgKiDojrflj5YgVVJMIOWJjee8gFxuICAgKi9cbiAgZ2V0VXJsUHJlZml4OiBmdW5jdGlvbiAoZGF0YTogSURiQ29uZmlnKTogc3RyaW5nIHtcbiAgICBjb25zdCBpbnN0YW5jZSA9IGRhdGE/Lmluc3RhbmNlIHx8ICcoZGVmYXVsdCknXG4gICAgY29uc3QgZGF0YWJhc2UgPSBkYXRhPy5kYXRhYmFzZSB8fCAnKGRlZmF1bHQpJ1xuICAgIHJldHVybiBgL2RhdGFiYXNlL2luc3RhbmNlcy8ke2luc3RhbmNlfS9kYXRhYmFzZXMvJHtkYXRhYmFzZX1gXG4gIH0sXG5cbiAgJ2RhdGFiYXNlLnF1ZXJ5RG9jdW1lbnQnOiBhc3luYyBmdW5jdGlvbiAoXG4gICAgZGF0YTogSURvY3VtZW50c1F1ZXJ5UmVxLFxuICApOiBQcm9taXNlPElDb21tb25SZXM8eyBvZmZzZXQ/OiBudW1iZXI7IGxpbWl0PzogbnVtYmVyOyBsaXN0OiBhbnlbXSB9Pj4ge1xuICAgIGNvbnN0IGlzUXVlcnlEb2MgPSAhIWRhdGEucXVlcnk/Ll9pZFxuICAgIGNvbnN0IHF1ZXJ5UGFyYW1zID0gZ2F0ZVdheUZ1bmMuYnVpbGRRdWVyeVBhcmFtcyh7XG4gICAgICBwcm9qZWN0aW9uOiBkYXRhLnByb2plY3Rpb24sXG4gICAgICB0cmFuc2FjdGlvbklkOiBkYXRhLnRyYW5zYWN0aW9uSWQsXG4gICAgICAuLi4oaXNRdWVyeURvY1xuICAgICAgICA/IHt9XG4gICAgICAgIDoge1xuICAgICAgICAgICAgb2Zmc2V0OiBkYXRhLm9mZnNldCA/PyAwLFxuICAgICAgICAgICAgbGltaXQ6IGRhdGEubGltaXQgPz8gMTAwLFxuICAgICAgICAgICAgb3JkZXI6IGRhdGEub3JkZXIsXG4gICAgICAgICAgICBxdWVyeTogZGF0YS5xdWVyeSA/IEVKU09OLnN0cmluZ2lmeShkYXRhLnF1ZXJ5LCB7IHJlbGF4ZWQ6IGZhbHNlIH0pIDogdW5kZWZpbmVkLFxuICAgICAgICAgIH0pLFxuICAgIH0pXG5cbiAgICBsZXQgdXJsID0gYCR7Z2F0ZVdheUZ1bmMuZ2V0VXJsUHJlZml4KGRhdGEpfS9jb2xsZWN0aW9ucy8ke2RhdGEuY29sbGVjdGlvbk5hbWV9L2RvY3VtZW50cz8ke3F1ZXJ5UGFyYW1zfWBcblxuICAgIC8vIOafpeivouWNleS4quaWh+aho1xuICAgIGlmIChpc1F1ZXJ5RG9jKSB7XG4gICAgICB1cmwgPSBgJHtnYXRlV2F5RnVuYy5nZXRVcmxQcmVmaXgoZGF0YSl9L2NvbGxlY3Rpb25zLyR7ZGF0YS5jb2xsZWN0aW9uTmFtZX0vZG9jdW1lbnRzLyR7XG4gICAgICAgIGRhdGEucXVlcnkuX2lkPy4kZXEgfHwgZGF0YS5xdWVyeS5faWRcbiAgICAgIH0/JHtxdWVyeVBhcmFtc31gXG4gICAgfVxuXG4gICAgY29uc3QgcmVzID0gYXdhaXQgdGhpcy5nYXRlV2F5KHtcbiAgICAgIHVybCxcbiAgICAgIG1ldGhvZDogJ0dFVCcsXG4gICAgfSlcblxuICAgIC8vIOWwneivleino+aekCBFSlNPTiDmoLzlvI/nmoTmlbDmja5cbiAgICByZXMuZGF0YSA9IGdhdGVXYXlGdW5jLnNhZmVQYXJzZUVKU09OKEpTT04uc3RyaW5naWZ5KHJlcy5kYXRhKSlcblxuICAgIGlmIChpc1F1ZXJ5RG9jICYmICFyZXMuY29kZSAmJiAhcmVzLmRhdGE/LmNvZGUpIHtcbiAgICAgIHJldHVybiB7XG4gICAgICAgIC4uLnJlcyxcbiAgICAgICAgZGF0YTogeyBsaXN0OiBbcmVzLmRhdGFdIH1cbiAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gZ2F0ZVdheUZ1bmMuZmlsdGVyUmVzKHJlcylcbiAgfSxcblxuICAnZGF0YWJhc2UuYWRkRG9jdW1lbnQnOiBhc3luYyBmdW5jdGlvbiAoZGF0YTogSURvY3VtZW50c0FkZFJlcSk6IFByb21pc2U8SUNvbW1vblJlczxJQWRkUmVzPj4ge1xuICAgIGxldCByZXMgPSBhd2FpdCB0aGlzLmdhdGVXYXkoe1xuICAgICAgdXJsOiBgJHtnYXRlV2F5RnVuYy5nZXRVcmxQcmVmaXgoZGF0YSl9L2NvbGxlY3Rpb25zLyR7ZGF0YS5jb2xsZWN0aW9uTmFtZX0vZG9jdW1lbnRzYCxcbiAgICAgIG1ldGhvZDogJ1BPU1QnLFxuICAgICAgZGF0YToge1xuICAgICAgICBkYXRhOiBBcnJheS5pc0FycmF5KGRhdGEuZGF0YSkgPyBkYXRhLmRhdGEgOiBbZGF0YS5kYXRhXSxcbiAgICAgICAgLi4uKGRhdGEudHJhbnNhY3Rpb25JZCAmJiB7IHRyYW5zYWN0aW9uSWQ6IGRhdGEudHJhbnNhY3Rpb25JZCB9KSxcbiAgICAgIH0sXG4gICAgfSlcblxuICAgIGlmIChBcnJheS5pc0FycmF5KGRhdGEuZGF0YSkpIHtcbiAgICAgIC8vIOaVsOe7hOaooeW8j++8iOaJuemHj+aPkuWFpe+8ie+8jOi/lOWbniBpZHMg5YiX6KGoXG4gICAgICByZXMgPSB7XG4gICAgICAgIC4uLnJlcyxcbiAgICAgICAgZGF0YToge1xuICAgICAgICAgIGlkczogcmVzLmRhdGE/Lmluc2VydGVkSWRzIHx8IFtdLFxuICAgICAgICAgIC4uLnJlcy5kYXRhLFxuICAgICAgICB9LFxuICAgICAgfVxuICAgIH0gZWxzZSBpZiAocmVzLmRhdGE/Lmluc2VydGVkSWRzPy5bMF0pIHtcbiAgICAgIC8vIOmdnuaVsOe7hOaooeW8j++8iOWNleadoeaPkuWFpe+8ie+8jOWwhiBfaWQg5o+Q5Y2H5Yiw6aG25bGCXG4gICAgICByZXMgPSB7XG4gICAgICAgIC4uLnJlcyxcbiAgICAgICAgZGF0YToge1xuICAgICAgICAgIF9pZDogcmVzLmRhdGEuaW5zZXJ0ZWRJZHNbMF0sXG4gICAgICAgICAgLi4ucmVzLmRhdGEsXG4gICAgICAgIH0sXG4gICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIGdhdGVXYXlGdW5jLmZpbHRlclJlcyhyZXMpXG4gIH0sXG5cbiAgJ2RhdGFiYXNlLnVwZGF0ZURvY3VtZW50JzogYXN5bmMgZnVuY3Rpb24gKFxuICAgIGRhdGE6IElEb2N1bWVudHNVcGRhdGVSZXEsXG4gICk6IFByb21pc2U8SUNvbW1vblJlczx7IG1hdGNoZWQ6IG51bWJlcjsgdXBkYXRlZDogbnVtYmVyOyB1cHNlcnRfaWQ6IHN0cmluZyB9Pj4ge1xuICAgIGNvbnN0IHJlcyA9IGF3YWl0IHRoaXMuZ2F0ZVdheSh7XG4gICAgICB1cmw6IGAke2dhdGVXYXlGdW5jLmdldFVybFByZWZpeChkYXRhKX0vY29sbGVjdGlvbnMvJHtkYXRhLmNvbGxlY3Rpb25OYW1lfS9kb2N1bWVudHNgLFxuICAgICAgbWV0aG9kOiAnUEFUQ0gnLFxuICAgICAgZGF0YToge1xuICAgICAgICBxdWVyeTogZGF0YS5xdWVyeSxcbiAgICAgICAgZGF0YTogZGF0YS5kYXRhLFxuICAgICAgICBtdWx0aTogISFkYXRhLm11bHRpLFxuICAgICAgICB1cHNlcnQ6ICEhZGF0YS51cHNlcnQsXG4gICAgICAgIHJlcGxhY2VNb2RlOiAhIWRhdGEucmVwbGFjZU1vZGUsXG4gICAgICAgIC4uLihkYXRhLnRyYW5zYWN0aW9uSWQgJiYgeyB0cmFuc2FjdGlvbklkOiBkYXRhLnRyYW5zYWN0aW9uSWQgfSksXG4gICAgICB9LFxuICAgIH0pXG5cbiAgICByZXR1cm4gZ2F0ZVdheUZ1bmMuZmlsdGVyUmVzKHJlcylcbiAgfSxcblxuICAnZGF0YWJhc2UuZGVsZXRlRG9jdW1lbnQnOiBhc3luYyBmdW5jdGlvbiAoZGF0YTogSURvY3VtZW50c1JlbW92ZVJlcSk6IFByb21pc2U8SUNvbW1vblJlczx7IGRlbGV0ZWQ6IG51bWJlciB9Pj4ge1xuICAgIGNvbnN0IHJlcyA9IGF3YWl0IHRoaXMuZ2F0ZVdheSh7XG4gICAgICB1cmw6IGAke2dhdGVXYXlGdW5jLmdldFVybFByZWZpeChkYXRhKX0vY29sbGVjdGlvbnMvJHtkYXRhLmNvbGxlY3Rpb25OYW1lfS9kb2N1bWVudHMvcmVtb3ZlYCxcbiAgICAgIG1ldGhvZDogJ1BPU1QnLFxuICAgICAgZGF0YToge1xuICAgICAgICBxdWVyeTogZGF0YS5xdWVyeSxcbiAgICAgICAgbXVsdGk6ICEhZGF0YS5tdWx0aSxcbiAgICAgICAgLi4uKGRhdGEudHJhbnNhY3Rpb25JZCAmJiB7IHRyYW5zYWN0aW9uSWQ6IGRhdGEudHJhbnNhY3Rpb25JZCB9KSxcbiAgICAgIH0sXG4gICAgfSlcblxuICAgIHJldHVybiBnYXRlV2F5RnVuYy5maWx0ZXJSZXMocmVzKVxuICB9LFxuXG4gICdkYXRhYmFzZS5jb3VudERvY3VtZW50JzogYXN5bmMgZnVuY3Rpb24gKGRhdGE6IElEb2N1bWVudHNDb3VudFJlcSk6IFByb21pc2U8SUNvbW1vblJlczx7IHRvdGFsOiBudW1iZXIgfT4+IHtcbiAgICBjb25zdCBxdWVyeVBhcmFtcyA9IGdhdGVXYXlGdW5jLmJ1aWxkUXVlcnlQYXJhbXMoe1xuICAgICAgY291bnQ6IHRydWUsXG4gICAgICBxdWVyeTogZGF0YS5xdWVyeSA/IEVKU09OLnN0cmluZ2lmeShkYXRhLnF1ZXJ5LCB7IHJlbGF4ZWQ6IGZhbHNlIH0pIDogdW5kZWZpbmVkLFxuICAgIH0pXG5cbiAgICBjb25zdCByZXMgPSBhd2FpdCB0aGlzLmdhdGVXYXkoe1xuICAgICAgdXJsOiBgJHtnYXRlV2F5RnVuYy5nZXRVcmxQcmVmaXgoZGF0YSl9L2NvbGxlY3Rpb25zLyR7ZGF0YS5jb2xsZWN0aW9uTmFtZX0vZG9jdW1lbnRzPyR7cXVlcnlQYXJhbXN9YCxcbiAgICAgIG1ldGhvZDogJ0dFVCcsXG4gICAgfSlcblxuICAgIHJldHVybiBnYXRlV2F5RnVuYy5maWx0ZXJSZXMocmVzKVxuICB9LFxuXG4gICdkYXRhYmFzZS5hZGRDb2xsZWN0aW9uJzogYXN5bmMgZnVuY3Rpb24gKGRhdGE6IHsgY29sbGVjdGlvbk5hbWU6IHN0cmluZyB9ICYgSURiQ29uZmlnKTogUHJvbWlzZTxJQ29tbW9uUmVzPCcnPj4ge1xuICAgIGNvbnN0IHJlcyA9IGF3YWl0IHRoaXMuZ2F0ZVdheSh7XG4gICAgICB1cmw6IGAke2dhdGVXYXlGdW5jLmdldFVybFByZWZpeChkYXRhKX0vY29sbGVjdGlvbnNgLFxuICAgICAgbWV0aG9kOiAnUE9TVCcsXG4gICAgICBkYXRhOiB7IGNvbGxlY3Rpb25OYW1lOiBkYXRhLmNvbGxlY3Rpb25OYW1lIH0sXG4gICAgfSlcblxuICAgIHJldHVybiBnYXRlV2F5RnVuYy5maWx0ZXJSZXMocmVzKVxuICB9LFxuXG4gICdkYXRhYmFzZS5hZ2dyZWdhdGUnOiBhc3luYyBmdW5jdGlvbiAoXG4gICAgZGF0YTogeyBjb2xsZWN0aW9uTmFtZTogc3RyaW5nOyBzdGFnZXM6IHsgc3RhZ2VLZXk6IHN0cmluZzsgc3RhZ2VWYWx1ZTogYW55IH1bXSB9ICYgSURiQ29uZmlnLFxuICApOiBQcm9taXNlPElDb21tb25SZXM8eyBsaXN0OiBzdHJpbmcgfT4+IHtcbiAgICBjb25zdCBwaXBlbGluZSA9IGRhdGEuc3RhZ2VzLm1hcCgoc3RhZ2UpID0+IHtcbiAgICAgIHRyeSB7XG4gICAgICAgIC8vIHN0YWdlVmFsdWUg5Y+v6IO95piv5a2X56ym5Liy5oiW5a+56LGh77yM57uf5LiA5aSE55CGXG4gICAgICAgIGNvbnN0IHZhbHVlID0gdHlwZW9mIHN0YWdlLnN0YWdlVmFsdWUgPT09ICdzdHJpbmcnID8gSlNPTi5wYXJzZShzdGFnZS5zdGFnZVZhbHVlKSA6IHN0YWdlLnN0YWdlVmFsdWVcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICBbc3RhZ2Uuc3RhZ2VLZXldOiBFSlNPTi5zZXJpYWxpemUodmFsdWUpLFxuICAgICAgICB9XG4gICAgICB9IGNhdGNoIHtcbiAgICAgICAgcmV0dXJuIHsgW3N0YWdlLnN0YWdlS2V5XTogc3RhZ2Uuc3RhZ2VWYWx1ZSB9XG4gICAgICB9XG4gICAgfSlcblxuICAgIGNvbnN0IHJlcyA9IGF3YWl0IHRoaXMuZ2F0ZVdheSh7XG4gICAgICB1cmw6IGAke2dhdGVXYXlGdW5jLmdldFVybFByZWZpeChkYXRhKX0vY29sbGVjdGlvbnMvJHtkYXRhLmNvbGxlY3Rpb25OYW1lfS9kb2N1bWVudHMvYWdncmVnYXRpb25zYCxcbiAgICAgIG1ldGhvZDogJ1BPU1QnLFxuICAgICAgZGF0YTogeyBwaXBlbGluZSB9LFxuICAgIH0pXG5cbiAgICAvLyDlsIbnu5PmnpzliJfooajovazkuLrlrZfnrKbkuLLmoLzlvI/vvIjlhbzlrrnljp/mnInpgLvovpHvvIlcbiAgICBpZiAoQXJyYXkuaXNBcnJheShyZXMuZGF0YT8ubGlzdCkpIHtcbiAgICAgIHJlcy5kYXRhLmxpc3QgPSBKU09OLnN0cmluZ2lmeShyZXMuZGF0YS5saXN0Lm1hcCgoaXRlbTogYW55KSA9PiBKU09OLnN0cmluZ2lmeShpdGVtKSkpXG4gICAgfVxuXG4gICAgcmV0dXJuIGdhdGVXYXlGdW5jLmZpbHRlclJlcyhyZXMpXG4gIH0sXG5cbiAgJ2RhdGFiYXNlLnN0YXJ0VHJhbnNhY3Rpb24nOiBhc3luYyBmdW5jdGlvbiAoZGF0YTogSURiQ29uZmlnKSB7XG4gICAgY29uc3QgcmVzID0gYXdhaXQgdGhpcy5nYXRlV2F5KHtcbiAgICAgIHVybDogYCR7Z2F0ZVdheUZ1bmMuZ2V0VXJsUHJlZml4KGRhdGEpfS90cmFuc2FjdGlvbnNgLFxuICAgICAgbWV0aG9kOiAnUE9TVCcsXG4gICAgfSlcblxuICAgIHJldHVybiBnYXRlV2F5RnVuYy5maWx0ZXJSZXMoZ2F0ZVdheUZ1bmMuZmxhdHRlblJlc0RhdGEocmVzKSlcbiAgfSxcblxuICAnZGF0YWJhc2UuY29tbWl0VHJhbnNhY3Rpb24nOiBhc3luYyBmdW5jdGlvbiAoZGF0YTogeyB0cmFuc2FjdGlvbklkOiBzdHJpbmcgfSAmIElEYkNvbmZpZykge1xuICAgIGNvbnN0IHJlcyA9IGF3YWl0IHRoaXMuZ2F0ZVdheSh7XG4gICAgICB1cmw6IGAke2dhdGVXYXlGdW5jLmdldFVybFByZWZpeChkYXRhKX0vdHJhbnNhY3Rpb25zLyR7ZGF0YS50cmFuc2FjdGlvbklkfS9jb21taXRgLFxuICAgICAgbWV0aG9kOiAnUE9TVCcsXG4gICAgfSlcblxuICAgIHJldHVybiBnYXRlV2F5RnVuYy5maWx0ZXJSZXMocmVzKVxuICB9LFxuXG4gICdkYXRhYmFzZS5hYm9ydFRyYW5zYWN0aW9uJzogYXN5bmMgZnVuY3Rpb24gKGRhdGE6IHsgdHJhbnNhY3Rpb25JZDogc3RyaW5nIH0gJiBJRGJDb25maWcpIHtcbiAgICBjb25zdCByZXMgPSBhd2FpdCB0aGlzLmdhdGVXYXkoe1xuICAgICAgdXJsOiBgJHtnYXRlV2F5RnVuYy5nZXRVcmxQcmVmaXgoZGF0YSl9L3RyYW5zYWN0aW9ucy8ke2RhdGEudHJhbnNhY3Rpb25JZH0vcm9sbGJhY2tgLFxuICAgICAgbWV0aG9kOiAnUE9TVCcsXG4gICAgfSlcblxuICAgIHJldHVybiBnYXRlV2F5RnVuYy5maWx0ZXJSZXMocmVzKVxuICB9LFxuXG4gICdkYXRhYmFzZS5nZXRJblRyYW5zYWN0aW9uJzogYXN5bmMgZnVuY3Rpb24gKGRhdGE6IElEb2N1bWVudHNRdWVyeVJlcSkge1xuICAgIGNvbnN0IHJlcyA9IGF3YWl0IGdhdGVXYXlGdW5jWydkYXRhYmFzZS5xdWVyeURvY3VtZW50J10uY2FsbCh0aGlzLCBkYXRhKVxuXG4gICAgaWYgKHR5cGVvZiByZXMuZGF0YSA9PT0gJ29iamVjdCcgJiYgcmVzLmRhdGEgIT09IG51bGwpIHtcbiAgICAgIGlmIChyZXMuZGF0YT8uY29kZSkge1xuICAgICAgICByZXR1cm4gZ2F0ZVdheUZ1bmMuZmxhdHRlblJlc0RhdGEocmVzKVxuICAgICAgfVxuICAgICAgcmV0dXJuIHsgLi4ucmVzLCBkYXRhOiBKU09OLnN0cmluZ2lmeShyZXMuZGF0YSkgYXMgYW55IH1cbiAgICB9XG5cbiAgICByZXR1cm4gcmVzXG4gIH0sXG5cbiAgJ2RhdGFiYXNlLnVwZGF0ZURvY0luVHJhbnNhY3Rpb24nOiBhc3luYyBmdW5jdGlvbiAoZGF0YTogSURvY3VtZW50c1VwZGF0ZVJlcSkge1xuICAgIC8vIOWwneivleino+aekCBFSlNPTiDmoLzlvI/nmoTmlbDmja5cbiAgICBkYXRhLmRhdGEgPSBnYXRlV2F5RnVuYy5zYWZlUGFyc2VFSlNPTihkYXRhLmRhdGEpXG5cbiAgICBjb25zdCByZXMgPSBhd2FpdCBnYXRlV2F5RnVuY1snZGF0YWJhc2UudXBkYXRlRG9jdW1lbnQnXS5jYWxsKHRoaXMsIGRhdGEpXG4gICAgcmV0dXJuIGdhdGVXYXlGdW5jLmZsYXR0ZW5SZXNEYXRhKHJlcylcbiAgfSxcblxuICAnZGF0YWJhc2UuZGVsZXRlRG9jSW5UcmFuc2FjdGlvbic6IGFzeW5jIGZ1bmN0aW9uIChkYXRhOiBJRG9jdW1lbnRzUmVtb3ZlUmVxKSB7XG4gICAgY29uc3QgcmVzID0gYXdhaXQgZ2F0ZVdheUZ1bmNbJ2RhdGFiYXNlLmRlbGV0ZURvY3VtZW50J10uY2FsbCh0aGlzLCBkYXRhKVxuICAgIHJldHVybiBnYXRlV2F5RnVuYy5mbGF0dGVuUmVzRGF0YShyZXMpXG4gIH0sXG5cbiAgJ2RhdGFiYXNlLmluc2VydERvY0luVHJhbnNhY3Rpb24nOiBhc3luYyBmdW5jdGlvbiAoXG4gICAgZGF0YTogSURvY3VtZW50c0FkZFJlcSxcbiAgKTogUHJvbWlzZTxJQ29tbW9uUmVzPElBZGRSZXMgJiB7IGluc2VydGVkPzogbnVtYmVyIH0+PiB7XG4gICAgLy8g5bCd6K+V6Kej5p6QIEVKU09OIOagvOW8j+eahOaVsOaNrlxuICAgIGRhdGEuZGF0YSA9IGdhdGVXYXlGdW5jLnNhZmVQYXJzZUVKU09OKGRhdGEuZGF0YSlcblxuICAgIGxldCByZXMgPSBhd2FpdCBnYXRlV2F5RnVuY1snZGF0YWJhc2UuYWRkRG9jdW1lbnQnXS5jYWxsKHRoaXMsIGRhdGEpXG5cbiAgICBpZiAodHlwZW9mIHJlcy5kYXRhID09PSAnb2JqZWN0JyAmJiByZXMuZGF0YSAhPT0gbnVsbCkge1xuICAgICAgY29uc3QgaGFzSWQgPSAhIXJlcy5kYXRhPy5faWRcbiAgICAgIHJlcyA9IHtcbiAgICAgICAgLi4ucmVzLFxuICAgICAgICBpbnNlcnRlZDogaGFzSWQgPyAxIDogMCxcbiAgICAgICAgb2s6IGhhc0lkID8gMSA6IDAsXG4gICAgICAgIC4uLnJlcy5kYXRhLFxuICAgICAgfSBhcyBhbnlcbiAgICB9IGVsc2Uge1xuICAgICAgcmVzID0geyBpbnNlcnRlZDogMCwgb2s6IDAsIC4uLnJlcyB9IGFzIGFueVxuICAgIH1cblxuICAgIGRlbGV0ZSByZXMuZGF0YVxuXG4gICAgcmV0dXJuIHJlc1xuICB9LFxuXG4gICdkYXRhYmFzZS5ydW5Db21tYW5kcyc6IGFzeW5jIGZ1bmN0aW9uIChcbiAgICBkYXRhOiBJUnVuQ29tbWFuZHNSZXEgJiBJRGJDb25maWcsXG4gICk6IFByb21pc2U8SUNvbW1vblJlczx7IGxpc3Q6IE9iamVjdFtdW10gfT4+IHtcbiAgICBsZXQgcmVzID0gYXdhaXQgdGhpcy5nYXRlV2F5KHtcbiAgICAgIHVybDogYCR7Z2F0ZVdheUZ1bmMuZ2V0VXJsUHJlZml4KGRhdGEpfS9jb21tYW5kc2AsXG4gICAgICBtZXRob2Q6ICdQT1NUJyxcbiAgICAgIGRhdGE6IHtcbiAgICAgICAgY29tbWFuZHM6IEVKU09OLnNlcmlhbGl6ZShkYXRhLmNvbW1hbmRzKSxcbiAgICAgICAgLi4uKGRhdGEudHJhbnNhY3Rpb25JZCAmJiB7IHRyYW5zYWN0aW9uSWQ6IGRhdGEudHJhbnNhY3Rpb25JZCB9KSxcbiAgICAgIH0sXG4gICAgfSlcblxuICAgIGlmICh0eXBlb2YgcmVzLmRhdGEgPT09ICdvYmplY3QnICYmIHJlcy5kYXRhICE9PSBudWxsKSB7XG4gICAgICByZXMgPSB7IC4uLnJlcywgLi4ucmVzLmRhdGEgfVxuICAgICAgZGVsZXRlIHJlcy5kYXRhXG4gICAgICBkZWxldGUgcmVzLnJlcXVlc3RfaWRcbiAgICB9XG5cbiAgICAvLyDlsJ3or5XlsIbnu5PmnpzovazmjaLkuLrmma7pgJrlr7nosaFcbiAgICB0cnkge1xuICAgICAgcmVzID0gRUpTT04uZGVzZXJpYWxpemUocmVzKVxuICAgIH0gY2F0Y2gge1xuICAgICAgLy8g5b+955Wl6L2s5o2i5aSx6LSlXG4gICAgfVxuXG4gICAgcmV0dXJuIGdhdGVXYXlGdW5jLmZpbHRlclJlcyhyZXMpXG4gIH0sXG59XG5cbmZ1bmN0aW9uIGRhdGFiYXNlKGRiQ29uZmlnPzogSURiQ29uZmlnKSB7XG4gIGNvbnN0IHsgYWRhcHRlciwgcnVudGltZSB9ID0gdGhpcy5wbGF0Zm9ybVxuXG4gIGNsYXNzIFJlcSBleHRlbmRzIHRoaXMucmVxdWVzdC5jb25zdHJ1Y3RvciB7XG4gICAgY29uc3RydWN0b3IoY29uZmlnKSB7XG4gICAgICBzdXBlcihjb25maWcpXG4gICAgfVxuXG4gICAgYXN5bmMgc2VuZChhY3Rpb246IHN0cmluZywgZGF0YTogYW55KSB7XG4gICAgICBsZXQgcmVzID0gbnVsbFxuXG4gICAgICBpZiAodGhpcy5jb25maWcuZW5kUG9pbnRNb2RlID09PSAnR0FURVdBWScgJiYgZ2F0ZVdheUZ1bmNbYWN0aW9uXSkge1xuICAgICAgICByZXMgPSBhd2FpdCBnYXRlV2F5RnVuY1thY3Rpb25dLmNhbGwodGhpcywgZGF0YSlcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHJlcyA9IGF3YWl0IHN1cGVyLnNlbmQoYWN0aW9uLCBkYXRhKVxuICAgICAgfVxuXG4gICAgICByZXR1cm4gcmVzXG4gICAgfVxuICB9XG5cbiAgRGIucmVxQ2xhc3MgPSBSZXFcbiAgLy8g5pyq55m75b2V5oOF5Ya15LiL5Lyg5YWl56m65Ye95pWwXG4gIERiLmdldEFjY2Vzc1Rva2VuID0gdGhpcy5hdXRoSW5zdGFuY2UgPyB0aGlzLmF1dGhJbnN0YW5jZS5nZXRBY2Nlc3NUb2tlbi5iaW5kKHRoaXMuYXV0aEluc3RhbmNlKSA6ICgpID0+ICcnXG4gIERiLnJ1bnRpbWUgPSBydW50aW1lXG4gIGlmICh0aGlzLndzQ2xpZW50Q2xhc3MpIHtcbiAgICBEYi53c0NsYXNzID0gYWRhcHRlci53c0NsYXNzXG4gICAgRGIud3NDbGllbnRDbGFzcyA9IHRoaXMud3NDbGllbnRDbGFzc1xuICB9XG5cbiAgaWYgKCFEYi53cykge1xuICAgIERiLndzID0gbnVsbFxuICB9XG5cbiAgY2xhc3MgTmV3RGIgZXh0ZW5kcyBEYiB7XG4gICAgY29uc3RydWN0b3IoY29uZmlnPzogSURiQ29uZmlnKSB7XG4gICAgICBzdXBlcihjb25maWcpXG4gICAgfVxuXG4gICAgYXN5bmMgcnVuQ29tbWFuZHMocGFyYW1zOiBJUnVuQ29tbWFuZHNSZXEpOiBQcm9taXNlPElDb21tb25SZXM8eyBsaXN0OiBPYmplY3RbXVtdIH0+PiB7XG4gICAgICBsZXQgcmVxdWVzdCA9IERiLmNyZWF0ZVJlcXVlc3QodGhpcy5jb25maWcpXG5cbiAgICAgIHJldHVybiByZXF1ZXN0LnNlbmQoJ2RhdGFiYXNlLnJ1bkNvbW1hbmRzJywgcGFyYW1zKVxuICAgIH1cbiAgfVxuXG4gIHJldHVybiBuZXcgTmV3RGIoeyAuLi50aGlzLmNvbmZpZywgX2Zyb21BcHA6IHRoaXMsIC4uLmRiQ29uZmlnIH0pXG59XG5cbmNvbnN0IGNvbXBvbmVudDogSUNsb3VkYmFzZUNvbXBvbmVudCA9IHtcbiAgbmFtZTogQ09NUE9ORU5UX05BTUUsXG4gIGVudGl0eToge1xuICAgIGRhdGFiYXNlLFxuICB9LFxufVxudHJ5IHtcbiAgY2xvdWRiYXNlLnJlZ2lzdGVyQ29tcG9uZW50KGNvbXBvbmVudClcbn0gY2F0Y2ggKGUpIHt9XG5cbmV4cG9ydCBmdW5jdGlvbiByZWdpc3RlckRhdGFiYXNlKGFwcDogSUNsb3VkYmFzZSB8IHR5cGVvZiBjbG91ZGJhc2VOUykge1xuICB0cnkge1xuICAgIGFwcC5yZWdpc3RlckNvbXBvbmVudChjb21wb25lbnQpXG4gIH0gY2F0Y2ggKGUpIHtcbiAgICBjb25zb2xlLndhcm4oZSlcbiAgfVxufVxuXG50cnkge1xuICA7KHdpbmRvdyBhcyBhbnkpLnJlZ2lzdGVyRGF0YWJhc2UgPSByZWdpc3RlckRhdGFiYXNlXG59IGNhdGNoIChlKSB7fVxuIl19

//# sourceMappingURL=data:application/json;charset=utf8;base64,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VDtDQUNGLENBQUE7QUFDRCxJQUFJO0lBQ0YsU0FBUyxDQUFDLGlCQUFpQixDQUFDLFNBQVMsQ0FBQyxDQUFBO0NBQ3ZDO0FBQUMsT0FBTyxDQUFDLEVBQUUsR0FBRTtBQUVkLFNBQWdCLGdCQUFnQixDQUFDLEdBQW9DO0lBQ25FLElBQUk7UUFDRixHQUFHLENBQUMsaUJBQWlCLENBQUMsU0FBUyxDQUFDLENBQUE7S0FDakM7SUFBQyxPQUFPLENBQUMsRUFBRTtRQUNWLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUE7S0FDaEI7QUFDSCxDQUFDO0FBTkQsNENBTUM7QUFFRCxJQUFJO0lBQ0YsQ0FBQztJQUFDLE1BQWMsQ0FBQyxnQkFBZ0IsR0FBRyxnQkFBZ0IsQ0FBQTtDQUNyRDtBQUFDLE9BQU8sQ0FBQyxFQUFFLEdBQUUiLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBEYiB9IGZyb20gJ0BjbG91ZGJhc2UvZGF0YWJhc2UnXG5pbXBvcnQgeyBJQ2xvdWRiYXNlIH0gZnJvbSAnQGNsb3VkYmFzZS90eXBlcydcbmltcG9ydCB7IElDbG91ZGJhc2VDb21wb25lbnQgfSBmcm9tICdAY2xvdWRiYXNlL3R5cGVzL2NvbXBvbmVudCdcbmltcG9ydCBjbG91ZGJhc2VOUyBmcm9tICcuLi8uLi9pbmRleCdcbmltcG9ydCB7IEVKU09OIH0gZnJvbSAnYnNvbidcblxuZGVjbGFyZSBjb25zdCBjbG91ZGJhc2U6IElDbG91ZGJhc2VcbmRlY2xhcmUgdHlwZSBRdWVyeVR5cGUgPSAnV0hFUkUnIHwgJ0RPQydcblxuLyoqXG4gKiDmlbDmja7lupPphY3nva7mjqXlj6NcbiAqL1xuaW50ZXJmYWNlIElEYkNvbmZpZyB7XG4gIC8qKiDlrp7kvosgSUTvvIjlj6/pgInvvIzpu5jorqQgJyhkZWZhdWx0KSfvvIkgKi9cbiAgaW5zdGFuY2U/OiBzdHJpbmdcbiAgLyoqIOaVsOaNruW6k+WQjeensO+8iOWPr+mAie+8jOm7mOiupCAnKGRlZmF1bHQpJ++8iSAqL1xuICBkYXRhYmFzZT86IHN0cmluZ1xufVxuXG5pbnRlcmZhY2UgSUJhc2VSZXEgZXh0ZW5kcyBJRGJDb25maWcge1xuICBjb2xsZWN0aW9uTmFtZTogc3RyaW5nXG4gIHRyYW5zYWN0aW9uSWQ/OiBzdHJpbmdcbn1cblxuaW50ZXJmYWNlIElEb2N1bWVudHNRdWVyeVJlcSBleHRlbmRzIElCYXNlUmVxIHtcbiAgcXVlcnk/OiBhbnlcbiAgLyoqIEBkZXByZWNhdGVkIOS9v+eUqCBxdWVyeSDmm7/ku6MgKi9cbiAgcXVlcnlUeXBlPzogUXVlcnlUeXBlXG4gIG9yZGVyPzogc3RyaW5nW11cbiAgb2Zmc2V0PzogbnVtYmVyXG4gIGxpbWl0PzogbnVtYmVyXG4gIHByb2plY3Rpb24/OiBPYmplY3Rcbn1cblxuaW50ZXJmYWNlIElEb2N1bWVudHNBZGRSZXEgZXh0ZW5kcyBJQmFzZVJlcSB7XG4gIGRhdGE6IE9iamVjdCB8IE9iamVjdFtdXG59XG5cbmludGVyZmFjZSBJRG9jdW1lbnRzVXBkYXRlUmVxIGV4dGVuZHMgSUJhc2VSZXEge1xuICBxdWVyeTogT2JqZWN0XG4gIGRhdGE6IE9iamVjdFxuICAvKiog5piv5ZCm5om56YeP5pu05paw77yI6buY6K6kIGZhbHNl77yJICovXG4gIG11bHRpPzogYm9vbGVhblxuICAvKiog5oqK5omA5pyJ5pu05paw5pWw5o2u6L2s5Li65bim5pON5L2c56ym55qEICovXG4gIG1lcmdlPzogYm9vbGVhblxuICAvKiog5LiN5a2Y5Zyo5pe25piv5ZCm5Yib5bu677yI6buY6K6kIGZhbHNl77yJICovXG4gIHVwc2VydD86IGJvb2xlYW5cbiAgLyoqIOaYr+WQpuabv+aNouaVtOS4quaWh+aho++8iOm7mOiupCBmYWxzZe+8jOS4uiB0cnVlIOaXtuabv+aNouaVtOS4quaWh+aho+iAjOmdnuWQiOW5tuabtOaWsO+8iSAqL1xuICByZXBsYWNlTW9kZT86IGJvb2xlYW5cbiAgLyoqIEBkZXByZWNhdGVkIOS9v+eUqCBxdWVyeSDmm7/ku6MgKi9cbiAgcXVlcnlUeXBlPzogUXVlcnlUeXBlXG59XG5cbmludGVyZmFjZSBJRG9jdW1lbnRzUmVtb3ZlUmVxIGV4dGVuZHMgSUJhc2VSZXEge1xuICBxdWVyeTogT2JqZWN0XG4gIC8qKiDmmK/lkKbmibnph4/liKDpmaTvvIjpu5jorqQgZmFsc2XvvIkgKi9cbiAgbXVsdGk/OiBib29sZWFuXG4gIC8qKiBAZGVwcmVjYXRlZCDkvb/nlKggcXVlcnkg5pu/5LujICovXG4gIHF1ZXJ5VHlwZT86IFF1ZXJ5VHlwZVxufVxuXG5pbnRlcmZhY2UgSURvY3VtZW50c0NvdW50UmVxIGV4dGVuZHMgSUJhc2VSZXEge1xuICBxdWVyeTogT2JqZWN0XG4gIC8qKiBAZGVwcmVjYXRlZCDkvb/nlKggcXVlcnkg5pu/5LujICovXG4gIHF1ZXJ5VHlwZT86IFF1ZXJ5VHlwZVxufVxuXG5pbnRlcmZhY2UgSUNvbW1vblJlczxUPiB7XG4gIGRhdGE/OiBUICYgeyBjb2RlPzogc3RyaW5nIH1cbiAgcmVxdWVzdElkOiBzdHJpbmdcbiAgY29kZT86IHN0cmluZ1xuICBtZXNzYWdlPzogc3RyaW5nXG59XG5cbmludGVyZmFjZSBJQWRkUmVzIHtcbiAgLyoqIOWNleadoeaPkuWFpeaXtui/lOWbnueahOaWh+ahoyBJRO+8iOaJuemHj+aPkuWFpeaXtuS4jei/lOWbnu+8iSAqL1xuICBfaWQ/OiBzdHJpbmdcbiAgLyoqIOaJuemHj+aPkuWFpeaXtui/lOWbnueahOaWh+ahoyBJRCDliJfooaggKi9cbiAgaWRzPzogc3RyaW5nW11cbiAgaW5zZXJ0ZWRJZHM6IHN0cmluZ1tdXG59XG5cbmludGVyZmFjZSBJUnVuQ29tbWFuZHNSZXEge1xuICB0cmFuc2FjdGlvbklkPzogc3RyaW5nXG4gIC8qKiDlkb3ku6TmlbDnu4TvvIzmlrnms5XkvJrlsIblhbbovazkuLogTW9uZ29EQiDljp/nlJ/lkb3ku6TvvIhFSlNPTiDlr7nosaHmoLzlvI/vvIkgKi9cbiAgY29tbWFuZHM6IE9iamVjdFtdXG59XG5cbmNvbnN0IENPTVBPTkVOVF9OQU1FID0gJ2RhdGFiYXNlJ1xuXG5jb25zdCBnYXRlV2F5RnVuYyA9IHtcbiAgLyoqXG4gICAqIOi/h+a7pOWTjeW6lO+8jOenu+mZpOS4jeW/heimgeeahOWtl+autVxuICAgKi9cbiAgZmlsdGVyUmVzOiBmdW5jdGlvbiA8VD4ocmVzOiBJQ29tbW9uUmVzPFQ+ICYgeyBoZWFkZXI/OiBhbnk7IHN0YXR1c0NvZGU/OiBudW1iZXIgfSk6IElDb21tb25SZXM8VD4ge1xuICAgIGRlbGV0ZSByZXMuaGVhZGVyXG4gICAgZGVsZXRlIHJlcy5zdGF0dXNDb2RlXG4gICAgcmV0dXJuIHJlc1xuICB9LFxuXG4gIC8qKlxuICAgKiDlsZXlvIDlk43lupTmlbDmja7liLDpobblsYLvvIjnlKjkuo7kuovliqHnrYnlnLrmma/vvIlcbiAgICovXG4gIGZsYXR0ZW5SZXNEYXRhOiBmdW5jdGlvbiA8VD4ocmVzOiBJQ29tbW9uUmVzPFQ+KTogYW55IHtcbiAgICBpZiAodHlwZW9mIHJlcy5kYXRhID09PSAnb2JqZWN0JyAmJiByZXMuZGF0YSAhPT0gbnVsbCkge1xuICAgICAgY29uc3QgcmVzdWx0ID0geyAuLi5yZXMsIC4uLnJlcy5kYXRhIH1cbiAgICAgIGRlbGV0ZSByZXN1bHQuZGF0YVxuICAgICAgcmV0dXJuIHJlc3VsdFxuICAgIH1cbiAgICByZXR1cm4gcmVzXG4gIH0sXG5cbiAgLyoqXG4gICAqIOWuieWFqOino+aekCBFSlNPTlxuICAgKi9cbiAgc2FmZVBhcnNlRUpTT046IGZ1bmN0aW9uIChkYXRhOiBhbnkpOiBhbnkge1xuICAgIGlmICh0eXBlb2YgZGF0YSAhPT0gJ3N0cmluZycpIHJldHVybiBkYXRhXG4gICAgdHJ5IHtcbiAgICAgIHJldHVybiBFSlNPTi5wYXJzZShkYXRhKVxuICAgIH0gY2F0Y2gge1xuICAgICAgcmV0dXJuIGRhdGFcbiAgICB9XG4gIH0sXG5cbiAgLyoqXG4gICAqIOaehOW7uiBVUkwg5p+l6K+i5Y+C5pWwXG4gICAqL1xuICBidWlsZFF1ZXJ5UGFyYW1zOiBmdW5jdGlvbiAocGFyYW1zOiBSZWNvcmQ8c3RyaW5nLCBhbnk+KTogc3RyaW5nIHtcbiAgICByZXR1cm4gT2JqZWN0LmVudHJpZXMocGFyYW1zKVxuICAgICAgLmZpbHRlcigoW18sIHZhbHVlXSkgPT4gdmFsdWUgIT09IHVuZGVmaW5lZCAmJiB2YWx1ZSAhPT0gbnVsbCAmJiB2YWx1ZSAhPT0gJycpXG4gICAgICAubWFwKChba2V5LCB2YWx1ZV0pID0+IHtcbiAgICAgICAgY29uc3Qgc3RyaW5nVmFsdWUgPSB0eXBlb2YgdmFsdWUgPT09ICdvYmplY3QnID8gSlNPTi5zdHJpbmdpZnkodmFsdWUpIDogU3RyaW5nKHZhbHVlKVxuICAgICAgICByZXR1cm4gYCR7ZW5jb2RlVVJJQ29tcG9uZW50KGtleSl9PSR7ZW5jb2RlVVJJQ29tcG9uZW50KHN0cmluZ1ZhbHVlKX1gXG4gICAgICB9KVxuICAgICAgLmpvaW4oJyYnKVxuICB9LFxuXG4gIC8qKlxuICAgKiDojrflj5YgVVJMIOWJjee8gFxuICAgKi9cbiAgZ2V0VXJsUHJlZml4OiBmdW5jdGlvbiAoZGF0YTogSURiQ29uZmlnKTogc3RyaW5nIHtcbiAgICBjb25zdCBpbnN0YW5jZSA9IGRhdGE/Lmluc3RhbmNlIHx8ICcoZGVmYXVsdCknXG4gICAgY29uc3QgZGF0YWJhc2UgPSBkYXRhPy5kYXRhYmFzZSB8fCAnKGRlZmF1bHQpJ1xuICAgIHJldHVybiBgL2RhdGFiYXNlL2luc3RhbmNlcy8ke2luc3RhbmNlfS9kYXRhYmFzZXMvJHtkYXRhYmFzZX1gXG4gIH0sXG5cbiAgJ2RhdGFiYXNlLnF1ZXJ5RG9jdW1lbnQnOiBhc3luYyBmdW5jdGlvbiAoXG4gICAgZGF0YTogSURvY3VtZW50c1F1ZXJ5UmVxLFxuICApOiBQcm9taXNlPElDb21tb25SZXM8eyBvZmZzZXQ/OiBudW1iZXI7IGxpbWl0PzogbnVtYmVyOyBsaXN0OiBhbnlbXSB9Pj4ge1xuICAgIGNvbnN0IGlzUXVlcnlEb2MgPSAhIWRhdGEucXVlcnk/Ll9pZFxuICAgIGNvbnN0IHF1ZXJ5UGFyYW1zID0gZ2F0ZVdheUZ1bmMuYnVpbGRRdWVyeVBhcmFtcyh7XG4gICAgICBwcm9qZWN0aW9uOiBkYXRhLnByb2plY3Rpb24sXG4gICAgICB0cmFuc2FjdGlvbklkOiBkYXRhLnRyYW5zYWN0aW9uSWQsXG4gICAgICAuLi4oaXNRdWVyeURvY1xuICAgICAgICA/IHt9XG4gICAgICAgIDoge1xuICAgICAgICAgICAgb2Zmc2V0OiBkYXRhLm9mZnNldCA/PyAwLFxuICAgICAgICAgICAgbGltaXQ6IGRhdGEubGltaXQgPz8gMTAwLFxuICAgICAgICAgICAgb3JkZXI6IGRhdGEub3JkZXIsXG4gICAgICAgICAgICBxdWVyeTogZGF0YS5xdWVyeSA/IEVKU09OLnN0cmluZ2lmeShkYXRhLnF1ZXJ5LCB7IHJlbGF4ZWQ6IGZhbHNlIH0pIDogdW5kZWZpbmVkLFxuICAgICAgICAgIH0pLFxuICAgIH0pXG5cbiAgICBsZXQgdXJsID0gYCR7Z2F0ZVdheUZ1bmMuZ2V0VXJsUHJlZml4KGRhdGEpfS9jb2xsZWN0aW9ucy8ke2RhdGEuY29sbGVjdGlvbk5hbWV9L2RvY3VtZW50cz8ke3F1ZXJ5UGFyYW1zfWBcblxuICAgIC8vIOafpeivouWNleS4quaWh+aho1xuICAgIGlmIChpc1F1ZXJ5RG9jKSB7XG4gICAgICB1cmwgPSBgJHtnYXRlV2F5RnVuYy5nZXRVcmxQcmVmaXgoZGF0YSl9L2NvbGxlY3Rpb25zLyR7ZGF0YS5jb2xsZWN0aW9uTmFtZX0vZG9jdW1lbnRzLyR7XG4gICAgICAgIGRhdGEucXVlcnkuX2lkPy4kZXEgfHwgZGF0YS5xdWVyeS5faWRcbiAgICAgIH0/JHtxdWVyeVBhcmFtc31gXG4gICAgfVxuXG4gICAgY29uc3QgcmVzID0gYXdhaXQgdGhpcy5nYXRlV2F5KHtcbiAgICAgIHVybCxcbiAgICAgIG1ldGhvZDogJ0dFVCcsXG4gICAgfSlcblxuICAgIC8vIOWwneivleino+aekCBFSlNPTiDmoLzlvI/nmoTmlbDmja5cbiAgICByZXMuZGF0YSA9IGdhdGVXYXlGdW5jLnNhZmVQYXJzZUVKU09OKEpTT04uc3RyaW5naWZ5KHJlcy5kYXRhKSlcblxuICAgIGlmIChpc1F1ZXJ5RG9jICYmICFyZXMuY29kZSAmJiAhcmVzLmRhdGE/LmNvZGUpIHtcbiAgICAgIHJldHVybiB7XG4gICAgICAgIC4uLnJlcyxcbiAgICAgICAgZGF0YTogeyBsaXN0OiBbcmVzLmRhdGFdIH1cbiAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gZ2F0ZVdheUZ1bmMuZmlsdGVyUmVzKHJlcylcbiAgfSxcblxuICAnZGF0YWJhc2UuYWRkRG9jdW1lbnQnOiBhc3luYyBmdW5jdGlvbiAoZGF0YTogSURvY3VtZW50c0FkZFJlcSk6IFByb21pc2U8SUNvbW1vblJlczxJQWRkUmVzPj4ge1xuICAgIGxldCByZXMgPSBhd2FpdCB0aGlzLmdhdGVXYXkoe1xuICAgICAgdXJsOiBgJHtnYXRlV2F5RnVuYy5nZXRVcmxQcmVmaXgoZGF0YSl9L2NvbGxlY3Rpb25zLyR7ZGF0YS5jb2xsZWN0aW9uTmFtZX0vZG9jdW1lbnRzYCxcbiAgICAgIG1ldGhvZDogJ1BPU1QnLFxuICAgICAgZGF0YToge1xuICAgICAgICBkYXRhOiBBcnJheS5pc0FycmF5KGRhdGEuZGF0YSkgPyBkYXRhLmRhdGEgOiBbZGF0YS5kYXRhXSxcbiAgICAgICAgLi4uKGRhdGEudHJhbnNhY3Rpb25JZCAmJiB7IHRyYW5zYWN0aW9uSWQ6IGRhdGEudHJhbnNhY3Rpb25JZCB9KSxcbiAgICAgIH0sXG4gICAgfSlcblxuICAgIGlmIChBcnJheS5pc0FycmF5KGRhdGEuZGF0YSkpIHtcbiAgICAgIC8vIOaVsOe7hOaooeW8j++8iOaJuemHj+aPkuWFpe+8ie+8jOi/lOWbniBpZHMg5YiX6KGoXG4gICAgICByZXMgPSB7XG4gICAgICAgIC4uLnJlcyxcbiAgICAgICAgZGF0YToge1xuICAgICAgICAgIGlkczogcmVzLmRhdGE/Lmluc2VydGVkSWRzIHx8IFtdLFxuICAgICAgICAgIC4uLnJlcy5kYXRhLFxuICAgICAgICB9LFxuICAgICAgfVxuICAgIH0gZWxzZSBpZiAocmVzLmRhdGE/Lmluc2VydGVkSWRzPy5bMF0pIHtcbiAgICAgIC8vIOmdnuaVsOe7hOaooeW8j++8iOWNleadoeaPkuWFpe+8ie+8jOWwhiBfaWQg5o+Q5Y2H5Yiw6aG25bGCXG4gICAgICByZXMgPSB7XG4gICAgICAgIC4uLnJlcyxcbiAgICAgICAgZGF0YToge1xuICAgICAgICAgIF9pZDogcmVzLmRhdGEuaW5zZXJ0ZWRJZHNbMF0sXG4gICAgICAgICAgLi4ucmVzLmRhdGEsXG4gICAgICAgIH0sXG4gICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIGdhdGVXYXlGdW5jLmZpbHRlclJlcyhyZXMpXG4gIH0sXG5cbiAgJ2RhdGFiYXNlLnVwZGF0ZURvY3VtZW50JzogYXN5bmMgZnVuY3Rpb24gKFxuICAgIGRhdGE6IElEb2N1bWVudHNVcGRhdGVSZXEsXG4gICk6IFByb21pc2U8SUNvbW1vblJlczx7IG1hdGNoZWQ6IG51bWJlcjsgdXBkYXRlZDogbnVtYmVyOyB1cHNlcnRfaWQ6IHN0cmluZyB9Pj4ge1xuICAgIGNvbnN0IHJlcyA9IGF3YWl0IHRoaXMuZ2F0ZVdheSh7XG4gICAgICB1cmw6IGAke2dhdGVXYXlGdW5jLmdldFVybFByZWZpeChkYXRhKX0vY29sbGVjdGlvbnMvJHtkYXRhLmNvbGxlY3Rpb25OYW1lfS9kb2N1bWVudHNgLFxuICAgICAgbWV0aG9kOiAnUEFUQ0gnLFxuICAgICAgZGF0YToge1xuICAgICAgICBxdWVyeTogZGF0YS5xdWVyeSxcbiAgICAgICAgZGF0YTogZGF0YS5kYXRhLFxuICAgICAgICBtdWx0aTogISFkYXRhLm11bHRpLFxuICAgICAgICB1cHNlcnQ6ICEhZGF0YS51cHNlcnQsXG4gICAgICAgIHJlcGxhY2VNb2RlOiAhIWRhdGEucmVwbGFjZU1vZGUsXG4gICAgICAgIC4uLihkYXRhLnRyYW5zYWN0aW9uSWQgJiYgeyB0cmFuc2FjdGlvbklkOiBkYXRhLnRyYW5zYWN0aW9uSWQgfSksXG4gICAgICB9LFxuICAgIH0pXG5cbiAgICByZXR1cm4gZ2F0ZVdheUZ1bmMuZmlsdGVyUmVzKHJlcylcbiAgfSxcblxuICAnZGF0YWJhc2UuZGVsZXRlRG9jdW1lbnQnOiBhc3luYyBmdW5jdGlvbiAoZGF0YTogSURvY3VtZW50c1JlbW92ZVJlcSk6IFByb21pc2U8SUNvbW1vblJlczx7IGRlbGV0ZWQ6IG51bWJlciB9Pj4ge1xuICAgIGNvbnN0IHJlcyA9IGF3YWl0IHRoaXMuZ2F0ZVdheSh7XG4gICAgICB1cmw6IGAke2dhdGVXYXlGdW5jLmdldFVybFByZWZpeChkYXRhKX0vY29sbGVjdGlvbnMvJHtkYXRhLmNvbGxlY3Rpb25OYW1lfS9kb2N1bWVudHMvcmVtb3ZlYCxcbiAgICAgIG1ldGhvZDogJ1BPU1QnLFxuICAgICAgZGF0YToge1xuICAgICAgICBxdWVyeTogZGF0YS5xdWVyeSxcbiAgICAgICAgbXVsdGk6ICEhZGF0YS5tdWx0aSxcbiAgICAgICAgLi4uKGRhdGEudHJhbnNhY3Rpb25JZCAmJiB7IHRyYW5zYWN0aW9uSWQ6IGRhdGEudHJhbnNhY3Rpb25JZCB9KSxcbiAgICAgIH0sXG4gICAgfSlcblxuICAgIHJldHVybiBnYXRlV2F5RnVuYy5maWx0ZXJSZXMocmVzKVxuICB9LFxuXG4gICdkYXRhYmFzZS5jb3VudERvY3VtZW50JzogYXN5bmMgZnVuY3Rpb24gKGRhdGE6IElEb2N1bWVudHNDb3VudFJlcSk6IFByb21pc2U8SUNvbW1vblJlczx7IHRvdGFsOiBudW1iZXIgfT4+IHtcbiAgICBjb25zdCBxdWVyeVBhcmFtcyA9IGdhdGVXYXlGdW5jLmJ1aWxkUXVlcnlQYXJhbXMoe1xuICAgICAgY291bnQ6IHRydWUsXG4gICAgICBxdWVyeTogZGF0YS5xdWVyeSA/IEVKU09OLnN0cmluZ2lmeShkYXRhLnF1ZXJ5LCB7IHJlbGF4ZWQ6IGZhbHNlIH0pIDogdW5kZWZpbmVkLFxuICAgIH0pXG5cbiAgICBjb25zdCByZXMgPSBhd2FpdCB0aGlzLmdhdGVXYXkoe1xuICAgICAgdXJsOiBgJHtnYXRlV2F5RnVuYy5nZXRVcmxQcmVmaXgoZGF0YSl9L2NvbGxlY3Rpb25zLyR7ZGF0YS5jb2xsZWN0aW9uTmFtZX0vZG9jdW1lbnRzPyR7cXVlcnlQYXJhbXN9YCxcbiAgICAgIG1ldGhvZDogJ0dFVCcsXG4gICAgfSlcblxuICAgIHJldHVybiBnYXRlV2F5RnVuYy5maWx0ZXJSZXMocmVzKVxuICB9LFxuXG4gICdkYXRhYmFzZS5hZGRDb2xsZWN0aW9uJzogYXN5bmMgZnVuY3Rpb24gKGRhdGE6IHsgY29sbGVjdGlvbk5hbWU6IHN0cmluZyB9ICYgSURiQ29uZmlnKTogUHJvbWlzZTxJQ29tbW9uUmVzPCcnPj4ge1xuICAgIGNvbnN0IHJlcyA9IGF3YWl0IHRoaXMuZ2F0ZVdheSh7XG4gICAgICB1cmw6IGAke2dhdGVXYXlGdW5jLmdldFVybFByZWZpeChkYXRhKX0vY29sbGVjdGlvbnNgLFxuICAgICAgbWV0aG9kOiAnUE9TVCcsXG4gICAgICBkYXRhOiB7IGNvbGxlY3Rpb25OYW1lOiBkYXRhLmNvbGxlY3Rpb25OYW1lIH0sXG4gICAgfSlcblxuICAgIHJldHVybiBnYXRlV2F5RnVuYy5maWx0ZXJSZXMocmVzKVxuICB9LFxuXG4gICdkYXRhYmFzZS5hZ2dyZWdhdGUnOiBhc3luYyBmdW5jdGlvbiAoXG4gICAgZGF0YTogeyBjb2xsZWN0aW9uTmFtZTogc3RyaW5nOyBzdGFnZXM6IHsgc3RhZ2VLZXk6IHN0cmluZzsgc3RhZ2VWYWx1ZTogYW55IH1bXSB9ICYgSURiQ29uZmlnLFxuICApOiBQcm9taXNlPElDb21tb25SZXM8eyBsaXN0OiBzdHJpbmcgfT4+IHtcbiAgICBjb25zdCBwaXBlbGluZSA9IGRhdGEuc3RhZ2VzLm1hcCgoc3RhZ2UpID0+IHtcbiAgICAgIHRyeSB7XG4gICAgICAgIC8vIHN0YWdlVmFsdWUg5Y+v6IO95piv5a2X56ym5Liy5oiW5a+56LGh77yM57uf5LiA5aSE55CGXG4gICAgICAgIGNvbnN0IHZhbHVlID0gdHlwZW9mIHN0YWdlLnN0YWdlVmFsdWUgPT09ICdzdHJpbmcnID8gSlNPTi5wYXJzZShzdGFnZS5zdGFnZVZhbHVlKSA6IHN0YWdlLnN0YWdlVmFsdWVcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICBbc3RhZ2Uuc3RhZ2VLZXldOiBFSlNPTi5zZXJpYWxpemUodmFsdWUpLFxuICAgICAgICB9XG4gICAgICB9IGNhdGNoIHtcbiAgICAgICAgcmV0dXJuIHsgW3N0YWdlLnN0YWdlS2V5XTogc3RhZ2Uuc3RhZ2VWYWx1ZSB9XG4gICAgICB9XG4gICAgfSlcblxuICAgIGNvbnN0IHJlcyA9IGF3YWl0IHRoaXMuZ2F0ZVdheSh7XG4gICAgICB1cmw6IGAke2dhdGVXYXlGdW5jLmdldFVybFByZWZpeChkYXRhKX0vY29sbGVjdGlvbnMvJHtkYXRhLmNvbGxlY3Rpb25OYW1lfS9kb2N1bWVudHMvYWdncmVnYXRpb25zYCxcbiAgICAgIG1ldGhvZDogJ1BPU1QnLFxuICAgICAgZGF0YTogeyBwaXBlbGluZSB9LFxuICAgIH0pXG5cbiAgICAvLyDlsIbnu5PmnpzliJfooajovazkuLrlrZfnrKbkuLLmoLzlvI/vvIjlhbzlrrnljp/mnInpgLvovpHvvIlcbiAgICBpZiAoQXJyYXkuaXNBcnJheShyZXMuZGF0YT8ubGlzdCkpIHtcbiAgICAgIHJlcy5kYXRhLmxpc3QgPSBKU09OLnN0cmluZ2lmeShyZXMuZGF0YS5saXN0Lm1hcCgoaXRlbTogYW55KSA9PiBKU09OLnN0cmluZ2lmeShpdGVtKSkpXG4gICAgfVxuXG4gICAgcmV0dXJuIGdhdGVXYXlGdW5jLmZpbHRlclJlcyhyZXMpXG4gIH0sXG5cbiAgJ2RhdGFiYXNlLnN0YXJ0VHJhbnNhY3Rpb24nOiBhc3luYyBmdW5jdGlvbiAoZGF0YTogSURiQ29uZmlnKSB7XG4gICAgY29uc3QgcmVzID0gYXdhaXQgdGhpcy5nYXRlV2F5KHtcbiAgICAgIHVybDogYCR7Z2F0ZVdheUZ1bmMuZ2V0VXJsUHJlZml4KGRhdGEpfS90cmFuc2FjdGlvbnNgLFxuICAgICAgbWV0aG9kOiAnUE9TVCcsXG4gICAgfSlcblxuICAgIHJldHVybiBnYXRlV2F5RnVuYy5maWx0ZXJSZXMoZ2F0ZVdheUZ1bmMuZmxhdHRlblJlc0RhdGEocmVzKSlcbiAgfSxcblxuICAnZGF0YWJhc2UuY29tbWl0VHJhbnNhY3Rpb24nOiBhc3luYyBmdW5jdGlvbiAoZGF0YTogeyB0cmFuc2FjdGlvbklkOiBzdHJpbmcgfSAmIElEYkNvbmZpZykge1xuICAgIGNvbnN0IHJlcyA9IGF3YWl0IHRoaXMuZ2F0ZVdheSh7XG4gICAgICB1cmw6IGAke2dhdGVXYXlGdW5jLmdldFVybFByZWZpeChkYXRhKX0vdHJhbnNhY3Rpb25zLyR7ZGF0YS50cmFuc2FjdGlvbklkfS9jb21taXRgLFxuICAgICAgbWV0aG9kOiAnUE9TVCcsXG4gICAgfSlcblxuICAgIHJldHVybiBnYXRlV2F5RnVuYy5maWx0ZXJSZXMocmVzKVxuICB9LFxuXG4gICdkYXRhYmFzZS5hYm9ydFRyYW5zYWN0aW9uJzogYXN5bmMgZnVuY3Rpb24gKGRhdGE6IHsgdHJhbnNhY3Rpb25JZDogc3RyaW5nIH0gJiBJRGJDb25maWcpIHtcbiAgICBjb25zdCByZXMgPSBhd2FpdCB0aGlzLmdhdGVXYXkoe1xuICAgICAgdXJsOiBgJHtnYXRlV2F5RnVuYy5nZXRVcmxQcmVmaXgoZGF0YSl9L3RyYW5zYWN0aW9ucy8ke2RhdGEudHJhbnNhY3Rpb25JZH0vcm9sbGJhY2tgLFxuICAgICAgbWV0aG9kOiAnUE9TVCcsXG4gICAgfSlcblxuICAgIHJldHVybiBnYXRlV2F5RnVuYy5maWx0ZXJSZXMocmVzKVxuICB9LFxuXG4gICdkYXRhYmFzZS5nZXRJblRyYW5zYWN0aW9uJzogYXN5bmMgZnVuY3Rpb24gKGRhdGE6IElEb2N1bWVudHNRdWVyeVJlcSkge1xuICAgIGNvbnN0IHJlcyA9IGF3YWl0IGdhdGVXYXlGdW5jWydkYXRhYmFzZS5xdWVyeURvY3VtZW50J10uY2FsbCh0aGlzLCBkYXRhKVxuXG4gICAgaWYgKHR5cGVvZiByZXMuZGF0YSA9PT0gJ29iamVjdCcgJiYgcmVzLmRhdGEgIT09IG51bGwpIHtcbiAgICAgIGlmIChyZXMuZGF0YT8uY29kZSkge1xuICAgICAgICByZXR1cm4gZ2F0ZVdheUZ1bmMuZmxhdHRlblJlc0RhdGEocmVzKVxuICAgICAgfVxuICAgICAgcmV0dXJuIHsgLi4ucmVzLCBkYXRhOiBKU09OLnN0cmluZ2lmeShyZXMuZGF0YSkgYXMgYW55IH1cbiAgICB9XG5cbiAgICByZXR1cm4gcmVzXG4gIH0sXG5cbiAgJ2RhdGFiYXNlLnVwZGF0ZURvY0luVHJhbnNhY3Rpb24nOiBhc3luYyBmdW5jdGlvbiAoZGF0YTogSURvY3VtZW50c1VwZGF0ZVJlcSkge1xuICAgIC8vIOWwneivleino+aekCBFSlNPTiDmoLzlvI/nmoTmlbDmja5cbiAgICBkYXRhLmRhdGEgPSBnYXRlV2F5RnVuYy5zYWZlUGFyc2VFSlNPTihkYXRhLmRhdGEpXG5cbiAgICBjb25zdCByZXMgPSBhd2FpdCBnYXRlV2F5RnVuY1snZGF0YWJhc2UudXBkYXRlRG9jdW1lbnQnXS5jYWxsKHRoaXMsIGRhdGEpXG4gICAgcmV0dXJuIGdhdGVXYXlGdW5jLmZsYXR0ZW5SZXNEYXRhKHJlcylcbiAgfSxcblxuICAnZGF0YWJhc2UuZGVsZXRlRG9jSW5UcmFuc2FjdGlvbic6IGFzeW5jIGZ1bmN0aW9uIChkYXRhOiBJRG9jdW1lbnRzUmVtb3ZlUmVxKSB7XG4gICAgY29uc3QgcmVzID0gYXdhaXQgZ2F0ZVdheUZ1bmNbJ2RhdGFiYXNlLmRlbGV0ZURvY3VtZW50J10uY2FsbCh0aGlzLCBkYXRhKVxuICAgIHJldHVybiBnYXRlV2F5RnVuYy5mbGF0dGVuUmVzRGF0YShyZXMpXG4gIH0sXG5cbiAgJ2RhdGFiYXNlLmluc2VydERvY0luVHJhbnNhY3Rpb24nOiBhc3luYyBmdW5jdGlvbiAoXG4gICAgZGF0YTogSURvY3VtZW50c0FkZFJlcSxcbiAgKTogUHJvbWlzZTxJQ29tbW9uUmVzPElBZGRSZXMgJiB7IGluc2VydGVkPzogbnVtYmVyIH0+PiB7XG4gICAgLy8g5bCd6K+V6Kej5p6QIEVKU09OIOagvOW8j+eahOaVsOaNrlxuICAgIGRhdGEuZGF0YSA9IGdhdGVXYXlGdW5jLnNhZmVQYXJzZUVKU09OKGRhdGEuZGF0YSlcblxuICAgIGxldCByZXMgPSBhd2FpdCBnYXRlV2F5RnVuY1snZGF0YWJhc2UuYWRkRG9jdW1lbnQnXS5jYWxsKHRoaXMsIGRhdGEpXG5cbiAgICBpZiAodHlwZW9mIHJlcy5kYXRhID09PSAnb2JqZWN0JyAmJiByZXMuZGF0YSAhPT0gbnVsbCkge1xuICAgICAgY29uc3QgaGFzSWQgPSAhIXJlcy5kYXRhPy5faWRcbiAgICAgIHJlcyA9IHtcbiAgICAgICAgLi4ucmVzLFxuICAgICAgICBpbnNlcnRlZDogaGFzSWQgPyAxIDogMCxcbiAgICAgICAgb2s6IGhhc0lkID8gMSA6IDAsXG4gICAgICAgIC4uLnJlcy5kYXRhLFxuICAgICAgfSBhcyBhbnlcbiAgICB9IGVsc2Uge1xuICAgICAgcmVzID0geyBpbnNlcnRlZDogMCwgb2s6IDAsIC4uLnJlcyB9IGFzIGFueVxuICAgIH1cblxuICAgIGRlbGV0ZSByZXMuZGF0YVxuXG4gICAgcmV0dXJuIHJlc1xuICB9LFxuXG4gICdkYXRhYmFzZS5ydW5Db21tYW5kcyc6IGFzeW5jIGZ1bmN0aW9uIChcbiAgICBkYXRhOiBJUnVuQ29tbWFuZHNSZXEgJiBJRGJDb25maWcsXG4gICk6IFByb21pc2U8SUNvbW1vblJlczx7IGxpc3Q6IE9iamVjdFtdW10gfT4+IHtcbiAgICBsZXQgcmVzID0gYXdhaXQgdGhpcy5nYXRlV2F5KHtcbiAgICAgIHVybDogYCR7Z2F0ZVdheUZ1bmMuZ2V0VXJsUHJlZml4KGRhdGEpfS9jb21tYW5kc2AsXG4gICAgICBtZXRob2Q6ICdQT1NUJyxcbiAgICAgIGRhdGE6IHtcbiAgICAgICAgY29tbWFuZHM6IEVKU09OLnNlcmlhbGl6ZShkYXRhLmNvbW1hbmRzKSxcbiAgICAgICAgLi4uKGRhdGEudHJhbnNhY3Rpb25JZCAmJiB7IHRyYW5zYWN0aW9uSWQ6IGRhdGEudHJhbnNhY3Rpb25JZCB9KSxcbiAgICAgIH0sXG4gICAgfSlcblxuICAgIGlmICh0eXBlb2YgcmVzLmRhdGEgPT09ICdvYmplY3QnICYmIHJlcy5kYXRhICE9PSBudWxsKSB7XG4gICAgICByZXMgPSB7IC4uLnJlcywgLi4ucmVzLmRhdGEgfVxuICAgICAgZGVsZXRlIHJlcy5kYXRhXG4gICAgICBkZWxldGUgcmVzLnJlcXVlc3RfaWRcbiAgICB9XG5cbiAgICAvLyDlsJ3or5XlsIbnu5PmnpzovazmjaLkuLrmma7pgJrlr7nosaFcbiAgICB0cnkge1xuICAgICAgcmVzID0gRUpTT04uZGVzZXJpYWxpemUocmVzKVxuICAgIH0gY2F0Y2gge1xuICAgICAgLy8g5b+955Wl6L2s5o2i5aSx6LSlXG4gICAgfVxuXG4gICAgcmV0dXJuIGdhdGVXYXlGdW5jLmZpbHRlclJlcyhyZXMpXG4gIH0sXG59XG5cbmZ1bmN0aW9uIGRhdGFiYXNlKGRiQ29uZmlnPzogSURiQ29uZmlnKSB7XG4gIGNvbnN0IHsgYWRhcHRlciwgcnVudGltZSB9ID0gdGhpcy5wbGF0Zm9ybVxuXG4gIGNsYXNzIFJlcSBleHRlbmRzIHRoaXMucmVxdWVzdC5jb25zdHJ1Y3RvciB7XG4gICAgY29uc3RydWN0b3IoY29uZmlnKSB7XG4gICAgICBzdXBlcihjb25maWcpXG4gICAgfVxuXG4gICAgYXN5bmMgc2VuZChhY3Rpb246IHN0cmluZywgZGF0YTogYW55KSB7XG4gICAgICBsZXQgcmVzID0gbnVsbFxuXG4gICAgICBpZiAodGhpcy5jb25maWcuZW5kUG9pbnRNb2RlID09PSAnR0FURVdBWScgJiYgZ2F0ZVdheUZ1bmNbYWN0aW9uXSkge1xuICAgICAgICByZXMgPSBhd2FpdCBnYXRlV2F5RnVuY1thY3Rpb25dLmNhbGwodGhpcywgZGF0YSlcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHJlcyA9IGF3YWl0IHN1cGVyLnNlbmQoYWN0aW9uLCBkYXRhKVxuICAgICAgfVxuXG4gICAgICByZXR1cm4gcmVzXG4gICAgfVxuICB9XG5cbiAgRGIucmVxQ2xhc3MgPSBSZXFcbiAgLy8g5pyq55m75b2V5oOF5Ya15LiL5Lyg5YWl56m65Ye95pWwXG4gIERiLmdldEFjY2Vzc1Rva2VuID0gdGhpcy5hdXRoSW5zdGFuY2UgPyB0aGlzLmF1dGhJbnN0YW5jZS5nZXRBY2Nlc3NUb2tlbi5iaW5kKHRoaXMuYXV0aEluc3RhbmNlKSA6ICgpID0+ICcnXG4gIERiLnJ1bnRpbWUgPSBydW50aW1lXG4gIGlmICh0aGlzLndzQ2xpZW50Q2xhc3MpIHtcbiAgICBEYi53c0NsYXNzID0gYWRhcHRlci53c0NsYXNzXG4gICAgRGIud3NDbGllbnRDbGFzcyA9IHRoaXMud3NDbGllbnRDbGFzc1xuICB9XG5cbiAgaWYgKCFEYi53cykge1xuICAgIERiLndzID0gbnVsbFxuICB9XG5cbiAgY2xhc3MgTmV3RGIgZXh0ZW5kcyBEYiB7XG4gICAgY29uc3RydWN0b3IoY29uZmlnPzogSURiQ29uZmlnKSB7XG4gICAgICBzdXBlcihjb25maWcpXG4gICAgfVxuXG4gICAgYXN5bmMgcnVuQ29tbWFuZHMocGFyYW1zOiBJUnVuQ29tbWFuZHNSZXEpOiBQcm9taXNlPElDb21tb25SZXM8eyBsaXN0OiBPYmplY3RbXVtdIH0+PiB7XG4gICAgICBsZXQgcmVxdWVzdCA9IERiLmNyZWF0ZVJlcXVlc3QodGhpcy5jb25maWcpXG5cbiAgICAgIHJldHVybiByZXF1ZXN0LnNlbmQoJ2RhdGFiYXNlLnJ1bkNvbW1hbmRzJywgcGFyYW1zKVxuICAgIH1cbiAgfVxuXG4gIHJldHVybiBuZXcgTmV3RGIoeyAuLi50aGlzLmNvbmZpZywgX2Zyb21BcHA6IHRoaXMsIC4uLmRiQ29uZmlnIH0pXG59XG5cbmNvbnN0IGNvbXBvbmVudDogSUNsb3VkYmFzZUNvbXBvbmVudCA9IHtcbiAgbmFtZTogQ09NUE9ORU5UX05BTUUsXG4gIGVudGl0eToge1xuICAgIGRhdGFiYXNlLFxuICB9LFxufVxudHJ5IHtcbiAgY2xvdWRiYXNlLnJlZ2lzdGVyQ29tcG9uZW50KGNvbXBvbmVudClcbn0gY2F0Y2ggKGUpIHt9XG5cbmV4cG9ydCBmdW5jdGlvbiByZWdpc3RlckRhdGFiYXNlKGFwcDogSUNsb3VkYmFzZSB8IHR5cGVvZiBjbG91ZGJhc2VOUykge1xuICB0cnkge1xuICAgIGFwcC5yZWdpc3RlckNvbXBvbmVudChjb21wb25lbnQpXG4gIH0gY2F0Y2ggKGUpIHtcbiAgICBjb25zb2xlLndhcm4oZSlcbiAgfVxufVxuXG50cnkge1xuICA7KHdpbmRvdyBhcyBhbnkpLnJlZ2lzdGVyRGF0YWJhc2UgPSByZWdpc3RlckRhdGFiYXNlXG59IGNhdGNoIChlKSB7fVxuIl19
