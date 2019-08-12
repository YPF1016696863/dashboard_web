import settingsMenu from '@/services/settingsMenu';
import template from './system.html';

// clientConfig
function SystemSettingsCtrl(localStorageService, $translate) {
  this.availableLanguages = [
    {
      code: 'zh',
      title: '简体中文',
    },
    {
      code: 'en',
      title: 'English',
    },
  ];

  this.currentLanguage = this.availableLanguages.find(lang => (lang.code === (localStorageService.get('systemLanguage') ? localStorageService.get('systemLanguage') : 'zh')));

  this.onChangeLanguage = () => {
    localStorageService.set('systemLanguage', this.currentLanguage.code);
    $translate.use(this.currentLanguage.code);
  };
}

export default function init(ngModule) {
  settingsMenu.add({
    permission: 'admin',
    title: 'HEADER.SYSTEM_SETTINGS',
    path: 'settings/system',
    order: 8,
  });

  ngModule.component('systemSettingsPage', {
    template,
    controller: SystemSettingsCtrl,
  });

  return {
    '/settings/system': {
      template: '<system-settings-page></system-settings-page>',
      title: 'System Settings',
    },
  };
}

init.init = true;
