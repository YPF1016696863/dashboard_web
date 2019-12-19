import {
  some, extend, defaults, has, partial, intersection, without, includes, isUndefined,
  sortBy, each, map, keys, difference, set, get, find, forEach, isEmpty
} from 'lodash';

import template from './chart.html';
import editorTemplate from './chart-editor.html';

const DEFAULT_OPTIONS = {
  globalSeriesType: 'column',
  sortX: true,
  legend: { enabled: true },
  yAxis: [{ type: 'linear' }, { type: 'linear', opposite: true }],
  xAxis: { type: '-', labels: { enabled: true } },
  error_y: { type: 'data', visible: true },
  series: { stacking: null, error_y: { type: 'data', visible: true } },
  seriesOptions: {},
  valuesOptions: {},
  columnMapping: {},

  // showDataLabels: false, // depends on chart type
  numberFormat: '0,0[.]00000',
  percentFormat: '0[.]00%',
  // dateTimeFormat: 'DD/MM/YYYY HH:mm', // will be set from clientConfig
  textFormat: '', // default: combination of {{ @@yPercent }} ({{ @@y }} ± {{ @@yError }})

  defaultColumns: 3,
  defaultRows: 8,
  minColumns: 1,
  minRows: 5,
};
const DEFAULT_OPTIONS2 = {
  globalSeriesType: 'column',
  sortX: true,
  legend: { enabled: true },
  yAxis: [{ type: 'linear' }, { type: 'linear', opposite: true }],
  xAxis: { type: '-', labels: { enabled: true } },
  error_y: { type: 'data', visible: true },
  series: { stacking: null, error_y: { type: 'data', visible: true } },
  seriesOptions: {},
  valuesOptions: {},
  columnMapping: {},

  // showDataLabels: false, // depends on chart type
  numberFormat: '0,0[.]00000',
  percentFormat: '0[.]00%',
  // dateTimeFormat: 'DD/MM/YYYY HH:mm', // will be set from clientConfig
  textFormat: '', // default: combination of {{ @@yPercent }} ({{ @@y }} ± {{ @@yError }})

  defaultColumns: 3,
  defaultRows: 8,
  minColumns: 1,
  minRows: 5,
};
function ChartRenderer() {
  return {
    restrict: 'E',
    scope: {
      queryResult: '=',
      options: '=?',
    },
    template,
    replace: false,
    controller($scope, clientConfig, $rootScope) {
      $scope.chartSeries = [];
      
      console.log($scope.options);
      if (isEmpty($scope.options.seriesOptions)||
      get($scope.options,'chartType','new')==="PieChart"||
      get($scope.options,'chartType','new')==="BasicChart"||
      get($scope.options,'chartType','new')==="GaugeChart"||
      get($scope.options,'chartType','new')==="PolarChart"
      )
       {
        console.log("defaultSet");        
        $scope.options = DEFAULT_OPTIONS2;// 新建一个不变的默认值
        // set($scope.options, "seriesOptions", {});
      }
      console.log($scope.options);
      function zIndexCompare(series) {
        if ($scope.options.seriesOptions[series.name]) {
          return $scope.options.seriesOptions[series.name].zIndex;
        }
        return 0;
      }

      function reloadData() {
        if (!isUndefined($scope.queryResult) && $scope.queryResult.getData()) {
          const data = $scope.queryResult.getChartData($scope.options.columnMapping);
          $scope.chartSeries = sortBy(data, zIndexCompare);
        }
      }

      function reloadChart() {
        reloadData();
        $scope.plotlyOptions = extend({
          showDataLabels: $scope.options.globalSeriesType === 'pie',
          dateTimeFormat: clientConfig.dateTimeFormat,
        }, DEFAULT_OPTIONS, $scope.options);
      }


      const selectChartType = () => {
        if (get($rootScope, 'selectDECharts', 'n') === 'CHART') {
          // 选到这一组才刷新有效，防止修改其他组图表类型的时候，这里也刷新，导致类型出错
          // console.log("watch");

          set($scope, 'selectChartTypeCharts', get($rootScope, 'selectChartType', undefined));
          if (get($scope, 'selectChartTypeCharts', undefined) !== undefined ||
            get($scope, 'selectChartTypeCharts', null) !== null) {
            // console.log("selectChartTypeCharts:" + get($scope, 'selectChartTypeCharts', undefined));
            // 当在组件预览界面时 该值为undefine 因此 这里做一个判断 
            let selectType;
            switch (get($scope, 'selectChartTypeCharts', 'new')) {// 为了处理第一次点击的问题 这里再做判断
              case 'line': selectType = 'line'; set($scope, "options.globalSeriesType", 'line'); break;
              case 'bar': selectType = 'column'; set($scope, "options.globalSeriesType", 'column'); break;
              case 'area': selectType = 'area'; set($scope, "options.globalSeriesType", 'area'); break;
              case 'pie': selectType = 'pie'; set($scope, "options.globalSeriesType", 'pie'); break;
              case 'scatter': selectType = 'scatter'; set($scope, "options.globalSeriesType", 'scatter'); break;
              case 'bubble': selectType = 'bubble'; set($scope, "options.globalSeriesType", 'bubble'); break;// options.type === 'bubble'
              case 'heatmap': selectType = 'heatmap'; set($scope, "options.globalSeriesType", 'heatmap'); break;
              case 'box': selectType = 'box'; set($scope, "options.globalSeriesType", 'box'); break;
              default: selectType = undefined; console.log("默认1");// _.set($scope.options, stringTemp, _.get($scope.options, stringTemp))
            };
            // console.log(selectType);
            set($scope, "options.tempType", selectType);// 左侧选择到的类型
            if (selectType !== undefined) {
              each(get($scope.options, "seriesOptions", {}), (yAxisColumn) => {// 把每一个系列图表类型覆盖
                yAxisColumn.type = selectType;
                // console.log(yAxisColumn);
                // console.log($scope.options);
              });
            }
          }
          set($scope, 'selectChartTypeCharts', undefined);
        };
        console.log(get($rootScope, 'selectDECharts', 'n'));
        if(get($rootScope, 'selectDECharts', 'n') === 'ECHARTS'
          ||get($rootScope, 'selectDECharts', 'n') === 'ECHARTS-PIE-AND-RADAR'
          ||get($rootScope, 'selectDECharts', 'n') === 'ECHARTS-GAUGE'
          ||get($rootScope, 'selectDECharts', 'n') === 'ECHARTS-POLAR'){
            set($scope.options, "seriesOptions", {});
            console.log("clear");
        }
      };


      $rootScope.$watch('selectChartType', selectChartType);  // 当图表类型选择时（chart search），覆盖原先的每个系列的type值



      $scope.$watch('options', reloadChart, true);
      $scope.$watch('queryResult && queryResult.getData()', reloadData);
    },
  };
}

