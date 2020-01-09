import React from 'react';
import {
  PageHeader,
  Button,
  Descriptions,
  Breadcrumb,
  Dropdown,
  Menu,
  Icon,
  Divider,
  Row,
  Col,
  Tree,
  Input,
  Alert,
  Collapse,
  Radio,
  BackTop,
  Tabs,
  Badge,
  Avatar,
  Empty
} from 'antd';
import PropTypes from 'prop-types';
import { react2angular } from 'react2angular';
import { angular2react } from 'angular2react';
import * as _ from 'lodash';
import { QueryTagsControl } from '@/components/tags-control/TagsControl';
import { SchedulePhrase } from '@/components/queries/SchedulePhrase';
// import QueriesList  from '@/components/queries-list/Querieslist';
import { ChartsListSelectView } from '@/pages/dashboards/charts-list-select';


import {
  wrap as itemsList,
  ControllerType
} from '@/components/items-list/ItemsList';
import { ResourceItemsSource } from '@/components/items-list/classes/ItemsSource';
import { UrlStateStorage } from '@/components/items-list/classes/StateStorage';

import LoadingState from '@/components/items-list/components/LoadingState';
import * as Sidebar from '@/components/items-list/components/Sidebar';
import ItemsTable, {
  Columns
} from '@/components/items-list/components/ItemsTable';

import { Query } from '@/services/query';
import { currentUser } from '@/services/auth';
import { routesToAngularRoutes } from '@/lib/utils';

import { policy } from '@/services/policy';
import './ChartSearch.css'

const { TreeNode, DirectoryTree } = Tree;
const { Search } = Input;
const CHART_IMG_ROOT = '/static/images/';

const emptyChart = '/static/images/emptyChart.png';
const { Panel } = Collapse;
let ChartsListSelectViewDOM;
let QueriesListViewDOM;

class ChartsSearch extends React.Component {
  state = {
  };

  componentDidMount() {
    this.setState({
      isLoaded: true,
      visualization: null
    });
    // this.props.chartSearchCb('new');
    this.getQuery(this.props.queryId + ':' + this.props.chartId);
    ChartsListSelectViewDOM = angular2react(
      'chartsListSelectView',
      ChartsListSelectView,
      window.$injector
    );
    // QueriesListViewDOM = angular2react(
    //   'queriesListView',
    //   QueriesListView,
    //   window.$injector
    // );
  }

  getQuery(id) {
    const queryId = _.split(id, ':')[0];
    const visualizationId = _.split(id, ':')[1];

    this.setState({
      isLoaded: false,
      visualization: null
    });

    if (visualizationId === 'new') {
      this.setState({
        isLoaded: true,
        visualization: { type: this.props.chartType ? this.props.chartType : 'new' }
      });
    } else {
      Query.query({ id: queryId })
        .$promise.then(query => {
          query
            .getQueryResultPromise()
            .then(queryRes => {
              if (visualizationId) {
                this.setState({
                  isLoaded: true,
                  visualization: _.find(
                    query.visualizations,
                    // eslint-disable-next-line eqeqeq
                    visualization => visualization.id == visualizationId
                  )
                });
              } else {
                this.setState({
                  isLoaded: true,
                  visualization: { type: this.props.chartType ? this.props.chartType : 'new' }
                });
              }
              this.props.chartSearchCb(this.state.visualization.type);

            })
            .catch(err => {
              this.setState({
                isLoaded: true,
                visualization: { type: 'new' }
              });
            });
        })
        .catch(err => {
          this.setState({
            isLoaded: true,
            visualization: { type: 'new' }
          });
        });
    }
  }

