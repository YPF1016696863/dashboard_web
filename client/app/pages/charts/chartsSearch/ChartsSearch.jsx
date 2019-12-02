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
  Radio,
  BackTop,
  Tabs,
  Badge,
  Avatar,
  Empty
} from 'antd';
import PropTypes from 'prop-types';
import { react2angular } from 'react2angular';
import * as _ from 'lodash';
import { QueryTagsControl } from '@/components/tags-control/TagsControl';
import { SchedulePhrase } from '@/components/queries/SchedulePhrase';

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

const { TreeNode, DirectoryTree } = Tree;
const { Search } = Input;
const CHART_IMG_ROOT = '/static/images/';

const emptyChart = '/static/images/emptyChart.png';

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
        visualization: { type: 'new' }
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
                  visualization: { type: 'new' }
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
                  <Row>
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
                      disabled={this.state.visualization.type !== 'new'}
                      defaultValue={this.state.visualization.type}
                      onChange={e => {
                        this.props.chartSearchCb(e.target.value, true);
                      }}
                    >
                      <Radio value="CHART" style={{ width: '95%' }}>
                        <span
                          style={{ fontWeight: 'bold', paddingBottom: '6px' }}
                        >
                          DataVis基础图:
                        </span>
                        <Row gutter={[8, 8]}>
                          <Col
                            style={{ paddingBottom: '6px' }}
                            span={6}
                            align="center"
                          >
                            <Avatar
                              shape="square"
                              size="large"
                              src={`${CHART_IMG_ROOT}/datavis-charts/datavis-line.png`}
                            />
                            <p style={{ fontSize: '12px' }}>折线图</p>
                          </Col>
                          <Col
                            style={{ paddingBottom: '6px' }}
                            span={6}
                            align="center"
                          >
                            <Avatar
                              shape="square"
                              size="large"
                              src={`${CHART_IMG_ROOT}/datavis-charts/datavis-bar.png`}
                            />
                            <p style={{ fontSize: '12px' }}>柱状图</p>
                          </Col>
                          <Col
                            style={{ paddingBottom: '6px' }}
                            span={6}
                            align="center"
                          >
                            <Avatar
                              shape="square"
                              size="large"
                              src={`${CHART_IMG_ROOT}/datavis-charts/datavis-area.png`}
                            />
                            <p style={{ fontSize: '12px' }}>面积图</p>
                          </Col>
                          <Col
                            style={{ paddingBottom: '6px' }}
                            span={6}
                            align="center"
                          >
                            <Avatar
                              shape="square"
                              size="large"
                              src={`${CHART_IMG_ROOT}/datavis-charts/datavis-pie.png`}
                            />
                            <p style={{ fontSize: '12px' }}>饼图</p>
                          </Col>
                          <Col
                            style={{ paddingBottom: '6px' }}
                            span={6}
                            align="center"
                          >
                            <Avatar
                              shape="square"
                              size="large"
                              src={`${CHART_IMG_ROOT}/datavis-charts/datavis-scatter.png`}
                            />
                            <p style={{ fontSize: '12px' }}>散点图</p>
                          </Col>
                          <Col
                            style={{ paddingBottom: '6px' }}
                            span={6}
                            align="center"
                          >
                            <Avatar
                              shape="square"
                              size="large"
                              src={`${CHART_IMG_ROOT}/datavis-charts/datavis-bubble.png`}
                            />
                            <p style={{ fontSize: '12px' }}>气泡图</p>
                          </Col>
                          <Col
                            style={{ paddingBottom: '6px' }}
                            span={6}
                            align="center"
                          >
                            <Avatar
                              shape="square"
                              size="large"
                              src={`${CHART_IMG_ROOT}/datavis-charts/datavis-heatmap.png`}
                            />
                            <p style={{ fontSize: '12px' }}>热度图</p>
                          </Col>
                          <Col
                            style={{ paddingBottom: '6px' }}
                            span={6}
                            align="center"
                          >
                            <Avatar
                              shape="square"
                              size="large"
                              src={`${CHART_IMG_ROOT}/datavis-charts/datavis-box.png`}
                            />
                            <p style={{ fontSize: '12px' }}>箱型图</p>
                          </Col>
                        </Row>
                        <Divider style={{ margin: ' 0' }} />
                      </Radio>
                      <Radio value="ECHARTS" style={{ width: '95%' }}>
                        <span
                          style={{ fontWeight: 'bold', paddingBottom: '6px' }}
                        >
                          E-charts基础图:
                        </span>
                        <Row gutter={[8, 8]}>
                          <Col
                            style={{ paddingBottom: '6px' }}
                            span={6}
                            align="center"
                          >
                            <Avatar
                              shape="square"
                              size="large"
                              src={`${CHART_IMG_ROOT}/datavis-charts/datavis-echarts-line.png`}
                            />
                            <p style={{ fontSize: '12px' }}>线性图</p>
                          </Col>
                          <Col
                            style={{ paddingBottom: '6px' }}
                            span={6}
                            align="center"
                          >
                            <Avatar
                              shape="square"
                              size="large"
                              src={`${CHART_IMG_ROOT}/datavis-charts/datavis-echarts-bar.png`}
                            />
                            <p style={{ fontSize: '12px' }}>柱状图</p>
                          </Col>
                          <Col
                            style={{ paddingBottom: '6px' }}
                            span={6}
                            align="center"
                          >
                            <Avatar
                              shape="square"
                              size="large"
                              src={`${CHART_IMG_ROOT}/datavis-charts/datavis-echarts-area.png`}
                            />
                            <p style={{ fontSize: '12px' }}>面积图</p>
                          </Col>
                          <Col
                            style={{ paddingBottom: '6px' }}
                            span={6}
                            align="center"
                          >
                            <Avatar
                              shape="square"
                              size="large"
                              src={`${CHART_IMG_ROOT}/datavis-charts/datavis-echarts-scatter.png`}
                            />
                            <p style={{ fontSize: '12px' }}>散点图</p>
                          </Col>
                        </Row>
                        <Divider style={{ margin: ' 0' }} />
                      </Radio>
                      <Radio
                        value="ECHARTS-PIE-AND-RADAR"
                        style={{ width: '95%' }}
                      >
                        <span
                          style={{ fontWeight: 'bold', paddingBottom: '6px' }}
                        >
                          E-charts饼图,环形图,玫瑰图:
                        </span>
                        <Row gutter={[8, 8]}>
                          <Col
                            style={{ paddingBottom: '6px' }}
                            span={6}
                            align="center"
                          >
                            <Avatar
                              shape="square"
                              size="large"
                              src={`${CHART_IMG_ROOT}/datavis-charts/datavis-echarts-pie.png`}
                            />
                            <p style={{ fontSize: '12px' }}>饼图</p>
                          </Col>
                          <Col
                            style={{ paddingBottom: '6px' }}
                            span={6}
                            align="center"
                          >
                            <Avatar
                              shape="square"
                              size="large"
                              src={`${CHART_IMG_ROOT}/datavis-charts/datavis-echarts-donut.png`}
                            />
                            <p style={{ fontSize: '12px' }}>环形图</p>
                          </Col>
                          <Col
                            style={{ paddingBottom: '6px' }}
                            span={6}
                            align="center"
                          >
                            <Avatar
                              shape="square"
                              size="large"
                              src={`${CHART_IMG_ROOT}/datavis-charts/datavis-echarts-rose.png`}
                            />
                            <p style={{ fontSize: '12px' }}>玫瑰图</p>
                          </Col>
                        </Row>
                        <Divider style={{ margin: ' 0' }} />
                      </Radio>
                      <Radio value="COUNTER" style={{ width: '95%' }}>
                        <span
                          style={{ fontWeight: 'bold', paddingBottom: '6px' }}
                        >
                          DataVis趋势计数器:
                        </span>
                        <Row gutter={[8, 8]}>
                          <Col
                            style={{ paddingBottom: '6px' }}
                            span={6}
                            align="center"
                          >
                            <Avatar
                              shape="square"
                              size="large"
                              src={`${CHART_IMG_ROOT}/datavis-charts/datavis-counter.png`}
                            />
                            <p style={{ fontSize: '12px' }}>计数器</p>
                          </Col>
                        </Row>
                        <Divider style={{ margin: ' 0' }} />
                      </Radio>
                      <Radio value="SANKEY" style={{ width: '95%' }}>
                        <span
                          style={{ fontWeight: 'bold', paddingBottom: '6px' }}
                        >
                          DataVis桑基图:
                        </span>
                        <Row gutter={[8, 8]}>
                          <Col
                            style={{ paddingBottom: '6px' }}
                            span={6}
                            align="center"
                          >
                            <Avatar
                              shape="square"
                              size="large"
                              src={`${CHART_IMG_ROOT}/datavis-charts/datavis-sankey.png`}
                            />
                            <p style={{ fontSize: '12px' }}>桑基图</p>
                          </Col>
                        </Row>
                        <Divider style={{ margin: ' 0' }} />
                      </Radio>
                      <Radio value="SUNBURST_SEQUENCE" style={{ width: '95%' }}>
                        <span
                          style={{ fontWeight: 'bold', paddingBottom: '6px' }}
                        >
                          DataVis旭日图:
                        </span>
                        <Row gutter={[8, 8]}>
                          <Col
                            style={{ paddingBottom: '6px' }}
                            span={6}
                            align="center"
                          >
                            <Avatar
                              shape="square"
                              size="large"
                              src={`${CHART_IMG_ROOT}/datavis-charts/datavis-sunburst.png`}
                            />
                            <p style={{ fontSize: '12px' }}>旭日图</p>
                          </Col>
                        </Row>
                        <Divider style={{ margin: ' 0' }} />
                      </Radio>
                      <Radio value="TABLE" style={{ width: '95%' }}>
                        <span
                          style={{ fontWeight: 'bold', paddingBottom: '6px' }}
                        >
                          DataVis交叉表:
                        </span>
                        <Row gutter={[8, 8]}>
                          <Col
                            style={{ paddingBottom: '6px' }}
                            span={6}
                            align="center"
                          >
                            <Avatar
                              shape="square"
                              size="large"
                              src={`${CHART_IMG_ROOT}/datavis-charts/datavis-table.png`}
                            />
                            <p style={{ fontSize: '12px' }}>交叉表</p>
                          </Col>
                        </Row>
                        <Divider style={{ margin: ' 0' }} />
                      </Radio>
                      <Radio value="ECHARTS-GAUGE" style={{ width: '95%' }}>
                        <span
                          style={{ fontWeight: 'bold', paddingBottom: '6px' }}
                        >
                          E-charts仪表:
                        </span>
                        <Row gutter={[8, 8]}>
                          <Col
                            style={{ paddingBottom: '6px' }}
                            span={6}
                            align="center"
                          >
                            <Avatar
                              shape="square"
                              size="large"
                              src={`${CHART_IMG_ROOT}/datavis-charts/datavis-echarts-gauge.png`}
                            />
                            <p style={{ fontSize: '12px' }}>仪表</p>
                          </Col>
                        </Row>
                        <Divider style={{ margin: ' 0' }} />
                      </Radio>
                      <Radio value="ECHARTS-POLAR" style={{ width: '95%' }}>
                        <span
                          style={{ fontWeight: 'bold', paddingBottom: '6px' }}
                        >
                          E-charts极坐标:
                        </span>
                        <Row gutter={[8, 8]}>
                          <Col
                            style={{ paddingBottom: '6px' }}
                            span={6}
                            align="center"
                          >
                            <Avatar
                              shape="square"
                              size="large"
                              src={`${CHART_IMG_ROOT}/datavis-charts/datavis-echarts-polar.png`}
                            />
                            <p style={{ fontSize: '12px' }}>极坐标图</p>
                          </Col>
                        </Row>
                        <Divider style={{ margin: ' 0' }} />
                      </Radio>
                      <Radio value="WORD_CLOUD" style={{ width: '95%' }}>
                        <span
                          style={{ fontWeight: 'bold', paddingBottom: '6px' }}
                        >
                          DataVis字云图:
                        </span>
                        <Row gutter={[8, 8]}>
                          <Col
                            style={{ paddingBottom: '6px' }}
                            span={6}
                            align="center"
                          >
                            <Avatar
                              shape="square"
                              size="large"
                              src={`${CHART_IMG_ROOT}/datavis-charts/datavis-worldcloud.png`}
                            />
                            <p style={{ fontSize: '12px' }}>字云图</p>
                          </Col>
                        </Row>
                        <Divider style={{ margin: ' 0' }} />
                      </Radio>
                    </Radio.Group>
                  </Row>
                </Col>
              </Row>
              <Row>
                <Col style={{ paddingRight: '10px' }} />
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
  chartId: PropTypes.string
};

ChartsSearch.defaultProps = {
  chartSearchCb: (a,b) => {},
  queryId: null,
  chartId: null
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
