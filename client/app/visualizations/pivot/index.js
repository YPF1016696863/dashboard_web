import angular from 'angular';
import $ from 'jquery';
import * as _ from 'lodash';
import 'pivottable';
import Plotly from 'plotly.js/lib/core';
import '../../../../node_modules/pivottable/dist/pivot.zh';
import 'pivottable/dist/pivot.css';

import editorTemplate from './pivottable-editor.html';
import './pivot.less';
import color16to10 from '../colorChange';

function pivotTableRenderer() {
  return {
    restrict: 'E',
    scope: {
      queryResult: '=',
      visualization: '=',
    },
    template: '',
    replace: false,
    link($scope, element) {


      function refreshOption() {

        element[0].querySelectorAll('.pvtRendererArea').forEach((control) => {
          control.style.backgroundColor =
            color16to10(
              _.get($scope.visualization.options, "bgcolor", '#fff'),
              _.get($scope.visualization.options, "bgcolorOpacity", 1)
            );
        });

        console.log("pvtTable", element[0].querySelectorAll(".pvtTable"));
        // pvtTable 表头        
        element[0].querySelectorAll(".pvtTable").forEach((control) => {
          control.style.backgroundColor =
            color16to10(
              _.get($scope.visualization.options, "tableHeadBgColor", '#fff'),
              _.get($scope.visualization.options, "tableHeadBgColorOpacity", 1)
            );

          control.style.color = _.get($scope.visualization.options, "tableHeadColor", '#000');
        })

        element[0].querySelectorAll('.pvtTable tbody tr td').forEach((control) => {
          if (control.style.backgroundColor === "") {
            control.style.backgroundColor =
              color16to10(
                _.get($scope.visualization.options, "tablebgcolor", '#fff'),
                _.get($scope.visualization.options, "tablebgcolorOpacity", 1)
              );
          }

          control.style.color = _.get($scope.visualization.options, "tableColor", '#000');
        })

        element[0].querySelectorAll('.pvtAxisContainer').forEach((control) => {
          control.style.backgroundColor =
            color16to10(
              _.get($scope.visualization.options, "tableRowsbgcolor", '#fff'),
              _.get($scope.visualization.options, "tableRowsbgcolorOpacity", 1)
            );

          control.style.color = _.get($scope.visualization.options, "tableRowColor", '#000');
        })



        element[0].querySelectorAll('.pvtUi tr td')[0].style.backgroundColor = color16to10(
          _.get($scope.visualization.options, "tableRowsbgcolor", '#fff'),
          _.get($scope.visualization.options, "tableRowsbgcolorOpacity", 1)
        );
        element[0].querySelectorAll('.pvtUi tr td')[2].style.backgroundColor = color16to10(
          _.get($scope.visualization.options, "tableRowsbgcolor", '#fff'),
          _.get($scope.visualization.options, "tableRowsbgcolorOpacity", 1)
        );
        // 选择框
        // pvtRenderer
        // pvtAggregator
        // pvtAttrDropdown
        // pvtAttr
        element[0].querySelectorAll('.pvtRenderer').forEach((control) => {
          control.style.backgroundColor =
            color16to10(
              _.get($scope.visualization.options, "selectbgcolor", '#fff'),
              _.get($scope.visualization.options, "selectbgcolorOpacity", 1)
            );
          control.style.color = _.get($scope.visualization.options, "selectRowColor", '#000');
        })
        element[0].querySelectorAll('.pvtAggregator').forEach((control) => {
          control.style.backgroundColor =
            color16to10(
              _.get($scope.visualization.options, "selectbgcolor", '#fff'),
              _.get($scope.visualization.options, "selectbgcolorOpacity", 1)
            );
          control.style.color = _.get($scope.visualization.options, "selectRowColor", '#000');
        })
        element[0].querySelectorAll('.pvtAttrDropdown').forEach((control) => {
          control.style.backgroundColor =
            color16to10(
              _.get($scope.visualization.options, "selectbgcolor", '#fff'),
              _.get($scope.visualization.options, "selectbgcolorOpacity", 1)
            );
          control.style.color = _.get($scope.visualization.options, "selectRowColor", '#000');
        })
        element[0].querySelectorAll('.pvtAttr').forEach((control) => {
          control.style.backgroundColor =
            color16to10(
              _.get($scope.visualization.options, "selectbgcolor", '#fff'),
              _.get($scope.visualization.options, "selectbgcolorOpacity", 1)
            );
          control.style.color = _.get($scope.visualization.options, "selectRowColor", '#000');
        })


      }



      function removeControls() {
        const hideControls = $scope.visualization.options.controls && $scope.visualization.options.controls.enabled;

        element[0].querySelectorAll('.pvtAxisContainer, .pvtRenderer, .pvtVals').forEach((control) => {
          if (hideControls) {
            control.style.display = 'none';
          } else {
            control.style.display = '';
          }
        });
        refreshOption();

      }

      function updatePivot() {
        $scope.$watch('queryResult && queryResult.getData()', (data) => {
          if (!data) {
            return;
          }

          if ($scope.queryResult.getData() !== null) {
            // We need to give the pivot table its own copy of the data, because it changes
            // it which interferes with other visualizations.
            data = angular.copy($scope.queryResult.getData());

            const options = {
              renderers: $.pivotUtilities.locales.zh.renderers,
              aggregators: $.pivotUtilities.locales.zh.aggregators,
              // localeStrings:$.pivotUtilities.locales.zh.localeStrings,
              rendererOptions: {
                heatmap: {
                  colorScaleGenerator(values) {
                    // Plotly happens to come with d3 on board
                    return Plotly.d3.scale.linear()
                      .domain([
                        _.get($scope.visualization.options, "number1", 0)
                        // , _.get($scope.visualization.options, "number2", 1000)
                        , _.get($scope.visualization.options, "number3", 2900)
                      ])
                      .range([
                        _.get($scope.visualization.options, "selectColor1", '#0f0')
                        // , _.get($scope.visualization.options, "selectColor2", '#00f')
                        , _.get($scope.visualization.options, "selectColor3", '#f00')
                      ])
                  }
                }
              },
              onRefresh(config) {
                const configCopy = Object.assign({}, config);

                // delete some values which are functions
                delete configCopy.aggregators;
                delete configCopy.renderers;
                delete configCopy.onRefresh;
                // delete some bulky default values
                delete configCopy.rendererOptions;
                delete configCopy.localeStrings;

                refreshOption();
                if ($scope.visualization) {
                  $scope.visualization.options = configCopy;
                }
              },
            };
            if ($scope.visualization) {
              Object.assign(options, $scope.visualization.options);
            }

            $(element).pivotUI(data, options, true);
            removeControls();
          }

        });
      }

      setTimeout(function () {
        refreshOption()
      }, 100);

      $scope.$watch('queryResult && queryResult.getData()', updatePivot);
      $scope.$watch('visualization.options.controls.enabled', removeControls);
      $scope.$watch('visualization.options', updatePivot, true);
      $scope.$watch('visualization.options', refreshOption, true);
      $scope.$watch('visualization.options', refreshOption);
    },
  };
}



function pivotTableEditor() {
  return {
    restrict: 'E',
    template: editorTemplate,
  };
}

export default function init(ngModule) {
  ngModule.directive('pivotTableRenderer', pivotTableRenderer);
  ngModule.directive('pivotTableEditor', pivotTableEditor);

  ngModule.config((VisualizationProvider) => {
    const editTemplate = '<pivot-table-editor></pivot-table-editor>';
    const defaultOptions = {
      defaultRows: 10,
      defaultColumns: 3,
      minColumns: 2,
    };

    VisualizationProvider.registerVisualization({
      type: 'PIVOT',
      name: '交叉表',
      renderTemplate:
        '<pivot-table-renderer visualization="visualization" query-result="queryResult"></pivot-table-renderer>',
      editorTemplate: editTemplate,
      defaultOptions,
    });
  });
}

init.init = true;
