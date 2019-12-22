import * as _ from 'lodash';

import debug from 'debug';
import PromiseRejectionError from '@/lib/promise-rejection-error';
import { ErrorHandler } from './error-handler';
import template from './template.html';

const logger = debug('datavis:app-view');

const handler = new ErrorHandler();

const layouts = {
  default: {
    showHeader: false,
    hideLeftPanel: true,
    bodyClass: false,
    bodyClassBackgroundColor: ''
  },
  settings:{
    showHeader: true,
    hideLeftPanel: false,
    bodyClass: 'fixed-layout',
    bodyClassBackgroundColor: ''
  },
  login:{
    showHeader: true,
    hideLeftPanel: true,
    bodyClass: 'fixed-layout',
    bodyClassBackgroundColor: ''
  },
  fixed: {
    showHeader: true,
    bodyClass: 'fixed-layout',
    bodyClassBackgroundColor: ''
  },
  dashboard: {
    showHeader: false,
    bodyClass: 'fixed-layout',
    bodyClassBackgroundColor: ''
  },
  dashboardPreview: {
    showHeader: false,
    hideLeftPanel: true,
    bodyClass: 'fixed-layout',
    bodyClassBackgroundColor: ''
  },
  dashboardView: {
    showHeader: false,
    hideLeftPanel: true,
    bodyClass: 'fixed-layout',
    bodyClassBackgroundColor: ''
  },
  defaultSignedOut: {
    showHeader: false,
    hideLeftPanel: true,
    bodyClassBackgroundColor: ''
  }
};

function selectLayout(route) {
  let layout = layouts.default;
  if (route.layout) {
    layout = layouts[route.layout] || layouts.default;
  } else if (!route.authenticated) {
    layout = layouts.defaultSignedOut;
  }
  return layout;
}

class AppViewComponent {
  constructor($rootScope, $route, Auth) {
    this.$rootScope = $rootScope;
    this.layout = layouts.defaultSignedOut;
    this.handler = handler;

    this.isAuthenticated = Auth.isAuthenticated();

    $rootScope.$on('$routeChangeStart', (event, route) => {
      this.isAuthenticated = Auth.isAuthenticated();
      this.handler.reset();
      // In case we're handling $routeProvider.otherwise call, there will be no
      // $$route.
      const $$route = route.$$route || { authenticated: true };

      if ($$route.authenticated) {
        // For routes that need authentication, check if session is already
        // loaded, and load it if not.
        logger('Requested authenticated route: ', route);
        if (!Auth.isAuthenticated()) {
          event.preventDefault();
          // Auth.requireSession resolves only if session loaded
          Auth.requireSession().then(() => {
            this.applyLayout($$route);
            $route.reload();
          });
        }
      }
    });

    $rootScope.$on('$routeChangeSuccess', (event, route) => {
      const $$route = route.$$route || { authenticated: true };
      this.applyLayout($$route);
    });

    $rootScope.$on(
      '$routeChangeError',
      (event, current, previous, rejection) => {
        const $$route = current.$$route || { authenticated: true };
        this.applyLayout($$route);
        let reason = rejection;
        if(_.isEqual(_.get(current.$$route,'pageID',''),"publicShare")) {
          reason = "无法显示，请检查是否打开共享并确认在链接中使用正确的token";
        }
        throw new PromiseRejectionError(reason);
      }
    );
  }

  applyLayout(route) {
    this.layout = selectLayout(route);
    this.$rootScope.bodyClass = this.layout.bodyClass;
    this.$rootScope.theme = {
      theme: 'dark',
      bodyBackgroundColor: 'dashboard-dark-theme',
      bodyBackgroundImage: '',
      dashboardHeaderBackgroundColor: 'widget-dark-theme',
      dashboardHeaderTitleColor: 'header-title-dark-theme',
      widgetBackgroundColor: 'widget-dark-theme',
      queryLinkTextColor: 'query-link-dark-theme',
      widgetHeaderTextColor: 'widget-header-text-dark-theme',
      widgetFooterTextColor: 'widget-footer-text-dark-theme',
      widgetActionPanelBackgroundColor: 'widget-action-panel-dark-theme',
      dashboardFooterFontColor: 'dashboard-footer-font-color-dark-theme',
      dashboardTableTextColor: 'dashboard-widget-table-text-dark-theme',
      dashboardTableHeaderTextColor:
        'dashboard-widget-table-header-text-dark-theme',
      dashboardWidgetScrollBar: 'dashboard-widget-scrollbox-dark',
      dashboardHeaderButtonColor: true
    };
  }
}

export default function init(ngModule) {
  ngModule.factory(
    '$exceptionHandler',
    () =>
      function exceptionHandler(exception) {
        handler.process(exception);
      }
  );

  ngModule.component('appView', {
    template,
    controller: AppViewComponent
  });
}

init.init = true;
