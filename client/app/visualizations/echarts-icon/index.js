/* eslint-disable func-names */
import * as _ from 'lodash';
import $ from 'jquery';
import UUIDv4 from 'uuid/v4';
import echartsTemplate from './echarts.html';
import echartsEditorTemplate from './echarts-editor.html';

import { defaultIconChartOptions, getChartType, setThemeColor } from './echartsIconsChartOptionUtils';

let height = '100%';
let width = '100%';
// let IMAGE = "";
function EchartsIconsRenderer($rootScope) {
    return {
        restrict: 'E',
        scope: {
            queryResult: '=',
            options: '=?',
        },
        template: echartsTemplate,
        link($scope, $element) {
            if (_.isEmpty($scope.options) || $scope.options.chartType !== "IconChart") {
                $scope.options = defaultIconChartOptions();
            }
            console.log("$scope.options",$scope.options);
            const refreshData = () => {
                if (document.getElementById("icon-main")) {
                    document.getElementById("icon-main").id = $scope.options.id;
                    // eslint-disable-next-line
                    // myChart = echarts.init(document.getElementById($scope.options.id));
                } else {
                    // eslint-disable-next-line
                    // myChart = echarts.init(document.getElementById($scope.options.id));
                }

                //    console.log( _.get($scope.options,"images","url111"));
                if (_.get($scope.options, "size.responsive", false)) {
                    height = '100%';
                    width = '100%';

                    if ($("#Preview").length !== 0) {
                        height = $("#Preview")["0"].clientHeight;
                        width = $("#Preview")["0"].clientWidth;
                    }

                    if ($("#editor").length !== 0) {
                        height = $("#editor")["0"].clientHeight - 50;
                        width = $("#editor")["0"].clientWidth - 50;
                    }

                    _.set($scope.options, "size", {
                        responsive: true,
                        width,
                        height,
                        'background-image': "url(" + _.get($scope.options, "images", "url111") + ")"
                    });
                }
                // myChart.resize($scope.options.size.width, $scope.options.size.height);
            };
            $scope.handleResize = _.debounce(() => {
                refreshData();
            }, 50);

            $scope.$watch('options', refreshData, true);
            // $scope.$watch('queryResult && queryResult.getData()', refreshData);
            $rootScope.$watch('theme.theme', refreshData);
        },
    };
}


function EchartsIconsEditor() {
    return {
        restrict: 'E',
        template: echartsEditorTemplate,
        scope: {
            queryResult: '=',
            options: '=?',
        },
        link($scope, $element) {
            try {
                $scope.columns = $scope.queryResult.getColumns();
                $scope.columnNames = _.map($scope.columns, i => i.name);
            } catch (e) {
                console.log("some error");
            }
            console.log("$scope.options",$scope.options);
            // Set default options for new vis// 20191203 bug fix
            if (_.isEmpty($scope.options) || $scope.options.chartType !== "IconChart") {
                $scope.options = defaultIconChartOptions();
            }
            $scope.selectedChartType = getChartType($scope.options);

            $scope.iconSearchCb = (iconname)=> {
                console.log(iconname);
                _.set($scope.options, "images", '/static/images/datavis-charts/datavis-icons/'+iconname+'.png');
                $scope.$apply();
            }

            $scope.currentTab = 'general';
            $scope.changeTab = (tab) => {
                $scope.currentTab = tab;
            };
            $scope.$watch('options', () => { }, true);
        },
    };
}

export default function init(ngModule) {
    ngModule.directive('echartsIconsEditor', EchartsIconsEditor);
    ngModule.directive('echartsIconsRenderer', EchartsIconsRenderer);

    ngModule.config((VisualizationProvider) => {
        const renderTemplate =
            '<echarts-icons-renderer options="visualization.options" query-result="queryResult"></echarts-icons-renderer>';

        const editorTemplate = '<echarts-icons-editor options="visualization.options" query-result="queryResult"></echarts-icons-editor>';
        const defaultOptions = {

        };

        VisualizationProvider.registerVisualization({
            type: 'ECHARTS-ICONS',
            name: 'Echarts图标',
            renderTemplate,
            editorTemplate,
            defaultOptions,
        });
    });
}

init.init = true;