import notification from '@/services/notification';
import template from './home.html';


function HomeCtrl(Events, Dashboard, Query, $http, $translate, messages) {

  this.$translate = $translate;

  this.messages = messages;
}

export default function init(ngModule) {
  ngModule.component('homePage', {
    template,
    controller: HomeCtrl
  });

  return {
    '/': {
      template: '<home-page></home-page>',
      layout: 'fixed',
      title: 'DataVis - 数据可视化',
    },
  };
}

init.init = true;
