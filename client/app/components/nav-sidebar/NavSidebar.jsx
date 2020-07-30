import React from 'react';
import PropTypes from 'prop-types';
import { react2angular } from 'react2angular';
import { Icon, Menu } from 'semantic-ui-react';
import { appSettingsConfig } from '@/config/app-settings';
import { policy } from '@/services/policy';
import { currentUser, clientConfig } from '@/services/auth';
import { navigateTo } from '@/services/navigateTo';
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
      activeItem: $location.path().split('/')[1] || 'Unknown'
    });
  }

  render() {
    const { $location, $scope } = this.props;
    return (
      <Menu icon="labeled" vertical size="datavis">
        {currentUser.isAdmin ? (
          <Menu.Item
            name="data_sources"
            active={this.state.activeItem === 'data_sources'}
            onClick={(event) => {
              if (event.ctrlKey) {
                window.open(window.location.origin + '/data_sources');
              } else {
                navigateTo('/data_sources');
                this.setState({
                  activeItem: 'data_sources'
                });
              }
            }}
          >
            <Icon name="database" style={{ fontSize: '4em !important' }} />
            <br />
            <span className="navbar-font">数据源</span>
          </Menu.Item>
        ) : null}
        <Menu.Item
          name="queries"
          active={this.state.activeItem === 'queries'}
          onClick={(event) => {
            if (event.ctrlKey) {
              window.open(window.location.origin + '/queries');
            } else {
              navigateTo('/queries');
              this.setState({
                activeItem: 'queries'
              });
            }
          }}
        >
          <Icon name="filter" style={{ fontSize: '4em !important' }} />
          <br />
          <span className="navbar-font">数据集</span>
        </Menu.Item>

        <Menu.Item
          name="queries"
          active={this.state.activeItem === 'charts'}
          onClick={(event) => {
            if (event.ctrlKey) {
              window.open(window.location.origin + '/charts');
            } else {
              navigateTo('/charts');
              this.setState({
                activeItem: 'charts'
              });
            }
          }}
        >
          <Icon name="chart pie" style={{ fontSize: '4em !important' }} />
          <br />
          <span className="navbar-font">可视化组件</span>
        </Menu.Item>

        <Menu.Item
          name="dashboards"
          active={this.state.activeItem === 'dashboards'}
          onClick={(event) => {
            if (event.ctrlKey) {
              window.open(window.location.origin + '/dashboards');
            } else {
              navigateTo('/dashboards');
              this.setState({
                activeItem: 'dashboards'
              });
            }
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
      '$location',
      'Auth'
    ])
  );
}

init.init = true;
