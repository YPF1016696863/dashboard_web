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
  Input,
  Form,
  message,
  Carousel,
  Collapse
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

import { Dashboard } from '@/services/dashboard';
import { currentUser } from '@/services/auth';
import { routesToAngularRoutes } from '@/lib/utils';

import { policy } from '@/services/policy';

const { Panel } = Collapse;

class DashboardsSearch extends React.Component {
  state = {
    loading: true,
    backgroundImages: [
      {
        meta: '无背景图片',
        image: '',
        overview: '/static/images/themeBackgroundImages/empty-overview.png',
        name: 'empty'
      },
      {
        meta: 'DataVis背景1',
        image: '/static/images/themeBackgroundImages/theme1.png',
        overview: '/static/images/themeBackgroundImages/theme1-overview.png',
        name: 'theme1Bg'
      },
      {
        meta: 'DataVis背景2',
        image: '/static/images/themeBackgroundImages/theme2.png',
        overview: '/static/images/themeBackgroundImages/theme2-overview.png',
        name: 'theme2Bg'
      },
      {
        meta: 'DataVis背景3',
        image: '/static/images/themeBackgroundImages/theme3.png',
        overview: '/static/images/themeBackgroundImages/theme3-overview.png',
        name: 'theme3Bg'
      }
    ]
  };

  componentDidMount() {
    Dashboard.allDashboards().$promise.then(res => {
      this.setState({
        loading: false
      });
    });
    message.destroy();
    message.success('点击预览查看完整数据可视化面板演示', 1);
  }

  onChange = (a, b, c) => {
    console.log(a, b, c);
  };

  render() {
    const { appSettings, dashboardSearchCb } = this.props;
    console.log(dashboardSearchCb);
    return (
      <>
        {this.state.loading && (
          <div className="align-center-div" style={{ paddingTop: '15%' }}>
            <LoadingState />
          </div>
        )}
        {!this.state.loading && (
          <>
            <Row>
              <Col>
                <Collapse
                  bordered={false}
                  defaultActiveKey={['1']}
                  style={{ backgroundColor: '#20263B' }}
                >
                  <Panel header="仪表盘背景" key="1" className="panel-border">
                    <Carousel afterChange={this.onChange}>
                      <div>
                        <img
                          src={this.state.backgroundImages[0].overview}
                          alt={this.state.backgroundImages[0].meta}
                          width="100%"
                        />
                      </div>
                      <div>
                        <img
                          src={this.state.backgroundImages[1].overview}
                          alt={this.state.backgroundImages[1].meta}
                          width="100%"
                        />
                      </div>
                      <div>
                        <img
                          src={this.state.backgroundImages[2].overview}
                          alt={this.state.backgroundImages[2].meta}
                          width="100%"
                        />
                      </div>
                      <div>
                        <img
                          src={this.state.backgroundImages[3].overview}
                          alt={this.state.backgroundImages[3].meta}
                          width="100%"
                        />
                      </div>
                    </Carousel>
                  </Panel>
                  <Panel header="基础设置" key="2" className="panel-border">
                    <p style={{ color: '#fff' }}>可视化仪表盘名称:</p>
                    <Input
                      value="新建可视化仪表盘"
                      className="board-name-input"
                    />
                  </Panel>
                  <Panel
                    header="已添加可视化组件列表:"
                    key="3"
                    className="panel-border"
                  />
                </Collapse>
              </Col>
            </Row>
          </>
        )}
      </>
    );
  }
}

DashboardsSearch.propTypes = {
  dashboardSearchCb: PropTypes.func.isRequired
};

DashboardsSearch.defaultProps = {};

export default function init(ngModule) {
  ngModule.component(
    'dashboardsSearch',
    react2angular(DashboardsSearch, Object.keys(DashboardsSearch.propTypes), [
      'appSettings'
    ])
  );
}

init.init = true;
