import { map, find,set,get } from 'lodash';
import { copy } from 'angular';
import notification from '@/services/notification';
import template from './edit-visualization-dialog.html';
import {navigateTo} from '@/services/navigateTo';
import { Query } from '@/services/query';

// eslint-disable-next-line import/prefer-default-export
export const EditVisualizationDialog = {
  template,
  bindings: {
    resolve: '<',
    chartType: '<',
    close: '&',
    dismiss: '&'
  },
  controller($scope,$rootScope, $window, currentUser, Events, Visualization) {
    'ngInject';

    const vm = this;

    this.query = this.resolve.query;
    this.queries = [];
    this.queryResult = this.resolve.queryResult;
    this.originalVisualization = this.resolve.visualization;
    this.onNewSuccess = this.resolve.onNewSuccess;
    this.visualization = copy(this.originalVisualization);
    this.visTypes = Visualization.visualizationTypes;

    this.querySearchCb = id => {
      $scope.queryId = id && id.length ? id[0] : null;
    };

    /*
    $scope.$watch(
      () => {
        return this.query.id;
      },
      () => {
        if (this.query.id === 'unset') {
          this.showForm = true;
        } else {
          this.showForm = true;
        }
      }
    );
    */

    $scope.$watch(
      () => {
        return this.chartType;
      },
      () => {
        const isExist = find(
          this.visTypes,
          visType => visType.type === this.chartType
        );

        if (isExist) {
          vm.visualization.type = this.chartType;
          this.typeChanged(this.chartType);
        }
      }
    );

    // Don't allow to change type after creating visualization
    this.canChangeType = !(this.visualization && this.visualization.id);

    this.newVisualization = () => ({
      type: Visualization.defaultVisualization.type,
      name: Visualization.defaultVisualization.name,
      description: '',
      options: Visualization.defaultVisualization.defaultOptions
    });
    if (!this.visualization) {
      this.visualization = this.newVisualization();
    }

    this.typeChanged = oldType => {
      const type = this.visualization.type;
      // if not edited by user, set name to match type
      // todo: this is wrong, because he might have edited it before.
      if (
        type &&
        oldType !== type &&
        this.visualization &&
        !this.visForm.name.$dirty
      ) {
        this.visualization.name =
          Visualization.visualizations[this.visualization.type].name;
      }

      // Bring default options
      if (type && oldType !== type && this.visualization) {
        this.visualization.options =
          Visualization.visualizations[this.visualization.type].defaultOptions;
      }
    };

    this.submit = () => {
      if (this.visualization.id) {
        Events.record('update', 'visualization', this.visualization.id, {
          type: this.visualization.type          
        });
        
      } else {
        Events.record('create', 'visualization', null, {
          type: this.visualization.type
        });
      }

      this.visualization.query_id = this.query.id;

      Visualization.save(
        this.visualization,
        result => {
          notification.success('保存成功');          
          set($rootScope, 'selectChartType', undefined);
          // console.log("初始化selectChartType=undefined");
          const visIds = map(this.query.visualizations, i => i.id);
          const index = visIds.indexOf(result.id);
          if (index > -1) {
            this.query.visualizations[index] = result;
          } else {
            // new visualization
            this.query.visualizations.push(result);
            if (this.onNewSuccess) {
              this.onNewSuccess(result);
            }
          }
          navigateTo("/charts");
        },
        () => {
          notification.error('无法保存');
        }
      );
    };
  }
};

export default function init(ngModule) {
  ngModule.component('editVisualizationDialog', EditVisualizationDialog);
}

init.init = true;
