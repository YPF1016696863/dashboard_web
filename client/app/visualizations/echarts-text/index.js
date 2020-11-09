/* eslint-disable func-names */
import * as _ from 'lodash';
import $ from 'jquery';
import UUIDv4 from 'uuid/v4';
import E from 'wangeditor';
import echartsTemplate from './echarts.html';
import echartsEditorTemplate from './echarts-editor.html';
import './text.css';

import { defaultTextChartOptions, getChartType, setThemeColor } from './echartsTextChartOptionUtils';

let height = '100%';
let width = '100%';
// let IMAGE = "";
function EchartsTextRenderer($rootScope) {
    return {
        restrict: 'E',
        scope: {
            queryResult: '=',
            options: '=?',
        },
        template: echartsTemplate,
        link($scope, $element) {
            if (_.isEmpty($scope.options) || $scope.options.chartType !== "TextChart") {
                $scope.options = defaultTextChartOptions();
            }

            const refreshData = () => {
                // _.set($scope.options,"text","");
                if(_.get($scope.options,"text")) {
                    document.getElementById('display').innerHTML = _.get($scope.options,"text");
                }
                const editor = new E('#div1');
                document.getElementById('div1').innerHTML = _.get($scope.options,"text");
                editor.config.onchange = function (newHtml) {
                    console.log('change 之后最新的 html', newHtml);
                    _.set($scope.options,"text",newHtml);
                    document.getElementById('display').innerHTML = _.get($scope.options,"text");
                }
                editor.create();
                document.getElementById('display').innerHTML = _.get($scope.options,"text");
                if (document.getElementById("text-main")) {
                    document.getElementById("text-main").id = $scope.options.id;
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
                    });
                }
                // myChart.resize($scope.options.size.width, $scope.options.size.height);
            };
            $scope.handleResize = _.debounce(() => {
                refreshData();
            }, 50);

            $scope.$watch('options', refreshData, true);

            $rootScope.$watch('theme.theme', refreshData);
        },
    };
}


function EchartsTextEditor() {
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
            name: 'Echarts文本',
            renderTemplate,
            editorTemplate,
            defaultOptions,
        });
    });
}

init.init = true;