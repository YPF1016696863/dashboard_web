import debug from 'debug';
import { includes, extend } from 'lodash';

// eslint-disable-next-line import/no-mutable-exports
export let Auth = null;

export const currentUser = {
  canEdit(object) {
    const userId = object.user_id || (object.user && object.user.id);
    return this.hasPermission('admin') || (userId && userId === this.id);
  },

  hasPermission(permission) {
    return includes(this.permissions, permission);
  },

  get isAdmin() {
    return this.hasPermission('admin');
  },
};

export const clientConfig = {};
export const messages = [];

const logger = debug('datavis:auth');
const session = { loaded: false };

function updateSession(sessionData) {
  logger('Updating session to be:', sessionData);
  extend(session, sessionData, { loaded: true });
  extend(currentUser, session.user);
  extend(clientConfig, session.client_config);
  extend(messages, session.messages);
}

function AuthService($window, $location, $q, $http, appSettings) {
  return {
    isAuthenticated() {
      return session.loaded && session.user.id;
    },
    login() {
      const next = encodeURI($location.url());
      logger('Calling login with next = %s', next);
      window.location.href = `/login`;
    },
    logout() {
      logger('Logout.');
      return $http.post(appSettings.server.backendUrl + '/api/logout').then((response) => {
        window.location.href = `/login`;
      });
    },
    loadSession() {
      logger('Loading session');
      if (session.loaded && session.user.id) {
        logger('Resolving with local value.');
        return $q.resolve(session);
      }

      this.setApiKey(null);
      return $http.get(appSettings.server.backendUrl + '/api/session').then((response) => {
        updateSession(response.data);
        return session;
      });
    },
    loadConfig() {
      logger('Loading config');
      return $http.get(appSettings.server.backendUrl + '/api/config').then((response) => {
        updateSession({ client_config: response.data.client_config, user: { permissions: [] }, messages: [] });
        return response.data;
      });
    },
    setApiKey(apiKey) {
      logger('Set API key to: %s', apiKey);
      this.apiKey = apiKey;
    },
    getApiKey() {
      return this.apiKey;
    },
    requireSession() {
      logger('Requested authentication');
      if (this.isAuthenticated()) {
        return $q.when(session);
      }
      return this.loadSession()
        .then(() => {
          if (this.isAuthenticated()) {
            logger('Loaded session');
            return session;
          }
          logger('Need to login, redirecting');
          this.login();
        })
        .catch(() => {
          logger('Need to login, redirecting');
          this.login();
        });
    },
  };
}

function apiKeyHttpInterceptor($injector) {
  return {
    request(config) {
      const apiKey = $injector.get('Auth').getApiKey();
      if (apiKey) {
        config.headers.Authorization = `Key ${apiKey}`;
      }

      return config;
    },
  };
}

export default function init(ngModule) {
  ngModule.factory('Auth', AuthService);
  ngModule.value('currentUser', currentUser);
  ngModule.value('clientConfig', clientConfig);
  ngModule.value('messages', messages);
  ngModule.factory('apiKeyHttpInterceptor', apiKeyHttpInterceptor);

  ngModule.config(($httpProvider) => {
    $httpProvider.defaults.withCredentials = true;
    $httpProvider.interceptors.push('apiKeyHttpInterceptor');
  });

  ngModule.run(($injector) => {
    Auth = $injector.get('Auth');
  });
}

init.init = true;
