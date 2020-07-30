import * as _ from "lodash";
import './public-dashboard.less';
import { Widget } from '@/services/widget';
import { Dashboard } from '@/services/dashboard';
import template from './public-dashboard.html';

function loadToken($route, appSettings) {
    return Promise.resolve($route.current.params.token);
}

const PublicDashboardPage = {
    template,
    bindings: {
        dashboard: '<'
    },
    controller(
        $scope,
        $rootScope,
        $timeout,
        $location,
        $http,
        $q,
        $route,
        dashboardGridOptions,
        Title,
        appSettings
    ) {
        'ngInject';

        this.globalParameters = [];
        this.dashboard = null;
        this.widgetList = [];
        this.modifiedWidget = [];
        this.gridNum = 3;
        this.layoutEditing = true;

        const vm = this;

        this.extractGlobalParameters = () => {
            this.widgetList = this.dashboard.widgets;
            this.globalParameters = this.dashboard.getParametersDefs();
            // 由参数设置url
            const params = _.extend({}, $location.search());
            this.globalParameters.forEach((param) => {
                _.extend(params, param.toUrlParams());
            });
            $location.search(params);
        };

        const collectFilters = (dashboard, forceRefresh) => {

            const originalWidget = this.dashboard.widgets;
            // console.log(originalWidget);
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

            // console.log(this.modifiedWidget);


            const queryResultPromises = _.compact(
                this.dashboard.widgets.map(widget => {
                    widget.getParametersDefs(); // Force widget to read parameters values from URL
                    return widget.load(forceRefresh);
                })
            );
        };

        const renderDashboard = (dashboard, force) => {
            Title.set(dashboard.name);
            this.extractGlobalParameters();
            collectFilters(dashboard, force);
        };

        /*
            this.dashboard.widgets = Dashboard.prepareDashboardWidgets(
              this.dashboard.widgets
            );
        */
        let rate = 2;
        this.modeList = false;
        Dashboard.public({ token: $route.current.params.token }, dashboard => {



            this.dashboard = dashboard;

            Title.set(this.dashboard.name);
            // console.log(dashboard);
            const image = dashboard.background_image.slice(1, -1).split(",")[0];
            rate =parseInt(dashboard.background_image.slice(1, -1).split(",")[1],10);
            this.modeList = dashboard.background_image.slice(1, -1).split(",")[2] === "true";
            this.gridNum = parseInt(dashboard.background_image.slice(1, -1).split(",")[3],10);
            const imgType = dashboard.background_image.slice(1, -1).split(",")[4];
            this.layoutEditing = dashboard.background_image.slice(1, -1).split(",")[5] === "true";
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

            renderDashboard(dashboard, true);

            this.autoRefresh();
        });

        this.autoRefresh = () => {
            // console.log("autoRefresh");
            $timeout(() => {
                this.refreshDashboard();
            }, rate * 1000).then(() => this.autoRefresh());
        };

        $scope.$on('dashboard.update-parameters', () => {
            this.extractGlobalParameters();
        });


        // 右键弹框 组件列表控制
        this.openRight = false;
        this.meau = () => {
            this.openRight = true;
        }

        this.onRightClose = () => {
            this.openRight = false;
        }

        this.checkedWidgetIndashboard = [];
        this.noDefault = false;
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
            this.refreshDashboard();
            $scope.$applyAsync();
            this.openParamDraw = false;
        }

        // const refreshRate = Math.max(30, parseFloat($location.search().refresh));
        const refreshRate = 2;
        if (refreshRate) {
            const refresh = () => { };

            $timeout(refresh, refreshRate * 1000.0);
        }



        this.refreshDashboard = () => {
            renderDashboard(this.dashboard, true);
        };

    }
};

export default function init(ngModule) {
    ngModule.component('publicDashboardPage', PublicDashboardPage);

    function loadPublicToken($route, appSettings) {
        'ngInject';

        return loadToken($route, appSettings);
    }

    function session($http, $route, Auth) {
        const token = $route.current.params.token;
        Auth.setApiKey(token);
        return Auth.loadConfig();
    }

    ngModule.config($routeProvider => {
        $routeProvider.when('/public/dashboards/:token', {
            template: '<public-dashboard-page></public-dashboard-page>',
            layout: 'dashboardView',
            pageID: 'publicShare',
            reloadOnSearch: false,
            resolve: {
                session
            }
        });
    });

    return [];
}

init.init = true;