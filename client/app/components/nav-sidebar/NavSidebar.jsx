import React from 'react';
import PropTypes from 'prop-types';
import { react2angular } from 'react2angular';
import { Icon, Menu } from 'semantic-ui-react';
import { appSettingsConfig } from '@/config/app-settings';
import 'semantic-ui-css/semantic.min.css';
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
    const { $location, $scope } = this.props;
    const activeItem = 'gamepad';
    return (
      <Menu icon="labeled" vertical size="small" color="#0A1733">
        <Menu.Item
          name="gamepad"
          active={activeItem === 'gamepad'}
          onClick={()=>{console.log('gamepad')}}
        >
          <Icon name="gamepad" />
          Games
        </Menu.Item>

        <Menu.Item
          name="video camera"
          active={activeItem === 'video camera'}
          onClick={()=>{console.log('gamepad')}}
        >
          <Icon name="video camera" />
          Channels
        </Menu.Item>

        <Menu.Item
          name="video play"
          active={activeItem === 'video play'}
          onClick={()=>{console.log('gamepad')}}
        >
          <Icon name="video play" />
          Videos
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
