import {
  pick,
  some,
  find,
  minBy,
  map,
  intersection,
  isArray,
  isObject,
  set,
  get
} from 'lodash';
import {
  SCHEMA_NOT_SUPPORTED,
  SCHEMA_LOAD_ERROR
} from '@/services/data-source';
import * as _ from 'lodash';
import { navigateTo } from '@/services/navigateTo';
import getTags from '@/services/getTags';
import { policy } from '@/services/policy';
import Notifications from '@/services/notifications';
import ScheduleDialog from '@/components/queries/ScheduleDialog';
import notification from '@/services/notification';
import { Group } from '@/services/group';
import $ from 'jquery';
import template from './content-layout.html';


const DEFAULT_TAB = 'table';

function QueryViewCtrl(
  $scope,
  Events,
  $route,
  $routeParams,
  $location,
  $window,
  $timeout,
  $interval,
  $q,
  KeyboardShortcuts,
  Title,
  AlertDialog,
  clientConfig,
  $uibModal,
  currentUser,
  Query,
  DataSource,
  Visualization,
  appSettings
) {
  function getQueryResult(maxAge, selectedQueryText) {
    if (maxAge === undefined) {
      maxAge = $location.search().maxAge;
    }

    if (maxAge === undefined) {
      maxAge = -1;
    }

    $scope.showLog = false;
    // if ($scope.isDirty) { // 未保存时执行
    $scope.queryResult = $scope.query.getQueryResultByText(
      maxAge,
      selectedQueryText
    );
    // } else {
    //   $scope.queryResult = $scope.query.getQueryResult(maxAge);
    // }
  }

  function getDataSourceId() {
    // Try to get the query's data source id
    let dataSourceId = $scope.query.data_source_id;

    // If there is no source yet, then parse what we have in localStorage
    //   e.g. `null` -> `NaN`, malformed data -> `NaN`, "1" -> 1
    if (dataSourceId === undefined) {
      dataSourceId = parseInt(localStorage.lastSelectedDataSourceId, 10);
    }

    // If we had an invalid value in localStorage (e.g. nothing, deleted source),
    // then use the first data source
    const isValidDataSourceId =
      !isNaN(dataSourceId) &&
      some($scope.dataSources, ds => ds.id === dataSourceId);

    if (!isValidDataSourceId) {
      dataSourceId = $scope.dataSources[0].id;
    }

    // Return our data source id
    return dataSourceId;
  }

  $scope.redisDataType = [{ id: 1, name: "data" }, { id: 2, name: "data2" }];
  $scope.selectedDataType = { value: $scope.redisDataType[0] };

  function getSchema(refresh = undefined, dataType) {
    // TODO: is it possible this will be called before dataSource is set?
    $scope.schema = [];
    $scope.dataSource.getSchema(refresh, dataType).then(data => {
      if (data.schema) {
        $scope.schema = data.schema;
        $scope.schema.forEach(table => {
          table.collapsed = true;
        });
      } else if (data.error.code === SCHEMA_NOT_SUPPORTED) {
        $scope.schema = undefined;
      } else if (data.error.code === SCHEMA_LOAD_ERROR) {
        notification.error('Schema refresh failed.', 'Please try again later.');
      } else {
        notification.error('Schema refresh failed.', 'Please try again later.');
      }
    });

  }


  function checkSchema(refresh = undefined) {
    // TODO: is it possible this will be called before dataSource is set?
    const preLen = $scope.checkSchema === undefined ? 0 : $scope.checkSchema.length;
    // console.log("$scope:", $scope.selectType);
    $scope.changeFlag = false;
    // _.set($scope.options,'number',_.get($scope.selectType.value,'number',200));
    
    $scope.checkSchema = [];

    $scope.dataSource.getSchema(refresh).then(data => {
      if (data.schema) {
        $scope.checkSchema = data.schema;
        const currLen = $scope.checkSchema === undefined ? 0 : $scope.checkSchema.length;
        // console.log("preLen:", preLen,"currLen:", currLen);
        if (preLen !== currLen && preLen !== 0 || _.get($scope.selectType.value,'number',200)<currLen) {
          $scope.changeFlag = true;
          console.log("修改了:", $scope.changeFlag);
        }

      } else {
        $scope.changeFlag = true;
      }
      $scope.$apply();
    });
  }

  setTimeout(function () {
    checkSchema(true);
  }, 500);


  this.autoRefresh = () => {
    $timeout(() => {
      // console.log("定时",_.get($scope.selectType.value,'rate',5));
      checkSchema(true);
    }, _.get($scope.selectType.value,'rate',5) * 1000).then(() => this.autoRefresh());
  };

  $scope.refreshSchema = () => { getSchema(true, $scope.selectedDataType.value.name); this.autoRefresh(); }

  function refreshNumber() {
    _.set($scope.selectType.value,'number',$scope.options.number);
  }
  $scope.$watch('options.number', refreshNumber, true);

  function refreshRate() {
    _.set($scope.selectType.value,'rate',$scope.options.rate);
  }
  $scope.$watch('options.rate', refreshRate, true);

  function updateDataSources(dataSources) {
    // Filter out data sources the user can't query (or used by current query):
    function canUseDataSource(dataSource) {
      return (
        !dataSource.view_only || dataSource.id === $scope.query.data_source_id
      );
    }
    $scope.dataSources = dataSources.filter(canUseDataSource);

    if ($scope.dataSources.length === 0) {
      $scope.noDataSources = true;
      return;
    }

    if ($scope.query.isNew()) {
      $scope.query.data_source_id = getDataSourceId();
    }

    $scope.dataSource = find(
      dataSources,
      ds => ds.id === $scope.query.data_source_id
    );

    $scope.canCreateQuery = some(dataSources, ds => !ds.view_only);

    getSchema(false, $scope.selectedDataType.value.name);
  }

  $scope.updateSelectedQuery = selectedQueryText => {
    $scope.selectedQueryText = selectedQueryText;
  };

  $scope.executeQuery = () => {
    console.log("executeQuery");
    if (!$scope.canExecuteQuery()) {
      return;
    }

    if (!$scope.query.query) {
      return;
    }

    getQueryResult(0, $scope.selectedQueryText);
    $scope.lockButton(true);
    $scope.cancelling = false;

    Notifications.getPermissions();
  };

  $scope.selectedTab = DEFAULT_TAB;
  $scope.currentUser = currentUser;
  $scope.dataSource = {};
  $scope.query = $route.current.locals.query;
  $scope.showPermissionsControl = clientConfig.showPermissionsControl;

  const shortcuts = {
    'mod+enter': $scope.executeQuery,
    'alt+enter': $scope.executeQuery
  };

  if ($scope.query.readOnly()) {
    notification.warning('只读权限的用户无法修改更新数据.');
    navigateTo("/queries?queryid=" + $scope.query.id);
  }

  KeyboardShortcuts.bind(shortcuts);

  $scope.$on('$destroy', () => {
    KeyboardShortcuts.unbind(shortcuts);
  });

  if ($scope.query.hasResult() || $scope.query.paramsRequired()) {
    getQueryResult();
  }
  $scope.queryExecuting = false;

  $scope.isQueryOwner =
    currentUser.id === $scope.query.user.id ||
    currentUser.hasPermission('admin');
  $scope.canEdit = currentUser.canEdit($scope.query) || $scope.query.can_edit;
  $scope.canViewSource = currentUser.hasPermission('view_source');

  $scope.canExecuteQuery = () =>
    $scope.query.is_safe ||
    (currentUser.hasPermission('execute_query') &&
      !$scope.dataSource.view_only);

  $scope.getQueryType = () => {
    // console.log("$scope.dataSource.type",$scope.dataSource.type);
    return $scope.dataSource && $scope.dataSource.type
  };

  $scope.canForkQuery = () => !$scope.dataSource.view_only;

  $scope.canScheduleQuery = true; // currentUser.hasPermission('schedule_query');

  if ($route.current.locals.dataSources) {
    $scope.dataSources = $route.current.locals.dataSources;
    updateDataSources($route.current.locals.dataSources);
  } else {
    $scope.dataSources = DataSource.query(updateDataSources);
  }

  // in view mode, latest dataset is always visible
  // source mode changes this behavior
  $scope.showDataset = true;
  $scope.showLog = false;

  $scope.lockButton = lock => {
    $scope.queryExecuting = lock;
  };

  $scope.showApiKey = () => {
    $uibModal.open({
      component: 'apiKeyDialog',
      resolve: {
        query: $scope.query
      }
    });
  };

  $scope.duplicateQuery = () => {
    // To prevent opening the same tab, name must be unique for each browser
    const tabName = 'duplicatedQueryTab' + Math.random().toString();

    $window.open('', tabName);
    Query.fork({ id: $scope.query.id }, newQuery => {
      const queryUrl = newQuery.getUrl(true);
      $window.open(queryUrl, tabName);
    });
  };

  $scope.saveTags = tags => {
    $scope.query.tags = tags;
    $scope.saveQuery({}, { tags: $scope.query.tags });
  };

  $scope.loadTags = () =>
    getTags(appSettings.server.backendUrl + '/api/queries/tags').then(tags =>
      map(tags, t => t.name)
    );

  $scope.saveQuery = (customOptions, data) => {
    // console.log(333333333333333);
    let request = data;
    if (request) {
      // Don't save new query with partial data
      if ($scope.query.isNew()) {
        return $q.reject();
      }
      request.id = $scope.query.id;
      request.version = $scope.query.version;

    } else {
      request = pick($scope.query, [
        'schedule',
        'query',
        'id',
        'description',
        'name',
        'data_source_id',
        'options',
        'latest_query_data_id',
        'version',
        'is_draft',
        'folder_id'
      ]);

      // console.log($scope.query.id); //获取数据集的id
      const queryId = $scope.query.id

      const allGroupsP = Group.query({ filter: true }).$promise;  // 获取所有分组记录

      Promise.all([allGroupsP])
        .then(result => {
          const allGroups = result[0];
          _.forEach(allGroups, group => {
            // console.log(group);             // 每一个分组集合，group.id
            Group.addQuery({ id: group.id, query_id: queryId });
          });
        })

    }

    const options = Object.assign(
      {},
      {
        successMessage: '查询已保存',
        errorMessage: '无法保存查询'
      },
      customOptions
    );

    if (options.force) {
      delete request.version;
    }

    function overwrite() {
      options.force = true;
      $scope.saveQuery(options, data);
    }

    return Query.save(
      request,
      updatedQuery => {

        notification.success(options.successMessage);
        $scope.query.version = updatedQuery.version;
      },
      error => {
        if (error.status === 409) {
          const errorMessage =
            '该查询已经被其他用户修改.';

          if ($scope.isQueryOwner) {
            const title = 'Overwrite Query';
            const message =
              errorMessage +
              '<br>请确认是否使用您的版本进行覆盖?';
            const confirm = { class: 'btn-warning', title: 'Overwrite' };

            AlertDialog.open(title, message, confirm).then(overwrite);
          } else {
            notification.error(
              '修改未保存',
              errorMessage +
              ' 请复制/备份您的修改并刷新页面.',
              { duration: null }
            );
          }
        } else {
          notification.error(options.errorMessage);
        }
      }
    ).$promise;
  };

  $scope.togglePublished = () => {
    $scope.query.is_draft = !$scope.query.is_draft;
    $scope.saveQuery(undefined, { is_draft: $scope.query.is_draft });
  };

  $scope.saveDescription = desc => {
    $scope.query.description = desc;
    $scope.saveQuery(undefined, { description: $scope.query.description });
  };

  $scope.saveName = name => {
    $scope.query.name = name;
    if (
      $scope.query.is_draft &&
      clientConfig.autoPublishNamedQueries &&
      $scope.query.name !== 'New Query'
    ) {
      $scope.query.is_draft = false;
    }

    $scope.saveQuery(undefined, {
      name: $scope.query.name,
      is_draft: $scope.query.is_draft
    });
  };

  $scope.cancelExecution = () => {
    $scope.cancelling = true;
    $scope.queryResult.cancelExecution();
  };

  $scope.archiveQuery = () => {
    function archive() {
      Query.delete(
        { id: $scope.query.id },
        () => {
          $scope.query.is_archived = true;
          $scope.query.schedule = null;
        },
        () => {
          notification.error('Query could not be archived.');
        }
      );
    }

    const title = '删除查询';
    const message =
      '确定想要删除这个查询吗？<br/> 所有的用到这个可视化部件的警报与可视化面板都会被删除';
    const confirm = { class: 'btn-warning', title: 'Archive' };

    AlertDialog.open(title, message, confirm).then(archive);
  };

  $scope.updateDataSource = () => {
    localStorage.lastSelectedDataSourceId = $scope.query.data_source_id;

    $scope.query.latest_query_data = null;
    $scope.query.latest_query_data_id = null;

    if ($scope.query.id) {
      Query.save(
        {
          id: $scope.query.id,
          data_source_id: $scope.query.data_source_id,
          latest_query_data_id: null
        },
        updatedQuery => {
          $scope.query.version = updatedQuery.version;
        }
      );
    }

    $scope.dataSource = find(
      $scope.dataSources,
      ds => ds.id === $scope.query.data_source_id
    );

    getSchema(false, $scope.selectedDataType.value.name);
    $scope.executeQuery();
  };


  $scope.changeDataType = () => {
    console.log("selected", $scope.selectedDataType.value.name);
  }

  $scope.setVisualizationTab = visualization => {
    $scope.selectedTab = visualization.id;
    $location.hash(visualization.id);
  };

  $scope.deleteVisualization = ($e, vis) => {
    $e.preventDefault();

    const title = undefined;
    const message = `确认删除 ${vis.name} ?`;
    const confirm = { class: 'btn-danger', title: '删除' };

    AlertDialog.open(title, message, confirm).then(() => {
      Visualization.delete(
        { id: vis.id },
        () => {
          if ($scope.selectedTab === String(vis.id)) {
            $scope.selectedTab = DEFAULT_TAB;
            $location.hash($scope.selectedTab);
          }
          $scope.query.visualizations = $scope.query.visualizations.filter(
            v => vis.id !== v.id
          );
        },
        () => {
          notification.error(
            '删除图表时出现错误.',
            "获取该图表正在被Dashboard使用当中?"
          );
        }
      );
    });
  };

  $scope.$watch('query.name', () => {
    Title.set($scope.query.name);
  });

  $scope.$watch('queryResult && queryResult.getData()', data => {
    if (!data) {
      return;
    }

    $scope.filters = $scope.queryResult.getFilters();
  });

  $scope.$watch('queryResult && queryResult.getStatus()', status => {
    if (!status) {
      return;
    }

    if (status === 'done') {
      const ranSelectedQuery =
        $scope.query.query !== $scope.queryResult.query_result.query;
      if (!ranSelectedQuery) {
        $scope.query.latest_query_data_id = $scope.queryResult.getId();
        $scope.query.queryResult = $scope.queryResult;
      }

      Notifications.showNotification('DataVis', `${$scope.query.name} updated.`);
    } else if (status === 'failed') {
      Notifications.showNotification(
        'DataVis',
        `${$scope.query.name} failed to run: ${$scope.queryResult.getError()}`
      );
    }

    if (status === 'done' || status === 'failed') {
      $scope.lockButton(false);
    }

    if ($scope.queryResult.getLog() != null) {
      $scope.showLog = true;
    }
  });

  function getVisualization(visId) {
    // eslint-disable-next-line eqeqeq
    return find($scope.query.visualizations, item => item.id == visId);
  }

  $scope.openVisualizationEditor = visId => {
    const visualization = getVisualization(visId);
    function openModal() {
      $uibModal.open({
        windowClass: 'modal-xl',
        component: 'editVisualizationDialog',
        resolve: {
          query: $scope.query,
          visualization,
          queryResult: $scope.queryResult,
          onNewSuccess: () => $scope.setVisualizationTab
        }
      });
    }

    if ($scope.query.isNew()) {
      $scope.saveQuery().then(query => {
        // Because we have a path change, we need to "signal" the next page to
        // open the visualization editor.
        // TODO: we don't really need this. Just need to assign query to $scope.query
        // and maybe a few more small changes. Not worth handling this now, but also
        // we shouldn't copy this bizzare method to the React codebase.
        $location.path(query.getSourceLink()).hash('add');
      });
    } else {
      openModal();
    }
  };

  if ($location.hash() === 'add') {
    $location.hash(null);
    $scope.openVisualizationEditor();
  }
  const intervals = clientConfig.queryRefreshIntervals;
  const allowedIntervals = policy.getQueryRefreshIntervals();
  $scope.refreshOptions = isArray(allowedIntervals)
    ? intersection(intervals, allowedIntervals)
    : intervals;

  $scope.showScheduleForm = false;
  $scope.editSchedule = () => {
    if (!$scope.canEdit || !$scope.canScheduleQuery) {
      return;
    }
    ScheduleDialog.showModal({
      schedule: $scope.query.schedule,
      refreshOptions: $scope.refreshOptions
    }).result.then(schedule => {
      $scope.query.schedule = schedule;
      $scope.saveQuery();
    });
  };
  $scope.closeScheduleForm = () => {
    $scope.$apply(() => {
      $scope.showScheduleForm = false;
    });
  };

  $scope.onSimpleQueryClick = (v) => {
    // console.log(v?'当前为简单模式':'当前为高级模式');
    set($scope, 'simpleQuery', !v);
  }


  $scope.openAddToDashboardForm = visId => {
    const visualization = getVisualization(visId);
    $uibModal.open({
      component: 'addToDashboardDialog',
      size: 'sm',
      resolve: {
        query: $scope.query,
        vis: visualization
      }
    });
  };

  $scope.showEmbedDialog = (query, visId) => {
    const visualization = getVisualization(visId);
    $uibModal.open({
      component: 'embedCodeDialog',
      resolve: {
        query,
        visualization
      }
    });
  };

  $scope.$watch(
    () => $location.hash(),
    hash => {
      // eslint-disable-next-line eqeqeq
      const exists = find($scope.query.visualizations, item => item.id == hash);
      let visualization = minBy($scope.query.visualizations, viz => viz.id);
      if (!isObject(visualization)) {
        visualization = {};
      }
      $scope.selectedTab = (exists ? hash : visualization.id) || DEFAULT_TAB;
    }
  );

  $scope.showManagePermissionsModal = () => {
    $uibModal.open({
      component: 'permissionsEditor',
      resolve: {
        aclUrl: {
          url:
            appSettings.server.backendUrl +
            `/api/queries/${$routeParams.queryId}/acl`
        },
        owner: $scope.query.user
      }
    });
  };

}

export default function init(ngModule) {
  ngModule.controller('QueryViewCtrl', QueryViewCtrl);

  return {
    '/queries/:queryId': {
      template,
      layout: 'fixed',
      controller: 'QueryViewCtrl',
      reloadOnSearch: false,
      resolve: {
        query: (Query, $route) => {
          'ngInject';

          return Query.get({ id: $route.current.params.queryId }).$promise;
        }
      }
    }
  };
}

init.init = true;
