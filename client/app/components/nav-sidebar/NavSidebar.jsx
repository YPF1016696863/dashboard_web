import React from 'react';
import PropTypes from 'prop-types';
import { react2angular } from 'react2angular';
import { Upload, Icon, Layout, Menu } from 'antd';
import { appSettingsConfig } from '@/config/app-settings';

import './nav-sidebar.less';

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
    return (
      <Layout>
        <Menu
          theme="dark"
          className="full-height-nav"
          defaultOpenKeys={['sub1']}
          selectedKeys={[0]}
          mode="inline"
        >
          <Menu.Item key="5">
            <Icon type="database" />
            <span>数据源</span>
          </Menu.Item>
          <Menu.SubMenu
            key="sub2"
            title={
              <span>
                <Icon type="appstore" />
                <span>可视化组件</span>
              </span>
            }
          >
            <Menu.Item key="5">新建可视化组件</Menu.Item>
            <Menu.SubMenu key="sub3" title="Submenu">
              <Menu.Item key="7">Option 7</Menu.Item>
              <Menu.Item key="8">Option 8</Menu.Item>
            </Menu.SubMenu>
          </Menu.SubMenu>
          <Menu.SubMenu
            key="sub4"
            title={
              <span>
                <Icon type="setting" />
                <span>数据可视化面板</span>
              </span>
            }
          >
            <Menu.Item key="9">Option 9</Menu.Item>
            <Menu.Item key="10">Option 10</Menu.Item>
            <Menu.Item key="11">Option 11</Menu.Item>
            <Menu.Item key="12">Option 12</Menu.Item>
          </Menu.SubMenu>
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
      '$scope'
    ])
  );
}

init.init = true;
