import { isString } from 'lodash';
import { $location, $rootScope } from '@/services/ng';

export function navigateTo(url, replace = false) {
  if (isString(url)) {
    $location.url(url);
    if (replace) {
      $location.replace();
    }
    $rootScope.$applyAsync();
  }
}

export function navigateToWithSearch(url, search = {},replace = false) {
  if (isString(url)) {
    $location.path(url).search(search);
    if (replace) {
      $location.replace();
    }
    $rootScope.$applyAsync();
  }
}