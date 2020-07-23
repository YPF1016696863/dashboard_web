/* eslint-disable func-names */
import * as _ from 'lodash';
import $ from 'jquery';
import UUIDv4 from 'uuid/v4';
import echartsTemplate from './echarts.html';
import echartsEditorTemplate from './echarts-editor.html';

import { defaultPicChartOptions, getChartType, setThemeColor } from './echartsPicChartOptionUtils';

let height = '100%';
let width = '100%';
// let IMAGE = "";
function EchartsPicRenderer($rootScope) {
    return {
        restrict: 'E',
        scope: {
            queryResult: '=',
            options: '=?',
        },
        template: echartsTemplate,
        link($scope, $element) {

            if (_.isEmpty($scope.options) || $scope.options.chartType !== "PicChart") {

                $scope.options = defaultPicChartOptions();
            }
            // console.log($scope.options);
            const refreshData = () => {

                // let myChart = null;

                if (document.getElementById("pic-main")) {
                    document.getElementById("pic-main").id = $scope.options.id;
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

                    // console.log(height+"::"+width);
                    _.set($scope.options, "size", {
                        responsive: true,
                        width,
                        height,
                        'background-image': "url(" + _.get($scope.options, "images", "url111") + ")"
                    });
                    // console.log($scope.options.size);
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


function EchartsPicEditor() {
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
            // Set default options for new vis// 20191203 bug fix 
            if (_.isEmpty($scope.options) || $scope.options.chartType !== "PicChart") {
                $scope.options = defaultPicChartOptions();
            }
            $scope.selectedChartType = getChartType($scope.options);

            // 组件背景
            $scope.getImageUrlCb = (a) => {
                _.set($scope.options, "images", a);
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
    ngModule.directive('echartsPicEditor', EchartsPicEditor);
    ngModule.directive('echartsPicRenderer', EchartsPicRenderer);

    ngModule.config((VisualizationProvider) => {
        const renderTemplate =
            '<echarts-pic-renderer options="visualization.options" query-result="queryResult"></echarts-pic-renderer>';

        const editorTemplate = '<echarts-pic-editor options="visualization.options" query-result="queryResult"></echarts-pic-editor>';
        const defaultOptions = {

        };

        VisualizationProvider.registerVisualization({
            type: 'ECHARTS-PIC',
            name: 'Echarts图片',
            renderTemplate,
            editorTemplate,
            defaultOptions,
        });
    });
}

init.init = true;