  render() {
    const { appSettings } = this.props;
    return (
      <>
        {!this.state.isLoaded && (
          <div style={{ paddingTop: '20vh' }}>
            <LoadingState />
          </div>
        )}
        {this.state.isLoaded && !this.state.visualization && (
          <Empty description={<span>无法加载图表类型</span>}>
            <Button
              type="primary"
              onClick={() => {
                this.props.$route.reload();
              }}
            >
              刷新
            </Button>
          </Empty>
        )}
        {this.state.isLoaded &&
          this.state.visualization &&
          this.state.visualization.type && (
            <>
              <Row>
                <Col>
                  <Row gutter={[16, 16]}>
                    <Col span={12}>
                      <div
                        style={{ fontWeight: 'bold', paddingBottom: '10px' }}
                      >
                        图表类型
                      </div>
                    </Col>
                  </Row>

                  <Row>
                    <Radio.Group
                      // disabled={this.state.visualization.type !== 'new'}// 开放随意变换图表类型
                      defaultValue={this.state.visualization.type}
                      value={this.state.value}
                      onChange={e => {
                        this.setState({
                          value: e.target.value,
                          visualization: { type: e.target.value }// 
                        });
                        // debugger
                        let type;
                        let chart;
                        switch (e.target.value) {
                          case 'ECHARTS_line': type = 'ECHARTS'; chart = 'line'; break;
                          case 'ECHARTS_bar': type = 'ECHARTS'; chart = 'bar'; break;
                          case 'ECHARTS_area': type = 'ECHARTS'; chart = 'area'; break;
                          case 'ECHARTS_scatter': type = 'ECHARTS'; chart = 'scatter'; break;
                          case 'ECHARTS_pie': type = 'ECHARTS-PIE-AND-RADAR'; chart = 'pie'; break;
                          case 'ECHARTS_donut': type = 'ECHARTS-PIE-AND-RADAR'; chart = 'doughnut'; break;
                          case 'ECHARTS_rose': type = 'ECHARTS-PIE-AND-RADAR'; chart = 'rose'; break;
                          case 'ECHARTS-GAUGE': type = 'ECHARTS-GAUGE'; break;
                          case 'ECHARTS-POLAR': type = 'ECHARTS-POLAR'; break;
                          case 'CHART_line': type = 'CHART'; chart = 'line'; break;
                          case 'CHART_bar': type = 'CHART'; chart = 'bar'; break;
                          case 'CHART_area': type = 'CHART'; chart = 'area'; break;
                          case 'CHART_pie': type = 'CHART'; chart = 'pie'; break;
                          case 'CHART_scatter': type = 'CHART'; chart = 'scatter'; break;
                          case 'CHART_bubble': type = 'CHART'; chart = 'bubble'; break;
                          case 'CHART_heatmap': type = 'CHART'; chart = 'heatmap'; break;
                          case 'CHART_box': type = 'CHART'; chart = 'box'; break;
                          case 'TABLE': type = 'TABLE'; break;
                          case 'SUNBURST_SEQUENCE': type = 'SUNBURST_SEQUENCE'; break;
                          case 'SANKEY': type = 'SANKEY'; break;
                          case 'COUNTER': type = 'COUNTER'; break;
                          case 'WORD_CLOUD': type = 'WORD_CLOUD'; break;
                          default: type = 'ECHARTS'; console.log("default(error)");
                        }
                        // console.log("改变了");

                        this.props.chartSearchCb(type, true, chart);
                      }}
                    >

                      <Collapse bordered={false} style={{ position: "absolute", left: '0%', width: '100%' }}>
                        {/* *** *****Radio value="ECHARTS" Echarts基础图  key 1 */}
                        <Panel header="Echarts基础图组" id="p1" key="1">
                          <Row gutter={[8, 8]}>
                            <Col
                              style={{ paddingBottom: '6px' }}
                              span={8}
                              align="center"
                            >
                              <Radio value="ECHARTS_line" style={{ width: '95%' }}>
                                <Avatar
                                  shape="square"
                                  size="large"
                                  src={`${CHART_IMG_ROOT}/datavis-charts/datavis-echarts-line.png`}
                                />
                                <p style={{ fontSize: '12px' }}>线性图</p>
                              </Radio>
                            </Col>

                            <Col
                              style={{ paddingBottom: '6px' }}
                              span={8}
                              align="center"
                            >
                              <Radio value="ECHARTS_bar" style={{ width: '95%' }}>
                                <Avatar
                                  shape="square"
                                  size="large"
                                  src={`${CHART_IMG_ROOT}/datavis-charts/datavis-echarts-bar1.png`}
                                />
                                <p style={{ fontSize: '12px' }}>柱状图</p>
                              </Radio>
                            </Col>
                            <Col
                              style={{ paddingBottom: '6px' }}
                              span={8}
                              align="center"
                            >
                              <Radio value="ECHARTS_area" style={{ width: '95%' }}>
                                <Avatar
                                  shape="square"
                                  size="large"
                                  src={`${CHART_IMG_ROOT}/datavis-charts/datavis-echarts-area.png`}
                                />
                                <p style={{ fontSize: '12px' }}>面积图</p>
                              </Radio>
                            </Col>
                            <Col
                              style={{ paddingBottom: '6px' }}
                              span={8}
                              align="center"
                            >
                              <Radio value="ECHARTS_scatter" style={{ width: '95%' }}>
                                <Avatar
                                  shape="square"
                                  size="large"
                                  src={`${CHART_IMG_ROOT}/datavis-charts/datavis-echarts-scatter.png`}
                                />
                                <p style={{ fontSize: '12px' }}>散点图</p>
                              </Radio>
                            </Col>
                          </Row>

                          <Divider style={{ margin: ' 0' }} />
                        </Panel>
                        {/* *  *Radio value="ECHARTS-PIE-AND-RADAR"**E-charts饼图,环形图,玫瑰图  key 2 */}
                        <Panel header="E-charts饼图组" id="p1" key="2">
                          <Row gutter={[8, 8]}>
                            <Col
                              style={{ paddingBottom: '6px' }}
                              span={8}
                              align="center"
                            >
                              <Radio value="ECHARTS_pie" style={{ width: '95%' }}>
                                <Avatar
                                  shape="square"
                                  size="large"
                                  src={`${CHART_IMG_ROOT}/datavis-charts/datavis-echarts-pie.png`}
                                />
                                <p style={{ fontSize: '12px' }}>饼图</p>
                              </Radio>
                            </Col>
                            <Col
                              style={{ paddingBottom: '6px' }}
                              span={8}
                              align="center"
                            >
                              <Radio value="ECHARTS_donut" style={{ width: '95%' }}>
                                <Avatar
                                  shape="square"
                                  size="large"
                                  src={`${CHART_IMG_ROOT}/datavis-charts/datavis-echarts-donut.png`}
                                />
                                <p style={{ fontSize: '12px' }}>环形图</p>
                              </Radio>
                            </Col>
                            <Col
                              style={{ paddingBottom: '6px' }}
                              span={8}
                              align="center"
                            >
                              <Radio value="ECHARTS_rose" style={{ width: '95%' }}>
                                <Avatar
                                  shape="square"
                                  size="large"
                                  src={`${CHART_IMG_ROOT}/datavis-charts/datavis-echarts-rose.png`}
                                />
                                <p style={{ fontSize: '12px' }}>玫瑰图</p>
                              </Radio>
                            </Col>
                          </Row>
                          <Divider style={{ margin: ' 0' }} />
                        </Panel>
                        {/* * *Radio value="ECHARTS-GAUGE"*E-charts仪表  key 3 */}
                        <Panel header="E-charts仪表" id="p1" key="3">
                          <Row gutter={[8, 8]}>
                            <Col
                              style={{ paddingBottom: '6px' }}
                              span={8}
                              align="center"
                            >
                              <Radio value="ECHARTS-GAUGE" style={{ width: '95%' }}>
                                <Avatar
                                  shape="square"
                                  size="large"
                                  src={`${CHART_IMG_ROOT}/datavis-charts/datavis-echarts-gauge.png`}
                                />
                                <p style={{ fontSize: '12px' }}>仪表</p>
                              </Radio>
                            </Col>
                          </Row>
                          <Divider style={{ margin: ' 0' }} />
                        </Panel>
                        {/* ** *Radio value="ECHARTS-POLAR"**E-charts极坐标  key 4 */}
                        <Panel header="E-charts极坐标图" id="p1" key="4">
                          <Row gutter={[8, 8]}>
                            <Col
                              style={{ paddingBottom: '6px' }}
                              span={8}
                              align="center"
                            >
                              <Radio value="ECHARTS-POLAR" style={{ width: '95%' }}>
                                <Avatar
                                  shape="square"
                                  size="large"
                                  src={`${CHART_IMG_ROOT}/datavis-charts/datavis-echarts-polar.png`}
                                />
                                <p style={{ fontSize: '12px' }}>极坐标图</p>
                              </Radio>
                            </Col>
                          </Row>
                          <Divider style={{ margin: ' 0' }} />
                        </Panel>
                        {/* ** *Radio value="CHART"***DataVis  key 5 */}
                        <Panel header="DataVis基础图组" id="p1" key="5">

                          <Row gutter={[8, 8]}>
                            <Col
                              style={{ paddingBottom: '6px' }}
                              span={8}
                              align="center"
                            >
                              <Radio value="CHART_line" style={{ width: '95%' }}>
                                <Avatar
                                  shape="square"
                                  size="large"
                                  src={`${CHART_IMG_ROOT}/datavis-charts/datavis-line.png`}
                                />
                                <p style={{ fontSize: '12px' }}>折线图</p>
                              </Radio>
                            </Col>
                            <Col
                              style={{ paddingBottom: '6px' }}
                              span={8}
                              align="center"
                            >
                              <Radio value="CHART_bar" style={{ width: '95%' }}>
                                <Avatar
                                  shape="square"
                                  size="large"
                                  src={`${CHART_IMG_ROOT}/datavis-charts/datavis-bar.png`}
                                />
                                <p style={{ fontSize: '12px' }}>柱状图</p>
                              </Radio>
                            </Col>
                            <Col
                              style={{ paddingBottom: '6px' }}
                              span={8}
                              align="center"
                            >
                              <Radio value="CHART_area" style={{ width: '95%' }}>
                                <Avatar
                                  shape="square"
                                  size="large"
                                  src={`${CHART_IMG_ROOT}/datavis-charts/datavis-area.png`}
                                />
                                <p style={{ fontSize: '12px' }}>面积图</p>
                              </Radio>
                            </Col>
                            <Col
                              style={{ paddingBottom: '6px' }}
                              span={8}
                              align="center"
                            >
                              <Radio value="CHART_pie" style={{ width: '95%' }}>
                                <Avatar
                                  shape="square"
                                  size="large"
                                  src={`${CHART_IMG_ROOT}/datavis-charts/datavis-pie.png`}
                                />
                                <p style={{ fontSize: '12px' }}>饼图</p>
                              </Radio>
                            </Col>
                            <Col
                              style={{ paddingBottom: '6px' }}
                              span={8}
                              align="center"
                            >
                              <Radio value="CHART_scatter" style={{ width: '95%' }}>
                                <Avatar
                                  shape="square"
                                  size="large"
                                  src={`${CHART_IMG_ROOT}/datavis-charts/datavis-scatter.png`}
                                />
                                <p style={{ fontSize: '12px' }}>散点图</p>
                              </Radio>
                            </Col>
                            <Col
                              style={{ paddingBottom: '6px' }}
                              span={8}
                              align="center"
                            >
                              <Radio value="CHART_bubble" style={{ width: '95%' }}>
                                <Avatar
                                  shape="square"
                                  size="large"
                                  src={`${CHART_IMG_ROOT}/datavis-charts/datavis-bubble.png`}
                                />
                                <p style={{ fontSize: '12px' }}>气泡图</p>
                              </Radio>
                            </Col>
                            <Col
                              style={{ paddingBottom: '6px' }}
                              span={8}
                              align="center"
                            >
                              <Radio value="CHART_heatmap" style={{ width: '95%' }}>
                                <Avatar
                                  shape="square"
                                  size="large"
                                  src={`${CHART_IMG_ROOT}/datavis-charts/datavis-heatmap.png`}
                                />
                                <p style={{ fontSize: '12px' }}>热度图</p>
                              </Radio>
                            </Col>
                            <Col
                              style={{ paddingBottom: '6px' }}
                              span={8}
                              align="center"
                            >
                              <Radio value="CHART_box" style={{ width: '95%' }}>
                                <Avatar
                                  shape="square"
                                  size="large"
                                  src={`${CHART_IMG_ROOT}/datavis-charts/datavis-box.png`}
                                />
                                <p style={{ fontSize: '12px' }}>箱型图</p>
                              </Radio>
                            </Col>
                          </Row>
                          <Divider style={{ margin: ' 0' }} />

                        </Panel>

                        {/* Radio value="TABLE"*"SUNBURST_SEQUENCE"*SANKEY*COUNTER "WORD_CLOUD" DataVis  key 6 */}
                        <Panel header="DataVis其他组" id="p1" key="6">
                          <Row gutter={[8, 8]}>
                            <Col
                              style={{ paddingBottom: '6px' }}
                              span={8}
                              align="center"
                            >
                              <Radio value="TABLE" style={{ width: '95%' }}>
                                <Avatar
                                  shape="square"
                                  size="large"
                                  src={`${CHART_IMG_ROOT}/datavis-charts/datavis-table.png`}
                                />
                                <p style={{ fontSize: '12px' }}>交叉表</p>
                              </Radio>
                            </Col>
                            <Col
                              style={{ paddingBottom: '6px' }}
                              span={8}
                              align="center"
                            >
                              <Radio value="SUNBURST_SEQUENCE" style={{ width: '95%' }}>
                                <Avatar
                                  shape="square"
                                  size="large"
                                  src={`${CHART_IMG_ROOT}/datavis-charts/datavis-sunburst.png`}
                                />
                                <p style={{ fontSize: '12px' }}>旭日图</p>
                              </Radio>
                            </Col>
                            <Col
                              style={{ paddingBottom: '6px' }}
                              span={8}
                              align="center"
                            >
                              <Radio value="SANKEY" style={{ width: '95%' }}>
                                <Avatar
                                  shape="square"
                                  size="large"
                                  src={`${CHART_IMG_ROOT}/datavis-charts/datavis-sankey.png`}
                                />
                                <p style={{ fontSize: '12px' }}>桑基图</p>
                              </Radio>
                            </Col>
                            <Col
                              style={{ paddingBottom: '6px' }}
                              span={8}
                              align="center"
                            >
                              <Radio value="COUNTER" style={{ width: '95%' }}>
                                <Avatar
                                  shape="square"
                                  size="large"
                                  src={`${CHART_IMG_ROOT}/datavis-charts/datavis-counter.png`}
                                />
                                <p style={{ fontSize: '12px' }}>计数器</p>
                              </Radio>
                            </Col>
                            <Col
                              style={{ paddingBottom: '6px' }}
                              span={8}
                              align="center"
                            >
                              <Radio value="WORD_CLOUD" style={{ width: '95%' }}>
                                <Avatar
                                  shape="square"
                                  size="large"
                                  src={`${CHART_IMG_ROOT}/datavis-charts/datavis-worldcloud.png`}
                                />
                                <p style={{ fontSize: '12px' }}>字云图</p>
                              </Radio>
                            </Col>
                          </Row>
                          <Divider style={{ margin: ' 0' }} />
                        </Panel>
                      </Collapse>
                    </Radio.Group>

                  </Row>
                </Col>
              </Row>

              <Row>
                {/* <QueriesList /> */}


                {/* <QueriesListViewDOM /> */}
                {/* <queries-list query-search-cb="$ctrl.querySearchCb" chart-type="$ctrl.chartType"></queries-list> */}
                {/* <Col style={{ paddingRight: '10px' }} /> */}
              </Row>
            </>
          )}
      </>
    );
  }
}

ChartsSearch.propTypes = {
  chartSearchCb: PropTypes.func,
  queryId: PropTypes.string,
  chartId: PropTypes.string,
  chartType: PropTypes.string
};

ChartsSearch.defaultProps = {
  chartSearchCb: (a, b, c) => { },
  queryId: null,
  chartId: null,
  chartType: null
};

export default function init(ngModule) {
  ngModule.component(
    'chartsSearch',
    react2angular(ChartsSearch, Object.keys(ChartsSearch.propTypes), [
      'appSettings',
      '$route'
    ])
  );
}

init.init = true;
