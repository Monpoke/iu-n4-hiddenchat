// Generated by IcedCoffeeScript 1.7.1-c
(function() {
  var C, DH, EdDSA, EncKeyManager, Encryption, K, KeyManager, KeyManagerInterface, Signature, SignatureEngine, SignatureEngineInterface, akatch, alloc, asyncify, athrow, base64u, box, buffer_xor, bufferify, decode_sig, encode, get_sig_body, iced, konst, make_esc, unbox, __iced_k, __iced_k_noop, _ref, _ref1,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    __indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

  iced = require('iced-runtime').iced;
  __iced_k = __iced_k_noop = function() {};

  _ref = require('../kmi'), SignatureEngineInterface = _ref.SignatureEngineInterface, KeyManagerInterface = _ref.KeyManagerInterface;

  make_esc = require('iced-error').make_esc;

  encode = require('./encode');

  _ref1 = require('../util'), athrow = _ref1.athrow, bufferify = _ref1.bufferify, base64u = _ref1.base64u, buffer_xor = _ref1.buffer_xor, asyncify = _ref1.asyncify, akatch = _ref1.akatch;

  konst = require('../const');

  alloc = require('./packet/alloc').alloc;

  Signature = require('./packet/signature').Signature;

  Encryption = require('./packet/encryption').Encryption;

  EdDSA = require('../nacl/eddsa').EdDSA;

  DH = require('../nacl/dh').DH;

  K = konst.kb;

  C = konst.openpgp;

  KeyManager = (function(_super) {
    __extends(KeyManager, _super);

    function KeyManager(_arg) {
      this.key = _arg.key, this.server_half = _arg.server_half;
    }

    KeyManager.generate = function(_arg, cb) {
      var algo, err, key, klass, seed, server_half, split, ___iced_passed_deferral, __iced_deferrals, __iced_k;
      __iced_k = __iced_k_noop;
      ___iced_passed_deferral = iced.findDeferral(arguments);
      algo = _arg.algo, seed = _arg.seed, split = _arg.split, server_half = _arg.server_half, klass = _arg.klass;
      algo || (algo = EdDSA);
      klass || (klass = KeyManager);
      (function(_this) {
        return (function(__iced_k) {
          __iced_deferrals = new iced.Deferrals(__iced_k, {
            parent: ___iced_passed_deferral,
            filename: "/Users/max/src/keybase/kbpgp/src/keybase/hilev.iced",
            funcname: "KeyManager.generate"
          });
          algo.generate({
            split: split,
            seed: seed,
            server_half: server_half
          }, __iced_deferrals.defer({
            assign_fn: (function() {
              return function() {
                err = arguments[0];
                key = arguments[1];
                return server_half = arguments[2];
              };
            })(),
            lineno: 29
          }));
          __iced_deferrals._fulfill();
        });
      })(this)((function(_this) {
        return function() {
          return cb(err, new klass({
            key: key,
            server_half: server_half
          }));
        };
      })(this));
    };

    KeyManager.prototype.get_mask = function() {
      return C.key_flags.sign_data | C.key_flags.certify_keys | C.key_flags.auth;
    };

    KeyManager.prototype.fetch = function(key_ids, flags, cb) {
      var err, key, mask, s;
      s = this.key.ekid().toString('hex');
      key = null;
      mask = this.get_mask();
      if ((__indexOf.call(key_ids, s) >= 0) && (flags & mask) === flags) {
        key = this.key;
      } else {
        err = new Error("Key not found");
      }
      return cb(err, key);
    };

    KeyManager.prototype.get_keypair = function() {
      return this.key;
    };

    KeyManager.prototype.get_primary_keypair = function() {
      return this.key;
    };

    KeyManager.prototype.can_verify = function() {
      return true;
    };

    KeyManager.prototype.can_sign = function() {
      var _ref2;
      return (_ref2 = this.key) != null ? _ref2.can_sign() : void 0;
    };

    KeyManager.prototype.eq = function(km2) {
      return this.key.eq(km2.key);
    };

    KeyManager.import_private = function(_arg, cb) {
      var err, hex, key, raw, ret, ___iced_passed_deferral, __iced_deferrals, __iced_k;
      __iced_k = __iced_k_noop;
      ___iced_passed_deferral = iced.findDeferral(arguments);
      hex = _arg.hex, raw = _arg.raw;
      err = ret = null;
      if (hex != null) {
        raw = new Buffer(hex, 'hex');
      }
      (function(_this) {
        return (function(__iced_k) {
          __iced_deferrals = new iced.Deferrals(__iced_k, {
            parent: ___iced_passed_deferral,
            filename: "/Users/max/src/keybase/kbpgp/src/keybase/hilev.iced",
            funcname: "KeyManager.import_private"
          });
          EdDSA.import_private({
            raw: raw
          }, __iced_deferrals.defer({
            assign_fn: (function() {
              return function() {
                err = arguments[0];
                return key = arguments[1];
              };
            })(),
            lineno: 64
          }));
          __iced_deferrals._fulfill();
        });
      })(this)((function(_this) {
        return function() {
          if (err == null) {
            ret = new KeyManager({
              key: key
            });
          }
          return cb(err, ret);
        };
      })(this));
    };

    KeyManager.import_public = function(_arg, cb) {
      var err, hex, key, raw, ret, ___iced_passed_deferral, __iced_deferrals, __iced_k, _ref2;
      __iced_k = __iced_k_noop;
      ___iced_passed_deferral = iced.findDeferral(arguments);
      hex = _arg.hex, raw = _arg.raw;
      err = ret = null;
      if (hex != null) {
        raw = new Buffer(hex, 'hex');
      }
      _ref2 = EdDSA.parse_kb(raw), err = _ref2[0], key = _ref2[1];
      (function(_this) {
        return (function(__iced_k) {
          if (err != null) {
            (function(__iced_k) {
              __iced_deferrals = new iced.Deferrals(__iced_k, {
                parent: ___iced_passed_deferral,
                filename: "/Users/max/src/keybase/kbpgp/src/keybase/hilev.iced",
                funcname: "KeyManager.import_public"
              });
              EncKeyManager.import_public({
                raw: raw
              }, __iced_deferrals.defer({
                assign_fn: (function() {
                  return function() {
                    err = arguments[0];
                    return ret = arguments[1];
                  };
                })(),
                lineno: 76
              }));
              __iced_deferrals._fulfill();
            })(__iced_k);
          } else {
            return __iced_k(ret = new KeyManager({
              key: key
            }));
          }
        });
      })(this)((function(_this) {
        return function() {
          return cb(err, ret);
        };
      })(this));
    };

    KeyManager.prototype.check_public_eq = function(km2) {
      return this.eq(km2);
    };

    KeyManager.prototype.export_public = function(_arg, cb) {
      var asp, regen, ret;
      asp = _arg.asp, regen = _arg.regen;
      ret = this.key.ekid().toString('hex');
      return cb(null, ret);
    };

    KeyManager.prototype.export_private = function(_arg, cb) {
      var asp, err, p3skb, passphrase, res, ___iced_passed_deferral, __iced_deferrals, __iced_k;
      __iced_k = __iced_k_noop;
      ___iced_passed_deferral = iced.findDeferral(arguments);
      asp = _arg.asp, p3skb = _arg.p3skb, passphrase = _arg.passphrase;
      err = res = null;
      (function(_this) {
        return (function(__iced_k) {
          if (p3skb) {
            return __iced_k(err = new Error("No support yet for P3SKB encrypted secret key exports"));
          } else {
            (function(__iced_k) {
              __iced_deferrals = new iced.Deferrals(__iced_k, {
                parent: ___iced_passed_deferral,
                filename: "/Users/max/src/keybase/kbpgp/src/keybase/hilev.iced",
                funcname: "KeyManager.export_private"
              });
              _this.key.export_secret_key_kb({}, __iced_deferrals.defer({
                assign_fn: (function() {
                  return function() {
                    err = arguments[0];
                    return res = arguments[1];
                  };
                })(),
                lineno: 98
              }));
              __iced_deferrals._fulfill();
            })(__iced_k);
          }
        });
      })(this)((function(_this) {
        return function() {
          return cb(err, res);
        };
      })(this));
    };

    KeyManager.prototype.export_server_half = function() {
      var _ref2;
      return (_ref2 = this.server_half) != null ? _ref2.toString('hex') : void 0;
    };

    KeyManager.prototype.get_ekid = function() {
      return this.get_keypair().ekid();
    };

    KeyManager.prototype.get_fp2 = function() {
      return this.get_ekid();
    };

    KeyManager.prototype.get_fp2_formatted = function() {
      return base64u.encode(this.get_fp2());
    };

    KeyManager.prototype.get_type = function() {
      return "kb";
    };

    KeyManager.prototype.make_sig_eng = function() {
      return new SignatureEngine({
        km: this
      });
    };

    return KeyManager;

  })(KeyManagerInterface);

  EncKeyManager = (function(_super) {
    __extends(EncKeyManager, _super);

    function EncKeyManager() {
      return EncKeyManager.__super__.constructor.apply(this, arguments);
    }

    EncKeyManager.generate = function(params, cb) {
      params.algo = DH;
      params.klass = EncKeyManager;
      return KeyManager.generate(params, cb);
    };

    EncKeyManager.prototype.make_sig_eng = function() {
      return null;
    };

    EncKeyManager.prototype.can_sign = function() {
      return false;
    };

    EncKeyManager.prototype.can_verify = function() {
      return false;
    };

    EncKeyManager.prototype.can_encrypt = function() {
      return true;
    };

    EncKeyManager.prototype.can_decrypt = function() {
      var _ref2;
      return ((_ref2 = this.key) != null ? _ref2.priv : void 0) != null;
    };

    EncKeyManager.import_private = function(_arg, cb) {
      var err, hex, km, raw, ret, ___iced_passed_deferral, __iced_deferrals, __iced_k;
      __iced_k = __iced_k_noop;
      ___iced_passed_deferral = iced.findDeferral(arguments);
      hex = _arg.hex, raw = _arg.raw;
      err = ret = null;
      if (hex != null) {
        raw = new Buffer(hex, 'hex');
      }
      (function(_this) {
        return (function(__iced_k) {
          __iced_deferrals = new iced.Deferrals(__iced_k, {
            parent: ___iced_passed_deferral,
            filename: "/Users/max/src/keybase/kbpgp/src/keybase/hilev.iced",
            funcname: "EncKeyManager.import_private"
          });
          EncKeyManager.generate({
            seed: raw
          }, __iced_deferrals.defer({
            assign_fn: (function() {
              return function() {
                err = arguments[0];
                return km = arguments[1];
              };
            })(),
            lineno: 140
          }));
          __iced_deferrals._fulfill();
        });
      })(this)((function(_this) {
        return function() {
          return cb(err, km);
        };
      })(this));
    };

    EncKeyManager.prototype.get_mask = function() {
      return C.key_flags.encrypt_comm | C.key_flags.encrypt_storage;
    };

    EncKeyManager.import_public = function(_arg, cb) {
      var err, hex, key, raw, ret, _ref2;
      hex = _arg.hex, raw = _arg.raw;
      err = ret = null;
      if (hex != null) {
        raw = new Buffer(hex, 'hex');
      }
      _ref2 = DH.parse_kb(raw), err = _ref2[0], key = _ref2[1];
      if (err == null) {
        ret = new EncKeyManager({
          key: key
        });
      }
      return cb(err, ret);
    };

    return EncKeyManager;

  })(KeyManager);

  unbox = function(_arg, cb) {
    var armored, binary, encrypt_for, esc, packet, rawobj, res, ___iced_passed_deferral, __iced_deferrals, __iced_k;
    __iced_k = __iced_k_noop;
    ___iced_passed_deferral = iced.findDeferral(arguments);
    armored = _arg.armored, binary = _arg.binary, rawobj = _arg.rawobj, encrypt_for = _arg.encrypt_for;
    esc = make_esc(cb, "unbox");
    (function(_this) {
      return (function(__iced_k) {
        if ((armored == null) && (rawobj == null) && (binary == null)) {
          (function(__iced_k) {
            __iced_deferrals = new iced.Deferrals(__iced_k, {
              parent: ___iced_passed_deferral,
              filename: "/Users/max/src/keybase/kbpgp/src/keybase/hilev.iced"
            });
            athrow(new Error("need either 'armored' or 'binary' or 'rawobj'"), esc(__iced_deferrals.defer({
              lineno: 164
            })));
            __iced_deferrals._fulfill();
          })(__iced_k);
        } else {
          return __iced_k();
        }
      });
    })(this)((function(_this) {
      return function() {
        if (armored != null) {
          binary = new Buffer(armored, 'base64');
        }
        (function(__iced_k) {
          if (binary != null) {
            (function(__iced_k) {
              __iced_deferrals = new iced.Deferrals(__iced_k, {
                parent: ___iced_passed_deferral,
                filename: "/Users/max/src/keybase/kbpgp/src/keybase/hilev.iced"
              });
              akatch((function() {
                return encode.unseal(binary);
              }), esc(__iced_deferrals.defer({
                assign_fn: (function() {
                  return function() {
                    return rawobj = arguments[0];
                  };
                })(),
                lineno: 169
              })));
              __iced_deferrals._fulfill();
            })(__iced_k);
          } else {
            return __iced_k();
          }
        })(function() {
          (function(__iced_k) {
            __iced_deferrals = new iced.Deferrals(__iced_k, {
              parent: ___iced_passed_deferral,
              filename: "/Users/max/src/keybase/kbpgp/src/keybase/hilev.iced"
            });
            asyncify(alloc(rawobj), esc(__iced_deferrals.defer({
              assign_fn: (function() {
                return function() {
                  return packet = arguments[0];
                };
              })(),
              lineno: 171
            })));
            __iced_deferrals._fulfill();
          })(function() {
            (function(__iced_k) {
              __iced_deferrals = new iced.Deferrals(__iced_k, {
                parent: ___iced_passed_deferral,
                filename: "/Users/max/src/keybase/kbpgp/src/keybase/hilev.iced"
              });
              packet.unbox({
                encrypt_for: encrypt_for
              }, esc(__iced_deferrals.defer({
                assign_fn: (function() {
                  return function() {
                    return res = arguments[0];
                  };
                })(),
                lineno: 172
              })));
              __iced_deferrals._fulfill();
            })(function() {
              if (res.keypair != null) {
                res.km = new KeyManager({
                  key: res.keypair
                });
              }
              if (res.sender_keypair != null) {
                res.sender_km = new KeyManager({
                  key: res.sender_keypair
                });
              }
              if (res.receiver_keypair != null) {
                res.receiver_km = new KeyManager({
                  key: res.receiver_keypair
                });
              }
              return cb(null, res, binary);
            });
          });
        });
      };
    })(this));
  };

  box = function(_arg, cb) {
    var anonymous, armored, encrypt_for, esc, msg, packed, packet, sealed, sign_with, ___iced_passed_deferral, __iced_deferrals, __iced_k;
    __iced_k = __iced_k_noop;
    ___iced_passed_deferral = iced.findDeferral(arguments);
    msg = _arg.msg, sign_with = _arg.sign_with, encrypt_for = _arg.encrypt_for, anonymous = _arg.anonymous;
    esc = make_esc(cb, "box");
    msg = bufferify(msg);
    (function(_this) {
      return (function(__iced_k) {
        if (encrypt_for != null) {
          (function(__iced_k) {
            __iced_deferrals = new iced.Deferrals(__iced_k, {
              parent: ___iced_passed_deferral,
              filename: "/Users/max/src/keybase/kbpgp/src/keybase/hilev.iced"
            });
            Encryption.box({
              sign_with: sign_with,
              encrypt_for: encrypt_for,
              plaintext: msg,
              anonymous: anonymous
            }, esc(__iced_deferrals.defer({
              assign_fn: (function() {
                return function() {
                  return packet = arguments[0];
                };
              })(),
              lineno: 189
            })));
            __iced_deferrals._fulfill();
          })(__iced_k);
        } else {
          (function(__iced_k) {
            __iced_deferrals = new iced.Deferrals(__iced_k, {
              parent: ___iced_passed_deferral,
              filename: "/Users/max/src/keybase/kbpgp/src/keybase/hilev.iced"
            });
            Signature.box({
              km: sign_with,
              payload: msg
            }, esc(__iced_deferrals.defer({
              assign_fn: (function() {
                return function() {
                  return packet = arguments[0];
                };
              })(),
              lineno: 191
            })));
            __iced_deferrals._fulfill();
          })(__iced_k);
        }
      });
    })(this)((function(_this) {
      return function() {
        packed = packet.frame_packet();
        sealed = encode.seal({
          obj: packed,
          dohash: false
        });
        armored = sealed.toString('base64');
        return cb(null, armored, sealed);
      };
    })(this));
  };

  get_sig_body = function(_arg) {
    var armored, decoded, err, _ref2;
    armored = _arg.armored;
    _ref2 = decode_sig({
      armored: armored
    }), err = _ref2[0], decoded = _ref2[1];
    return [err, decoded != null ? decoded.body : void 0];
  };

  decode_sig = function(_arg) {
    var armored, decoded;
    armored = _arg.armored;
    decoded = {
      body: new Buffer(armored, 'base64'),
      type: C.message_types.generic,
      payload: armored
    };
    return [null, decoded];
  };

  SignatureEngine = (function(_super) {
    __extends(SignatureEngine, _super);

    function SignatureEngine(_arg) {
      this.km = _arg.km;
    }

    SignatureEngine.prototype.get_km = function() {
      return this.km;
    };

    SignatureEngine.prototype.get_unverified_payload_from_raw_sig_body = function(_arg, cb) {
      var body, esc, packet, rawobj, ___iced_passed_deferral, __iced_deferrals, __iced_k;
      __iced_k = __iced_k_noop;
      ___iced_passed_deferral = iced.findDeferral(arguments);
      body = _arg.body;
      esc = make_esc(cb, "get_payload_from_raw_sig_body");
      (function(_this) {
        return (function(__iced_k) {
          __iced_deferrals = new iced.Deferrals(__iced_k, {
            parent: ___iced_passed_deferral,
            filename: "/Users/max/src/keybase/kbpgp/src/keybase/hilev.iced",
            funcname: "SignatureEngine.get_unverified_payload_from_raw_sig_body"
          });
          akatch((function() {
            return encode.unseal(body);
          }), esc(__iced_deferrals.defer({
            assign_fn: (function() {
              return function() {
                return rawobj = arguments[0];
              };
            })(),
            lineno: 226
          })));
          __iced_deferrals._fulfill();
        });
      })(this)((function(_this) {
        return function() {
          (function(__iced_k) {
            __iced_deferrals = new iced.Deferrals(__iced_k, {
              parent: ___iced_passed_deferral,
              filename: "/Users/max/src/keybase/kbpgp/src/keybase/hilev.iced",
              funcname: "SignatureEngine.get_unverified_payload_from_raw_sig_body"
            });
            asyncify(alloc(rawobj), esc(__iced_deferrals.defer({
              assign_fn: (function() {
                return function() {
                  return packet = arguments[0];
                };
              })(),
              lineno: 227
            })));
            __iced_deferrals._fulfill();
          })(function() {
            return cb(null, packet.payload);
          });
        };
      })(this));
    };

    SignatureEngine.prototype.get_body = function(args, cb) {
      var err, res, _ref2;
      _ref2 = get_sig_body(args, cb), err = _ref2[0], res = _ref2[1];
      return cb(err, res);
    };

    SignatureEngine.prototype.box = function(msg, cb) {
      var armored, esc, out, raw, ___iced_passed_deferral, __iced_deferrals, __iced_k;
      __iced_k = __iced_k_noop;
      ___iced_passed_deferral = iced.findDeferral(arguments);
      esc = make_esc(cb, "SignatureEngine::box");
      (function(_this) {
        return (function(__iced_k) {
          __iced_deferrals = new iced.Deferrals(__iced_k, {
            parent: ___iced_passed_deferral,
            filename: "/Users/max/src/keybase/kbpgp/src/keybase/hilev.iced",
            funcname: "SignatureEngine.box"
          });
          box({
            msg: msg,
            sign_with: _this.km
          }, esc(__iced_deferrals.defer({
            assign_fn: (function() {
              return function() {
                armored = arguments[0];
                return raw = arguments[1];
              };
            })(),
            lineno: 240
          })));
          __iced_deferrals._fulfill();
        });
      })(this)((function(_this) {
        return function() {
          out = {
            type: "kb",
            armored: armored,
            kb: armored,
            raw: raw
          };
          return cb(null, out);
        };
      })(this));
    };

    SignatureEngine.prototype.unbox = function(msg, cb, opts) {
      var a, arg, b, binary, err, esc, payload, res, ___iced_passed_deferral, __iced_deferrals, __iced_k;
      __iced_k = __iced_k_noop;
      ___iced_passed_deferral = iced.findDeferral(arguments);
      if (opts == null) {
        opts = {};
      }
      esc = make_esc(cb, "SignatureEngine::unbox");
      err = payload = null;
      arg = Buffer.isBuffer(msg) ? {
        binary: msg
      } : {
        armored: msg
      };
      (function(_this) {
        return (function(__iced_k) {
          __iced_deferrals = new iced.Deferrals(__iced_k, {
            parent: ___iced_passed_deferral,
            filename: "/Users/max/src/keybase/kbpgp/src/keybase/hilev.iced",
            funcname: "SignatureEngine.unbox"
          });
          unbox(arg, esc(__iced_deferrals.defer({
            assign_fn: (function() {
              return function() {
                res = arguments[0];
                return binary = arguments[1];
              };
            })(),
            lineno: 251
          })));
          __iced_deferrals._fulfill();
        });
      })(this)((function(_this) {
        return function() {
          if (!res.km.eq(_this.km)) {
            a = res.km.get_ekid().toString('hex');
            b = _this.km.get_ekid().toString('hex');
            err = new Error("Got wrong signing key: " + a + " != " + b);
          } else {
            payload = res.payload;
          }
          return cb(err, payload, binary);
        };
      })(this));
    };

    return SignatureEngine;

  })(SignatureEngineInterface);

  module.exports = {
    box: box,
    unbox: unbox,
    KeyManager: KeyManager,
    EncKeyManager: EncKeyManager,
    decode_sig: decode_sig,
    get_sig_body: get_sig_body
  };

}).call(this);