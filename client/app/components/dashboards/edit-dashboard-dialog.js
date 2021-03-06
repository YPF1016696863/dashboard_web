import { isEmpty } from 'lodash';
import { policy } from '@/services/policy';
import template from './edit-dashboard-dialog.html';

const EditDashboardDialog = {
  bindings: {
    resolve: '<',
    close: '&',
    dismiss: '&',
  },
  template,
  controller($location, $http, Events, appSettings) {
    'ngInject';

    this.dashboard = this.resolve.dashboard;
    this.policy = policy;

    this.isFormValid = () => !isEmpty(this.dashboard.name);

    this.saveDashboard = () => {
      if (!this.isFormValid()) {
        return;
      }

      this.saveInProgress = true;

      $http
        .post(appSettings.server.backendUrl + '/api/dashboards', {
          name: this.dashboard.name,
        })
        .success((response) => {
          this.close();
          $location
            .path(`/dashboard/${response.slug}`)
            .search('edit')
            .replace();
        });
      Events.record('create', 'dashboard');
    };
  },
};

export default function init(ngModule) {
  ngModule.component('editDashboardDialog', EditDashboardDialog);
}

init.init = true;
