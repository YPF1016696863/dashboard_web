import debug from 'debug';

import { policy } from '@/services/policy';

import logoUrl from '@/assets/images/brandImg.png';
import frontendVersion from '@/version.json';
import template from './app-header.html';
import './app-header.css';

const logger = debug('datavis:appHeader');

function controller($rootScope, $location, $route, $uibModal,
  Auth, currentUser, clientConfig, Dashboard, Query) {
  this.logoUrl = logoUrl;
  this.basePath = clientConfig.basePath;
  this.currentUser = currentUser;

  this.isAuthenticated = Auth.isAuthenticated();

  this.showSourcesMenu = currentUser.isAdmin;
  this.showQueriesMenu = currentUser.hasPermission('view_query');
  this.showAlertsLink = currentUser.hasPermission('list_alerts');
  this.showNewQueryMenu = currentUser.hasPermission('create_query');
  this.showSettingsMenu = currentUser.hasPermission('list_users');
  this.showDashboardsMenu = currentUser.hasPermission('list_dashboards');

  this.frontendVersion = frontendVersion;
  this.backendVersion = clientConfig.version;
  this.newVersionAvailable = clientConfig.newVersionAvailable && currentUser.isAdmin;

  this.reload = () => {
    logger('Reloading dashboards and queries.');
  };

  this.reload();

  this.newDashboard = () => {
    $uibModal.open({
      component: 'editDashboardDialog',
      resolve: {
        dashboard: () => ({ name: null, layout: null }),
      },
    });
  };

  this.searchQueries = () => {
    $location.path('/queries').search({ q: this.searchTerm });
    $route.reload();
  };

  this.logout = () => {
    Auth.logout();
  };
}

export default function init(ngModule) {
  ngModule.component('appHeader', {
    template,
    controller,
  });
}

init.init = true;
