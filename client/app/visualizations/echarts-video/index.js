/* eslint-disable func-names */
import * as _ from 'lodash';
import $ from 'jquery';
import UUIDv4 from 'uuid/v4';
import echartsTemplate from './echarts.html';
import echartsEditorTemplate from './echarts-editor.html';

import { defaultVideoChartOptions, getChartType, setThemeColor } from './echartsVideoChartOptionUtils';

let height = '100%';
let width = '100%';
// let IMAGE = "";
function EchartsVideoRenderer($rootScope) {
    return {
        restrict: 'E',
        scope: {
            queryResult: '=',
            options: '=?',
        },
        template: echartsTemplate,
        link($scope, $element) {

            if (_.isEmpty($scope.options) || $scope.options.chartType !== "VideoChart") {

                $scope.options = defaultVideoChartOptions();
            }
            // console.log($scope.options);
            const refreshData = () => {

                // let myChart = null;

                if (document.getElementById("video-main")) {
                    document.getElementById("video-main").id = $scope.options.id;
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
                    
                    
                    _.set($scope.options, "sizeBg", {
                        // responsive: true,
                        'width': '100%',
                        'height': '100%',
                        'border-style': _.get($scope.options, "borderStyle", "solid"),
                        'border-width': _.get($scope.options, "borderWidth", "0px"),
                        'border-color': _.get($scope.options, "borderColor", "blue"),
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


function EchartsVideoEditor() {
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
            if (_.isEmpty($scope.options) || $scope.options.chartType !== "VideoChart") {
                $scope.options = defaultVideoChartOptions();
            }
            $scope.selectedChartType = getChartType($scope.options);

            //  get-video-url-cb
            $scope.getVideoUrlCb = (a) => {
                console.log(a);
                _.set($scope.options, "video", a);
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
    ngModule.directive('echartsVideoEditor', EchartsVideoEditor);
    ngModule.directive('echartsVideoRenderer', EchartsVideoRenderer);

    ngModule.config((VisualizationProvider) => {
        const renderTemplate =
            '<echarts-video-renderer options="visualization.options" query-result="queryResult"></echarts-video-renderer>';

        const editorTemplate = '<echarts-video-editor options="visualization.options" query-result="queryResult"></echarts-video-editor>';
        const defaultOptions = {

        };

        VisualizationProvider.registerVisualization({
            type: 'ECHARTS-VIDEO',
            name: '视频',
            renderTemplate,
            editorTemplate,
            defaultOptions,
        });
    });
}

init.init = true;