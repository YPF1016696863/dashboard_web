import React from 'react';
import PropTypes from 'prop-types';
import { react2angular } from 'react2angular';
import {
  PageHeader,
  Button,
  Descriptions,
  Icon,
  Divider,
  Breadcrumb
} from 'antd';
import { appSettingsConfig } from '@/config/app-settings';
import { policy } from '@/services/policy';

import './draggable-tags.less';

class DraggableTags extends React.Component {
  /*
  constructor(props) {
    super(props);
  }
  */

  componentDidMount() {}

  render() {
    const { query } = this.props;
    const newDataSourceProps = {
      type: 'primary',
      ghost: true,
      size: 'small',
      onClick: policy.isCreateDataSourceEnabled()
        ? this.showCreateSourceDialog
        : null,
      disabled: !policy.isCreateDataSourceEnabled()
    };

    return (
      <>
        <p style={{ height: '10vh' }}>xxx</p>
      </>
    );
  }
}

DraggableTags.propTypes = {
  // query: PropTypes.object.isRequired
};
DraggableTags.defaultProps = {};

export default function init(ngModule) {
  ngModule.component(
    'draggableTags',
    react2angular(DraggableTags, Object.keys(DraggableTags.propTypes), [
      '$rootScope',
      '$scope'
    ])
  );
}

init.init = true;
