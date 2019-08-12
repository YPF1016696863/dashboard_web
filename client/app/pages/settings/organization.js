import settingsMenu from '@/services/settingsMenu';
import notification from '@/services/notification';
import template from './organization.html';

function OrganizationSettingsCtrl($http, clientConfig, Events, appSettings) {
  Events.record('view', 'page', 'org_settings');

  this.settings = {};
  $http.get(appSettings.server.backendUrl + '/api/settings/organization').then((response) => {
    this.settings = response.data.settings;
  });

  this.update = (key) => {
    $http.post(appSettings.server.backendUrl + '/api/settings/organization', { [key]: this.settings[key] }).then((response) => {
      this.settings = response.data.settings;
      notification.success('Settings changes saved.');

      if (this.disablePasswordLoginToggle() && this.settings.auth_password_login_enabled === false) {
        this.settings.auth_password_login_enabled = true;
        this.update('auth_password_login_enabled');
      }
    }).catch(() => {
      notification.error('Failed saving changes.');
    });
  };

  this.dateFormatList = clientConfig.dateFormatList;
  this.googleLoginEnabled = clientConfig.googleLoginEnabled;

  // eslint-disable-next-line max-len
  this.disablePasswordLoginToggle = () => (clientConfig.googleLoginEnabled || this.settings.auth_saml_enabled) === false;
}

export default function init(ngModule) {
  settingsMenu.add({
    permission: 'admin',
    title: 'HEADER.SETTINGS',
    path: 'settings/organization',
    order: 6,
  });

  ngModule.component('organizationSettingsPage', {
    template,
    controller: OrganizationSettingsCtrl,
  });

  return {
    '/settings/organization': {
      template: '<organization-settings-page></organization-settings-page>',
      title: 'Organization Settings',
    },
  };
}

init.init = true;
