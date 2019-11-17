import React from 'react';
import PropTypes from 'prop-types';
import { react2angular } from 'react2angular';
import { Icon, Menu } from 'semantic-ui-react';
import { appSettingsConfig } from '@/config/app-settings';
import navigateTo from '@/services/navigateTo';
import 'semantic-ui-css/semantic.min.css';
import './nav-sidebar.less';

class NavSidebar extends React.Component {
  constructor(props) {
    super(props);
    // const {$rootScope} = props;
    // Get theme flag from rootScope first, if not exist, set to false, which means use light theme.
    this.state = { activeItem: null };
  }

  componentDidMount() {
      const { $location, $scope } = this.props;
      this.setState({
          activeItem: $location.path().split("/")[1]||"Unknown"
      });
  }

  render() {
    const { $location, $scope } = this.props;
    return (
      <Menu icon="labeled" vertical size="datavis">
        <Menu.Item
          name="data_sources"
          active={this.state.activeItem === 'data_sources'}
          onClick={() => {
            this.setState({
              activeItem: 'data_sources'
            });
            navigateTo('/data_sources');
          }}
        >
          <Icon name="database" style={{ fontSize: '4em !important' }} />
          <br />
          <span className="navbar-font">数据源</span>
        </Menu.Item>

        <Menu.Item
          name="queries"
          active={this.state.activeItem === 'queries'}
          onClick={() => {
            this.setState({
              activeItem: 'queries'
            });
            navigateTo('/queries');
          }}
        >
          <Icon name="filter" style={{ fontSize: '4em !important' }} />
          <br />
          <span className="navbar-font">数据集</span>
        </Menu.Item>

        <Menu.Item
          name="queries"
          active={this.state.activeItem === 'charts'}
          onClick={() => {
            this.setState({
              activeItem: 'charts'
            });
            navigateTo('/charts');
          }}
        >
          <Icon name="chart pie" style={{ fontSize: '4em !important' }} />
          <br />
          <span className="navbar-font">可视化组件</span>
        </Menu.Item>

        <Menu.Item
          name="dashboards"
          active={this.state.activeItem === 'dashboards'}
          onClick={() => {
            this.setState({
              activeItem: 'dashboards'
            });
            navigateTo('/dashboards');
          }}
        >
          <Icon name="dashboard" style={{ fontSize: '4em !important' }} />
          <br />
          <span className="navbar-font">仪表盘</span>
        </Menu.Item>
      </Menu>
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
