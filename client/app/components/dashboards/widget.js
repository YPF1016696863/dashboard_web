import { filter } from 'lodash';
import TextboxDialog from '@/components/dashboards/TextboxDialog';
import EditParameterMappingsDialog from '@/components/dashboards/EditParameterMappingsDialog';
import {navigateTo} from '@/services/navigateTo';

import template from './widget.html';
import widgetDialogTemplate from './widget-dialog.html';

import './widget.less';
import './widget-dialog.less';

const WidgetDialog = {
  template: widgetDialogTemplate,
  bindings: {
    resolve: '<',
    close: '&',
    dismiss: '&',
  },
  controller() {
    this.widget = this.resolve.widget;
  },
};

function DashboardWidgetCtrl($scope, $location, $uibModal, $window, $rootScope, $timeout, Events, currentUser) {
  this.canViewQuery = currentUser.hasPermission('view_query');
  this.editTextBox = () => {
    TextboxDialog.showModal({
      dashboard: this.dashboard,
      text: this.widget.text,
      onConfirm: (text) => {
        this.widget.text = text;
        return this.widget.save();
      },
    });
  };

  this.expandVisualization = () => {
    $uibModal.open({
      component: 'widgetDialog',
      resolve: {
        widget: this.widget,
      },
      size: 'lg',
    });
  };

  this.hasParameters = () => this.widget.query.getParametersDefs().length > 0;

  this.editParameterMappings = () => {
    EditParameterMappingsDialog.showModal({
      dashboard: this.dashboard,
      widget: this.widget,
    }).result.then((valuesChanged) => {
      this.localParameters = null;

      // refresh widget if any parameter value has been updated
      if (valuesChanged) {
        $timeout(() => this.refresh());
      }
      $scope.$applyAsync();
      $rootScope.$broadcast('dashboard.update-parameters');
    });
  };

  this.localParametersDefs = () => {
    if (!this.localParameters) {
      this.localParameters = filter(
        this.widget.getParametersDefs(),
        param => !this.widget.isStaticParam(param),
      );
    }
    return this.localParameters;
  };

  this.deleteWidget = () => {
    if (!$window.confirm(`确定删除 "${this.widget.getName()}" ?`)) {
      return;
    }

    this.widget.delete().then(() => {
      if (this.deleted) {
        this.deleted({});
      }
    });
  };

  this.editWidget = () => {// 跳转编辑组件页面
    navigateTo("query/"+this.widget.query.id+"/charts/"+this.widget.visualization.id);
  };


  this.load = (refresh = false) => {
    const maxAge = $location.search().maxAge;
    this.widget.load(refresh, maxAge);
  };

  this.refresh = () => {
    this.load(true);
  };

  if (this.widget.visualization) {

    this.type = 'visualization';
    this.load();
  } else if (this.widget.restricted) {
    this.type = 'restricted';
  } else {
    this.type = 'textbox';
  }
}

export default function init(ngModule) {
  ngModule.component('widgetDialog', WidgetDialog);
  ngModule.component('dashboardWidget', {
    template,
    controller: DashboardWidgetCtrl,
    bindings: {
      widget: '<',
      public: '<',
      dashboard: '<',
      deleted: '&onDelete'
    },
  });
}

init.init = true;
