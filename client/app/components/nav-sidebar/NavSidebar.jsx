import React from 'react';
import PropTypes from 'prop-types';
import { react2angular } from 'react2angular';
import { Icon, Layout, Menu, Sider } from 'antd';
import { appSettingsConfig } from '@/config/app-settings';

import './nav-sidebar.less';

const { SubMenu } = Menu;

class NavSidebar extends React.Component {
  constructor(props) {
    super(props);
    // const {$rootScope} = props;
    // Get theme flag from rootScope first, if not exist, set to false, which means use light theme.
    this.state = { collapsed: false };
  }

  componentDidMount() {}

  toggle = () => {
    this.setState({
      collapsed: !this.state.collapsed
    });
  };

  render() {
    const { $location, $scope } = this.props;

    return (
      <Layout className="full-height">
        <div className="nav-logo" />
        <Menu
          defaultSelectedKeys={['1']}
          defaultOpenKeys={[]}
          mode="inline"
          theme="dark"
          className="full-height-nav"
          inlineCollapsed={this.state.collapsed}
        >
          <Menu.Item key="1">
            <Icon type="home" />
            <span>首页</span>
          </Menu.Item>
          <Menu.Item
            key="2"
            onClick={() => {
              $location.path('/data_sources');
              $scope.$apply();
            }}
          >
            <Icon type="database" />
            <span>数据源</span>
          </Menu.Item>
          <SubMenu
            key="queries"
            title={
              <span>
                <Icon type="file-search" />
                <span>数据查询</span>
              </span>
            }
          >
            <Menu.Item key="15">Option 5</Menu.Item>
            <Menu.Item key="26">Option 6</Menu.Item>
            <Menu.Item key="37">Option 7</Menu.Item>
            <Menu.Item key="48">Option 8</Menu.Item>
          </SubMenu>
          <SubMenu
            key="widgets"
            title={
              <span>
                <Icon type="pie-chart" />
                <span>可视化组件</span>
              </span>
            }
          >
            <Menu.Item key="5">Option 5</Menu.Item>
            <Menu.Item key="6">Option 6</Menu.Item>
            <Menu.Item key="7">Option 7</Menu.Item>
            <Menu.Item key="8">Option 8</Menu.Item>
          </SubMenu>
          <SubMenu
            key="dashboards"
            title={
              <span>
                <Icon type="desktop" />
                <span>可视化大屏</span>
              </span>
            }
          >
            <Menu.Item key="9">Option 9</Menu.Item>
            <Menu.Item key="10">Option 10</Menu.Item>
            <SubMenu key="dashboardSubs" title="Submenu">
              <Menu.Item key="11">Option 11</Menu.Item>
              <Menu.Item key="12">Option 12</Menu.Item>
            </SubMenu>
          </SubMenu>
        </Menu>
      </Layout>
    );
  }
}

NavSidebar.propTypes = {};
NavSidebar.defaultProps = {};

export default function init(ngModule) {
  ngModule.component(
    'navSidebar',
    react2angular(NavSidebar, Object.keys(NavSidebar.propTypes), [
      '$rootScope',
      '$scope',
      '$location'
    ])
  );
}

init.init = true;
