// eslint-disable-line import/no-mutable-exports
import Chinese from '@/resources/i18n/locale-zh.json';
import English from '@/resources/i18n/locale-en.json';

export default function init(ngModule) {
  ngModule.config(($translateProvider) => {
    $translateProvider.translations('zh', Chinese);
    $translateProvider.translations('en', English);
    $translateProvider.preferredLanguage('zh');

    $translateProvider.useLocalStorage();
  });
}

init.init = true;