function ChartEditor(ColorPalette, clientConfig) {
  return {
    restrict: 'E',
    template: editorTemplate,
    scope: {
      queryResult: '=',
      options: '=?',
    },
    link(scope) {
      scope.currentTab = 'general';
      scope.colors = extend({ Automatic: null }, ColorPalette);

      scope.stackingOptions = {
        Disabled: null,
        Stack: 'stack',
      };

      scope.changeTab = (tab) => {
        scope.currentTab = tab;
      };

      scope.selectChartTypeCb = (serie, type) => {
        scope.options.seriesOptions[serie].type = type;
        // console.log(type);
        scope.$apply();
      };

      scope.selectGlobalChartTypeCb = (serie, type) => {
        scope.options.globalSeriesType = type;
        scope.$apply();
      };

      scope.chartTypes = {
        line: { name: 'Line', icon: 'line-chart' },
        column: { name: 'Bar', icon: 'bar-chart' },
        area: { name: 'Area', icon: 'area-chart' },
        pie: { name: 'Pie', icon: 'pie-chart' },
        scatter: { name: 'Scatter', icon: 'circle-o' },
        bubble: { name: 'Bubble', icon: 'circle-o' },
        heatmap: { name: 'Heatmap', icon: 'th' },
        box: { name: 'Box', icon: 'square-o' },
      };

      if (clientConfig.allowCustomJSVisualizations) {
        scope.chartTypes.custom = { name: 'Custom', icon: 'code' };
      }

      scope.xAxisScales = [
        { label: '自动监测', value: '-' },
        { label: '时间', value: 'datetime' },
        { label: '线性', value: 'linear' },
        { label: '对数', value: 'logarithmic' },
        { label: '类别', value: 'category' },
      ];
      scope.yAxisScales = ['linear', 'logarithmic', 'datetime', 'category'];

      scope.chartTypeChanged = () => {
        keys(scope.options.seriesOptions).forEach((key) => {
          scope.options.seriesOptions[key].type = scope.options.globalSeriesType;
        });
        scope.options.showDataLabels = scope.options.globalSeriesType === 'pie';
        scope.$applyAsync();
      };

      scope.colorScheme = ['Blackbody', 'Bluered', 'Blues', 'Earth', 'Electric',
        'Greens', 'Greys', 'Hot', 'Jet', 'Picnic', 'Portland',
        'Rainbow', 'RdBu', 'Reds', 'Viridis', 'YlGnBu', 'YlOrRd', 'Custom...'];

      scope.showSizeColumnPicker = () => some(scope.options.seriesOptions, options => options.type === 'bubble');
      scope.showZColumnPicker = () => some(scope.options.seriesOptions, options => options.type === 'heatmap');

      if (scope.options.customCode === undefined) {
        scope.options.customCode = `// Available variables are x, ys, element, and Plotly
// Type console.log(x, ys); for more info about x and ys
// To plot your graph call Plotly.plot(element, ...)
// Plotly examples and docs: https://plot.ly/javascript/`;
      }

      if (scope.options.customCode === undefined) {
        scope.options.pieChartHoleSize = 0.4;
      }

      function refreshColumns() {
        scope.columns = scope.queryResult.getColumns();
        scope.columnNames = map(scope.columns, i => i.name);
        if (scope.columnNames.length > 0) {
          each(difference(keys(scope.options.columnMapping), scope.columnNames), (column) => {
            delete scope.options.columnMapping[column];
          });
        }
      }

      function refreshColumnsAndForm() {
        refreshColumns();
        if (!scope.queryResult.getData() ||
          scope.queryResult.getData().length === 0 ||
          scope.columns.length === 0) {
          return;
        }
        scope.form.yAxisColumns = intersection(scope.form.yAxisColumns, scope.columnNames);
        if (!includes(scope.columnNames, scope.form.xAxisColumn)) {
          scope.form.xAxisColumn = undefined;
        }
        if (!includes(scope.columnNames, scope.form.groupby)) {
          scope.form.groupby = undefined;
        }
      }

      function refreshSeries() {
        const chartData = scope.queryResult.getChartData(scope.options.columnMapping);
        const seriesNames = map(chartData, i => i.name);
        const existing = keys(scope.options.seriesOptions);
        each(difference(seriesNames, existing), (name) => {
          scope.options.seriesOptions[name] = {
            type: get(scope, "options.tempType", '全局图表设置默认'),// 全局图表设置

            // scope.options.globalSeriesType
            yAxis: 0,
          };
          scope.form.seriesList.push(name);
        });
        each(difference(existing, seriesNames), (name) => {
          scope.form.seriesList = without(scope.form.seriesList, name);
          delete scope.options.seriesOptions[name];
        });

        if (scope.options.globalSeriesType === 'pie') {// scope.options.globalSeriesType
          const uniqueValuesNames = new Set();
          each(chartData, (series) => {
            each(series.data, (row) => {
              uniqueValuesNames.add(row.x);
            });
          });
          const valuesNames = [];
          uniqueValuesNames.forEach(v => valuesNames.push(v));

          // initialize newly added values
          const newValues = difference(valuesNames, keys(scope.options.valuesOptions));
          each(newValues, (name) => {
            scope.options.valuesOptions[name] = {};
            scope.form.valuesList.push(name);
          });
          // remove settings for values that are no longer available
          each(keys(scope.options.valuesOptions), (name) => {
            if (valuesNames.indexOf(name) === -1) {
              delete scope.options.valuesOptions[name];
            }
          });
          scope.form.valuesList = intersection(scope.form.valuesList, valuesNames);
        }
      }

      function setColumnRole(role, column) {
        scope.options.columnMapping[column] = role;
      }

      function unsetColumn(column) {
        setColumnRole('unused', column);
      }

      refreshColumns();

      scope.$watch('options.columnMapping', () => {
        if (scope.queryResult.status === 'done') {
          refreshSeries();
        }
      }, true);

      scope.$watch(() => [scope.queryResult.getId(), scope.queryResult.status], (changed) => {
        if (!changed[0] || changed[1] !== 'done') {
          return;
        }

        refreshColumnsAndForm();
        refreshSeries();
      }, true);

      scope.form = {
        yAxisColumns: [],
        seriesList: sortBy(keys(scope.options.seriesOptions), name => scope.options.seriesOptions[name].zIndex),
        valuesList: keys(scope.options.valuesOptions),
      };

      scope.$watchCollection('form.seriesList', (value) => {
        each(value, (name, index) => {
          scope.options.seriesOptions[name].zIndex = index;
          scope.options.seriesOptions[name].index = 0; // is this needed?
        });
      });


      scope.$watchCollection('form.yAxisColumns', (value, old) => {
        each(old, unsetColumn);
        each(value, partial(setColumnRole, 'y'));
      });

      scope.$watch('form.xAxisColumn', (value, old) => {
        if (old !== undefined) {
          unsetColumn(old);
        }
        if (value !== undefined) { setColumnRole('x', value); }
      });

      scope.$watch('form.errorColumn', (value, old) => {
        if (old !== undefined) {
          unsetColumn(old);
        }
        if (value !== undefined) {
          setColumnRole('yError', value);
        }
      });

      scope.$watch('form.sizeColumn', (value, old) => {
        if (old !== undefined) {
          unsetColumn(old);
        }
        if (value !== undefined) {
          setColumnRole('size', value);
        }
      });

      scope.$watch('form.zValColumn', (value, old) => {
        if (old !== undefined) {
          unsetColumn(old);
        }
        if (value !== undefined) {
          setColumnRole('zVal', value);
        }
      });

      scope.$watch('form.groupby', (value, old) => {
        if (old !== undefined) {
          unsetColumn(old);
        }
        if (value !== undefined) {
          setColumnRole('series', value);
        }
      });

      if (!has(scope.options, 'legend')) {
        scope.options.legend = { enabled: true };
      }

      if (scope.columnNames) {
        each(scope.options.columnMapping, (value, key) => {
          if (scope.columnNames.length > 0 && !includes(scope.columnNames, key)) {
            return;
          }
          if (value === 'x') {
            scope.form.xAxisColumn = key;
          } else if (value === 'y') {
            scope.form.yAxisColumns.push(key);
          } else if (value === 'series') {
            scope.form.groupby = key;
          } else if (value === 'yError') {
            scope.form.errorColumn = key;
          } else if (value === 'size') {
            scope.form.sizeColumn = key;
          } else if (value === 'zVal') {
            scope.form.zValColumn = key;
          }
        });
      }

      function setOptionsDefaults() {
        if (scope.options) {
          // For existing visualization - set default options
          defaults(scope.options, extend({}, DEFAULT_OPTIONS, {
            showDataLabels: scope.options.globalSeriesType === 'pie',
            dateTimeFormat: clientConfig.dateTimeFormat,
          }));
        }
      }
      setOptionsDefaults();
      scope.$watch('options', setOptionsDefaults);

      scope.templateHint = `
        <div class="p-b-5">Use special names to access additional properties:</div>
        <div><code>{{ @@name }}</code> series name;</div>
        <div><code>{{ @@x }}</code> x-value;</div>
        <div><code>{{ @@y }}</code> y-value;</div>
        <div><code>{{ @@yPercent }}</code> relative y-value;</div>
        <div><code>{{ @@yError }}</code> y deviation;</div>
        <div><code>{{ @@size }}</code> bubble size;</div>
        <div class="p-t-5">Also, all query result columns can be referenced using
          <code class="text-nowrap">{{ column_name }}</code> syntax.</div>
      `;
    },
  };
}

const ColorBox = {
  bindings: {
    color: '<',
  },
  template: "<span style='width: 12px; height: 12px; background-color: {{$ctrl.color}}; display: inline-block; margin-right: 5px;'></span>",
};

export default function init(ngModule) {
  ngModule.component('colorBox', ColorBox);
  ngModule.directive('chartRenderer', ChartRenderer);
  ngModule.directive('chartEditor', ChartEditor);
  ngModule.config((VisualizationProvider) => {
    const renderTemplate = '<chart-renderer options="visualization.options" query-result="queryResult"></chart-renderer>';
    const editTemplate = '<chart-editor options="visualization.options" query-result="queryResult"></chart-editor>';

    VisualizationProvider.registerVisualization({
      type: 'CHART',
      name: 'DataVis图表',
      renderTemplate,
      editorTemplate: editTemplate,
      defaultOptions: DEFAULT_OPTIONS,
    });
  });
}

init.init = true;
