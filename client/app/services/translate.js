// eslint-disable-line import/no-mutable-exports

export default function init(ngModule) {
  ngModule.config(($translateProvider) => {
    $translateProvider.translations('en', {
      HEADER: {
        DASHBOARDS: 'Dashboards',
        QUERIES: 'Queries',
        ALERTS: 'Alerts',
        EDIT_PROFILE: 'Edit Profile',
        CREATE: 'Create',
        SEARCH_PLACEHOLDER: 'Search queries...',
      },
      HOME: {
        WELCOME: 'Welcome to zkhoneycomb DataVis BI system',
        DESCRIPTION: 'Connect to any data source, easily visualize and share your data',
      },
    });

    $translateProvider.translations('cn', {
      HEADER: {
        DASHBOARDS: '数据可视化面板',
        QUERIES: '查询',
        ALERTS: '系统警报',
        EDIT_PROFILE: '编辑个人资料',
        CREATE: '创建',
        SEARCH_PLACEHOLDER: '查询...',
      },
      HOME: {
        WELCOME: '欢迎使用中科蜂巢DataVis BI数据可视化系统',
        DESCRIPTION: '连接到任何数据源，轻松可视化和共享您的数据',
      },
    });

    $translateProvider.preferredLanguage('cn');
  });
}

init.init = true;
