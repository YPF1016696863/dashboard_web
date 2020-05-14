import { isString, get } from 'lodash';
import { $http, $sanitize, appSettings } from '@/services/ng';
import notification from '@/services/notification';
import { clientConfig } from '@/services/auth';

export let User = null; // eslint-disable-line import/no-mutable-exports

function disableResource(user) {
  return appSettings.server.backendUrl + `/api/users/${user.id}/disable`;
}

function enableUser(user) {
  const userName = $sanitize(user.name);

  return $http
    .delete(disableResource(user))
    .then((data) => {
      notification.success(`User ${userName} is now enabled.`);
      user.is_disabled = false;
      user.profile_image_url = data.data.profile_image_url;
      return data;
    })
    .catch((response) => {
      let message = get(response, 'data.message', response.statusText);
      if (!isString(message)) {
        message = 'Unknown error';
      }
      notification.error('Cannot enable user', message);
    });
}

function disableUser(user) {
  const userName = $sanitize(user.name);
  return $http
    .post(disableResource(user))
    .then((data) => {
      notification.warning(`User ${userName} is now disabled.`);
      user.is_disabled = true;
      user.profile_image_url = data.data.profile_image_url;
      return data;
    })
    .catch((response = {}) => {
      const message = get(response, 'data.message', response.statusText);
      notification.error('Cannot disable user', message);
    });
}

function deleteUser(user) {
  const userName = $sanitize(user.name);
  return $http
    .delete(appSettings.server.backendUrl + `/api/users/${user.id}`)
    .then((data) => {
      notification.warning(`User ${userName} has been deleted.`);
      return data;
    })
    .catch((response = {}) => {
      const message = get(response, 'data.message', response.statusText);
      notification.error('Cannot delete user', message);
    });
}

function convertUserInfo(user) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    profileImageUrl: user.profile_image_url,
    apiKey: user.api_key,
    groupIds: user.groups,
    isDisabled: user.is_disabled,
    isInvitationPending: user.is_invitation_pending,
  };
}

function regenerateApiKey(user) {
  return $http
    .post(appSettings.server.backendUrl + `/api/users/${user.id}/regenerate_api_key`)
    .then(({ data }) => {
      notification.success('The API Key has been updated.');
      return data.api_key;
    })
    .catch((response = {}) => {
      const message = get(response, 'data.message', response.statusText);
      notification.error('Failed regenerating API Key', message);
    });
}

function sendPasswordReset(user) {
  return $http
    .post(appSettings.server.backendUrl + `/api/users/${user.id}/reset_password`, {password:'Abcd1234'})
    .then(({ data }) => {
      notification.success('密码重置为初始密码.');
    })
    .catch((response = {}) => {
      const message = get(response, 'data.message', response.statusText);
      notification.error('密码重置失败,请重试', message);
    });
}

function resendInvitation(user) {
  return $http
    .post(appSettings.server.backendUrl + `/api/users/${user.id}/invite`)
    .then(({ data }) => {
      if (clientConfig.mailSettingsMissing) {
        notification.warning('The mail server is not configured.');
        return data.invite_link;
      }
      notification.success('Invitation sent.');
    })
    .catch((response = {}) => {
      const message = get(response, 'data.message', response.statusText);

      notification.error('Failed to resend invitation', message);
    });
}

function UserService($resource) {
  const actions = {
    get: { method: 'GET' },
    create: { method: 'POST' },
    save: { method: 'POST' },
    query: { method: 'GET', isArray: false },
    delete: { method: 'DELETE' },
    disable: { method: 'POST', url: appSettings.server.backendUrl + '/api/users/:id/disable' },
    enable: { method: 'DELETE', url: appSettings.server.backendUrl + '/api/users/:id/disable' },
  };

  const UserResource = $resource(appSettings.server.backendUrl + '/api/users/:id', { id: '@id' }, actions);

  UserResource.enableUser = enableUser;
  UserResource.disableUser = disableUser;
  UserResource.deleteUser = deleteUser;
  UserResource.convertUserInfo = convertUserInfo;
  UserResource.regenerateApiKey = regenerateApiKey;
  UserResource.sendPasswordReset = sendPasswordReset;
  UserResource.resendInvitation = resendInvitation;

  return UserResource;
}

export default function init(ngModule) {
  ngModule.factory('User', UserService);

  ngModule.run(($injector) => {
    User = $injector.get('User');
  });
}

init.init = true;
