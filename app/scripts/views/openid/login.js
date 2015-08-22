/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

define([
  'cocktail',
  'views/base',
  'stache!templates/openid/login',
  'lib/session'
],
function (Cocktail, BaseView, Template, Session) {
  'use strict';

  var View = BaseView.extend({
    template: Template,
    className: 'openid-sign-in',

    initialize: function (options) {
      BaseView.prototype.initialize.call(this, options);
      options = options || {};

      Session.clear();
      this.user.clearSignedInAccount();
    },

    beforeRender: function () {
      var self = this;
      if (OPENID_SESSION.err) {
        throw new Error(OPENID_SESSION.err);
      }
      var account = self.user.initAccount({
        uid: OPENID_SESSION.uid,
        sessionToken: OPENID_SESSION.session,
        keyFetchToken: OPENID_SESSION.key,
        verified: true,
        unwrapBKey: OPENID_SESSION.unwrap,
        email: OPENID_SESSION.email
      });
      return self.user.setSignedInAccount(account)
        .then(function () {
          self.logScreenEvent('success');
          return self.broker.afterSignIn(account)
            .then(function (result) {
              self.navigate('settings');
              return result;
            });
        });
    },

    context: function () {
      return {};
    }
  });

  Cocktail.mixin(
    View
  );

  return View;
});
