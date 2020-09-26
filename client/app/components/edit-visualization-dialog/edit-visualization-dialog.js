import { map, find, set, get, uniq } from 'lodash';
import { copy } from 'angular';
import notification from '@/services/notification';
import { navigateTo } from '@/services/navigateTo';
import { Query } from '@/services/query';
import template from './edit-visualization-dialog.html';

// eslint-disable-next-line import/prefer-default-export
export const EditVisualizationDialog = {
  template,
  bindings: {
    resolve: '<',
    chartType: '<',
    close: '&',
    dismiss: '&'
  },
  controller($scope, $rootScope, $window, currentUser, Events, Visualization) {
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
    let folderId = null;
    const query = window.location.search.substring(1);
    const vars = query.split("&");
    for (let i=0;i<vars.length;i+=1){
      const pair = vars[i].split("=");
      if(pair[0] === "folder_id" && pair[1] !== "null")
      {folderId = pair[1]}};
     this.visualization.folder_id = folderId;
     this.visualization.query_id = this.query.id;
// console.log(this.visualization);
      Visualization.save(
        this.visualization,
        result => {
          notification.success('保存成功');
          set($rootScope, 'selectChartType', undefined);
          // console.log("初始化selectChartType=undefined");
          const visIds = map(this.query.visualizations, i => i.id);
          // console.log("visIds:"+visIds);
          const index = visIds.indexOf(result.id);
          // console.log("index:"+index);
          if (index > -1) {
            this.query.visualizations[index] = result;
            // console.log("result:"+result);
          } else {
            // new visualization
            this.query.visualizations.push(result);
            // console.log(this.query.visualizations);
            if (this.onNewSuccess) {
              this.onNewSuccess(result);
            }
          }
          const urlStr = window.location.href
          const indexStart = urlStr.indexOf("index") + 6;
          console.log("1");
          if (indexStart < 6) {// 不是跳转过来的
            navigateTo("/charts");
          } else {
            const dashboardUrl = urlStr.substring(indexStart);
            let dashUrlChange = dashboardUrl.replace(/%2F/g, "/").replace(/%3F/g, "?").replace(/%3D/g, "=") + "";
            let indexWenhao = dashUrlChange.indexOf("?") + 1;
            const temp = uniq(dashUrlChange.substring(indexWenhao).split("&"));
            // console.log(temp);

            let indexTail = dashUrlChange.indexOf("dashboards");
            dashUrlChange = dashUrlChange.substring(indexTail);
            indexWenhao = dashUrlChange.indexOf("?") + 1;
            dashUrlChange = dashUrlChange.substring(0, indexWenhao);
            for (let i = 0; i < temp.length; i += 1) {
              dashUrlChange = dashUrlChange + temp[i] + "&";
            }
            
            // 去掉最后一个&
            dashUrlChange = dashUrlChange.substring(0, dashUrlChange.length-1);
            // 0806add无参数时跳转错误
            indexTail = dashUrlChange.indexOf("dashboards");
            dashUrlChange = dashUrlChange.substring(indexTail);
            // console.log(dashUrlChange);
            navigateTo(dashUrlChange);
          }




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
