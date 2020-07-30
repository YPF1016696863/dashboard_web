/* eslint-disable func-names */
import * as _ from 'lodash';
import PromiseRejectionError from '@/lib/promise-rejection-error';
import notification from '@/services/notification';
import { policy } from '@/services/policy';

import { durationHumanize } from '@/filters';
import template from './dashboard-view.html';

import './dashboard-view.less';

// import './switch.css'

function ViewDashboardCtrl(
    $routeParams,
    $location,
    $timeout,
    $q,
    $uibModal,
    $scope,
    $rootScope,
    Title,
    AlertDialog,
    Dashboard,
    currentUser,
    clientConfig,
    Events,
    appSettings
) {
    this.saveInProgress = false;
    const vm = this;

    $scope.$watch(
        function () {
            return vm.slugId;
        },
        function (data) {
            vm.loadDashboard();
        }
    );



    //    $scope. $watch(watchFn,watchAction,deepWatch);

    $scope.$watch(
        function () {
            return vm.widgetData;
        },
        function (data) {
            if (vm.widgetData && vm.widgetData.widget) {
                // console.log(vm.widgetData.widget);
                vm.addWidget(
                    vm.widgetData.widget,
                    vm.widgetData.paramMapping ? vm.widgetData.paramMapping : {}
                );
            }
        }
    );


    $scope.$watch(
        function () {
            return vm.dashboardBgImg;
        },
        function (data) {
            if (_.isEmpty(vm.dashboardBgImg)) {
                vm.dashboardStyle = {};
                return;
            }
            vm.dashboardStyle = {
                'background-image': 'url("' + vm.dashboardBgImg + '")',
                'background-position': 'center',
                'background-repeat': 'no-repeat',
                'background-size': 'cover'
            };
        }
    );



    this.gridNum = 3;
    this.modeList = false;
    this.saveDelay = false;
    this.editBtnClickedWhileSaving = false;
    this.layoutEditing = true;// false
    this.isFullscreen = false;
    this.refreshRate = null;// null
    this.isGridDisabled = false;// false
    this.updateGridItems = null;
    this.showPermissionsControl = clientConfig.showPermissionsControl;
    this.globalParameters = [];
    this.isDashboardOwner = false;
    this.isLayoutDirty = false;
    this.widgetList = [];
    this.modifiedWidget = [];

    // Dashboard Header default style

    const bodyBackgroundImage = $rootScope.theme.bodyBackgroundImage ?
        $rootScope.theme.bodyBackgroundImage :
        '';
    const widgetBackgroundColor = bodyBackgroundImage ?
        'widget-dark-theme-bg2 ' :
        'widget-dark-theme';

    $rootScope.theme = {
        theme: 'dark',
        bodyBackgroundColor: 'dashboard-dark-theme',
        bodyBackgroundImage,
        dashboardHeaderBackgroundColor: 'widget-dark-theme',
        dashboardHeaderTitleColor: 'header-title-dark-theme',
        widgetBackgroundColor,
        queryLinkTextColor: 'query-link-dark-theme',
        widgetHeaderTextColor: 'widget-header-text-dark-theme',
        widgetFooterTextColor: 'widget-footer-text-dark-theme',
        widgetActionPanelBackgroundColor: 'widget-action-panel-dark-theme',
        dashboardFooterFontColor: 'dashboard-footer-font-color-dark-theme',
        dashboardTableTextColor: 'dashboard-widget-table-text-dark-theme',
        dashboardTableHeaderTextColor: 'dashboard-widget-table-header-text-dark-theme',
        dashboardWidgetScrollBar: 'dashboard-widget-scrollbox-dark',
        dashboardHeaderButtonColor: true
    };
    //

    this.refreshRates = clientConfig.dashboardRefreshIntervals.map(interval => ({
        name: durationHumanize(interval),
        rate: interval,
        enabled: true
    }));


    const allowedIntervals = policy.getDashboardRefreshIntervals();

    if (_.isArray(allowedIntervals)) {
        _.each(this.refreshRates, rate => {
            rate.enabled = allowedIntervals.indexOf(rate.rate) >= 0;
        });
    }

    this.setRefreshRate = (rate, load = true) => {
        this.refreshRate = rate;
        if (rate !== null) {
            if (load) {
                this.refreshDashboard();
            }
            this.autoRefresh();
        }
    };

    this.extractGlobalParameters = () => {
        this.widgetList = this.dashboard.widgets;
        // console.log(this.widgetList);//  出现查询出错
        // console.log(this.widgetList[0].query.queryResult.query_result);
        this.globalParameters = this.dashboard.getParametersDefs();
        // 由参数设置url
        const params = _.extend({}, $location.search());
        this.globalParameters.forEach((param) => {
            _.extend(params, param.toUrlParams());
        });
        $location.search(params);
    };

    $scope.$on('dashboard.update-parameters', () => {
        this.extractGlobalParameters();
    });

    // 右键弹框 组件列表控制
    this.openRight = false;
    this.meau = () => {
        this.openRight = true
    }

    this.onRightClose = () => {
        this.openRight = false;
    }

    this.noDefault = false;
    this.checkedWidgetIndashboard = [];
    this.onRightSubmit = (checkedWidget, flag) => {
        this.openRight = false;
        this.noDefault = flag;
        // console.log(checkedWidget);
        this.checkedWidgetIndashboard = [];
        this.checkedWidgetIndashboard = checkedWidget;
        vm.refreshDashboard();
    }


    this.openParamDraw = false;
    this.openParameterDialog = () => {
        this.openParamDraw = true;
    }

    this.onPramClose = () => {
        this.openParamDraw = false;
    }

    this.onSubmit = (updatedParameters) => {
        // Read parameter and reset url
        // 由参数设置url
        const params = _.extend({}, $location.search());
        updatedParameters.forEach((param) => {
            _.extend(params, param.toUrlParams());
        });
        $location.search(params);
        vm.refreshDashboard();
        $scope.$applyAsync();
        this.openParamDraw = false;
    }



    const collectFilters = (dashboard, forceRefresh) => { // ... ,true
        const originalWidget = this.dashboard.widgets;
        // console.log(originalWidget);
        // console.log(this.modeList);
        if (this.layoutEditing) {// 固定
            this.modifiedWidget = originalWidget;
        } else {
            if (this.modeList) {  // 打开列表模式 清空组件 显示列表
                this.modifiedWidget = [];
                for (let i = 0; i < originalWidget.length; i += 1) {
                    for (let j = 0; j < this.checkedWidgetIndashboard.length; j += 1) {
                        // console.log(originalWidget[i].id+"::::"+this.checkedWidgetIndashboard[j]+"");
                        if (originalWidget[i].id + "" === this.checkedWidgetIndashboard[j] + "") { // 通过组件id来筛选
                            this.modifiedWidget.push(originalWidget[i]);
                        }
                    }
                }
                // console.log(this.modifiedWidget);
            } else {
                this.modifiedWidget = [];

                let status = [];
                status = _.map(originalWidget, "data.errorMessage");
                const originalWidgetView = [];

                for (let i = 0, j = 0; i < status.length; i += 1) {
                    if (status[i] === undefined) {
                        originalWidgetView[j] = originalWidget[i];// 滤出有效的组件
                        j += 1;
                    }
                }


                // 计算位置大小
                const step = 6 / this.gridNum;
                const colArr = [];
                for (let i = 0, j = 0; i < 6;) {
                    colArr[j] = step * (j);
                    j += 1;
                    i += step;
                }
                // // const colArr=[0,2,4];
                for (let i = 0; i < originalWidgetView.length; i += 1) {
                    const newPosition = {
                        autoHeight: false,
                        col: colArr[i % this.gridNum],
                        // col: 4,
                        maxSizeX: 6,
                        maxSizeY: 1000,
                        minSizeX: 1,
                        minSizeY: 1,
                        // row: i!==0&&i%3===0?8:0,// c此处写成一个即可？or动态累加
                        row: 0,
                        sizeX: step,
                        sizeY: 8
                    }
                    originalWidgetView[i].options.position = newPosition;
                }

                this.modifiedWidget = originalWidgetView;
            }

        }

        const queryResultPromises = _.compact(
            this.dashboard.widgets.map(widget => { // this.dashboard.widgets 出现查询出错
                widget.getParametersDefs(); // Force widget to read parameters values from URL
                return widget.load(forceRefresh);
            })
        );

        $q.all(queryResultPromises).then(queryResults => {
            // console.log(queryResults); // 有数据
            const filters = {};
            queryResults.forEach(queryResult => {
                const queryFilters = queryResult.getFilters();
                queryFilters.forEach(queryFilter => {
                    const hasQueryStringValue = _.has(
                        $location.search(),
                        queryFilter.name
                    );

                    if (!(hasQueryStringValue || dashboard.dashboard_filters_enabled)) {
                        // If dashboard filters not enabled, or no query string value given,
                        // skip filters linking.
                        return;
                    }

                    if (hasQueryStringValue) {
                        queryFilter.current = $location.search()[queryFilter.name];
                    }

                    if (!_.has(filters, queryFilter.name)) {
                        const filter = _.extend({}, queryFilter);
                        filters[filter.name] = filter;
                        filters[filter.name].originFilters = [];
                    }

                    // TODO: merge values.
                    filters[queryFilter.name].originFilters.push(queryFilter);
                });
            });

            this.filters = _.values(filters);
            this.filtersOnChange = filter => {
                _.each(filter.originFilters, originFilter => {
                    originFilter.current = filter.current;
                });
            };
        }).catch(err => {
            console.log(err);
        });
    };


    const renderDashboard = (dashboard, force) => {
        Title.set(dashboard.name);
        this.extractGlobalParameters();
        collectFilters(dashboard, force);
    };

    this.loadDashboard = _.throttle(force => {
        Dashboard.get({ slug: this.slugId },
            dashboard => {
                this.dashboard = dashboard;
                console.log(dashboard);
                console.log(dashboard.background_image);
                const image = dashboard.background_image.slice(1, -1).split(",")[0];
                const rate = dashboard.background_image.slice(1, -1).split(",")[1];
                this.modeList = dashboard.background_image.slice(1, -1).split(",")[2] === "true";
                // console.log(this.modeList);
                this.gridNum = dashboard.background_image.slice(1, -1).split(",")[3];
                const imgType = dashboard.background_image.slice(1, -1).split(",")[4];
                this.layoutEditing = dashboard.background_image.slice(1, -1).split(",")[5] === "true";
                // console.log(this.layoutEditing);
                // console.log(dashboard.background_image);
                if (imgType === "tianchong" || imgType === "lasheng") {
                    // Get dashboard style
                    this.dashboardStyle = {
                        'background-image': 'url("' + image + '")',
                        'background-position': 'center',
                        'background-repeat': 'no-repeat',
                        'background-size': 'cover'
                    };
                } else if (imgType === "pingpu") {
                    this.dashboardStyle = {
                        'background-image': 'url("' + image + '")',
                        'background-position': 'center',
                        'background-repeat': 'repeat',
                    };
                }

                this.isDashboardOwner =
                    currentUser.id === dashboard.user.id ||
                    currentUser.hasPermission('admin');
                renderDashboard(dashboard, force);
                // 大屏刷新频率设置
                // if ($location.search().refresh !== undefined) {
                const refreshRate = Math.max(
                    1,
                    rate === undefined ? 1 : rate
                );

                this.setRefreshRate({
                    name: durationHumanize(refreshRate),
                    rate: refreshRate
                },
                    false
                );

            },
            rejection => {
                const statusGroup = Math.floor(rejection.status / 100);
                if (statusGroup === 5) {
                    // recoverable errors - all 5** (server is temporarily unavailable
                    // for some reason, but it should get up soon).
                    this.loadDashboard();
                } else {
                    // all kind of 4** errors are not recoverable, so just display them
                    throw new PromiseRejectionError(rejection);
                }
            }
        );
    }, 1000);

    // this.loadDashboard();

    this.refreshDashboard = () => {
        renderDashboard(this.dashboard, true);
    };

    this.autoRefresh = () => {

        $timeout(() => {
            this.refreshDashboard();
        }, this.refreshRate.rate * 1000).then(() => this.autoRefresh());
    };

}

// eslint-disable-next-line import/prefer-default-export
export const ViewDashboard = {
    template,
    bindings: {
        slugId: '<',
        widgetData: '<',
        dashboardBgImg: '<',
        editing: '<',
        rateData: '<'
    },
    controller: ViewDashboardCtrl
};

export default function init(ngModule) {
    ngModule.component('viewDashboard', ViewDashboard);
    ngModule.directive('ngRightClick', function ($parse) {
        return function (scope, element, attrs) {
            const fn = $parse(attrs.ngRightClick);
            element.bind('contextmenu', function (event) {
                this.isShow = true;
                event.preventDefault();
                fn(scope, { $event: event });
            })
        }
    });
}

init.init = true;