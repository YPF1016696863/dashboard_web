import * as _ from 'lodash';
import echartsTemplate from './echarts.html';
import echartsEditorTemplate from './echarts-editor.html';

import { defaultTextChartOptions, getChartType } from './echartsTextChartOptionUtils';

function EchartsTextRenderer($rootScope) {
    return {
        restrict: 'E',
        scope: {
            queryResult: '=',
            options: '=?',
        },
        template: echartsTemplate,
        link($scope){
            if (_.isEmpty($scope.options) || $scope.options.chartType !== "TextChart") {
                $scope.options = defaultTextChartOptions();
            }
            console.log("$scope.options",$scope.options);
            const refreshData = () => {
                if (document.getElementById("text-main")) {
                    document.getElementById("text-main").id = $scope.options.id;
                    // eslint-disable-next-line
                    // myChart = echarts.init(document.getElementById($scope.options.id));
                } else {
                    // eslint-disable-next-line
                    // myChart = echarts.init(document.getElementById($scope.options.id));
                }

                //    console.log( _.get($scope.options,"images","url111"));
                }
            $scope.handleResize = _.debounce(() => {
                refreshData();
            }, 50);

            $scope.$watch('options', refreshData, true);
            // $scope.$watch('queryResult && queryResult.getData()', refreshData);
            $rootScope.$watch('theme.theme', refreshData);
            }
        }
    };

function EchartsTextEditor(){
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
            if (_.isEmpty($scope.options) || $scope.options.chartType !== "TextChart") {
                $scope.options = defaultTextChartOptions();
            }
            $scope.selectedChartType = getChartType($scope.options);

            $scope.currentTab = 'general';
            $scope.changeTab = (tab) => {
                $scope.currentTab = tab;
            };
            $scope.$watch('options', () => { }, true);
        },
    };
}

export default function init(ngModule) {
    ngModule.directive('echartsTextEditor', EchartsTextEditor);
    ngModule.directive('echartsTextRenderer', EchartsTextRenderer);

    ngModule.config((VisualizationProvider) => {
        const renderTemplate =
            '<echarts-text-renderer options="visualization.options" query-result="queryResult"></echarts-text-renderer>';

        const editorTemplate = '<echarts-text-editor options="visualization.options" query-result="queryResult"></echarts-text-editor>';
        const defaultOptions = {
        };

        VisualizationProvider.registerVisualization({
            type: 'ECHARTS-TEXT',
            name: '文本',
            renderTemplate,
            editorTemplate,
            defaultOptions,
        });
    });
}