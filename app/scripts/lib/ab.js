/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

define([
  'lib/storage'
  ], function (Storage) {

  function AB() {
    this._storage = new Storage(localStorage);
    this._roll = this._getRoll();
    this._experiments = {};
    this._data = {};
  }

  AB.prototype = {
    _getRoll: function () {
      var roll = this._storage.get('roll');
      if (!roll) {
        var rand = new Uint32Array(1);
        crypto.getRandomValues(rand);
        roll = rand[0];
        this._storage.set('roll', roll);
      }
      return roll;
    },
    isEnabled: function () {
      var args = Array.prototype.slice.call(arguments, 1)
      var name = arguments[0]
      var enabled = this._experiments[name].apply(this, args);
      this._data[name] = enabled;
      return enabled;
    },
    addExperiment: function (name, parameters) {
      var fn;
      if (parameters.test) {
        var re = new RegExp(parameters.test);
        fn = function (x) { return re.test(x); }
      }
      else if (parameters.percentEnabled) {
        var enabled = (this._roll % 100) < parameters.percentEnabled;
        fn = function () { return enabled; }
      }
      this._experiments[name] = fn;
    },
    load: function (experiments) {
      for (name in experiments) {
        this.addExperiment(name, experiments[name]);
      }
    },
    data: function () {
      return this._data;
    }
  };

  return new AB();
});
