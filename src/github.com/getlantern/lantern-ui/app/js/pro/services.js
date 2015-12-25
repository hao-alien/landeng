'use strict';

angular.module('app.services')
.service('pro-api', [
  '$q',
  '$http',
  '$timeout',
  'localStorageService',
  'modelSrvc',
  'PRO_API',
  'MODAL',
  function($q, $http, $timeout, localStorageService, modelSrvc, PRO_API, MODAL) {
    function getDeviceID() {
      return modelSrvc.model.settings.InstanceID;
    }
    function getUserID() {
      return modelSrvc.model.settings.UserID;
    }
    function getProToken() {
      return modelSrvc.model.settings.ProToken;
    }

    function prepareHeaders() {
      var headers = {};
      if (typeof getDeviceID() !== undefined) {
        headers["X-Lantern-Device-Id"] = getDeviceID();
      }
      if (typeof getUserID() !== undefined) {
        headers["X-Lantern-User-Id"] = getUserID();
      }
      if (typeof getProToken() !== undefined) {
        headers["X-Lantern-Pro-Token"] = getProToken();
      }
      return headers;
    }

    function getIdempotencyKey() {
      var key = localStorageService.get('idempotencyKey');
      if (typeof key == 'undefined') {
        var instanceID = getDeviceID();
        key = instanceID + Date.now();
        localStorageService.get('idempotencyKey', key);
      }
    }
    function removeIdempotencyKey() {
      localStorageService.get('idempotencyKey');
    }

    function request(method, endpoint, data) {
      return $http(method, PRO_API + endpoint, data, {
        headers: prepareHeaders()
      })
      .then(function(response) {
        var result = JSON.parse(response.data);
        if (result.status === 'ok') {
          return result;
        }
      }, function(response) {
        var result = JSON.parse(response.data);
        $q.reject(result, response);
      });
    }

    function purchase(stripeToken, plan, email) {
      return request('post', '/purchase-user-create', {
        token: stripeToken,
        idempotencyKey: getIdempotencyKey(),
        stripeEmail: email,
        plan: plan
      })
      .then(function(result) {
        removeIdempotencyKey();
      }, function(result, response) {
        // TODO: handle failure
      });
    }

    function extend(stripeToken, plan) {
      return request('post', '/purchase-user-upgrade', {
        token: stripeToken,
        idempotencyKey: getIdempotencyKey(),
        plan: plan
      }, {
        headers: prepareHeaders()
      })
      .then(function(result) {
        removeIdempotencyKey();
      }, function(result, response) {
        // TODO: handle failure
      });
    }

    function info() {
      return request('get', '/user');
    }

    function charges() {
      return request('get', '/charges');
    }

    return {'purchase': purchase, 'extend': extend};
  }]);

