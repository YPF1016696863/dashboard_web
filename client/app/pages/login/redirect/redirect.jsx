import React from 'react';
import { Button, Input, Icon, Form, Checkbox } from 'antd';
import PropTypes from 'prop-types';
import { react2angular } from 'react2angular';
import * as _ from 'lodash';

import { currentUser } from '@/services/auth';
import { routesToAngularRoutes } from '@/lib/utils';

import { policy } from '@/services/policy';
import { $route } from '@/services/ng';
import { navigateTo } from '@/services/navigateTo';

import './redirect.less';

const loginBackgroundImage = '/static/images/resources.png';

/* eslint class-methods-use-this: ["error", { "exceptMethods": [] }] */
class Redirect extends React.Component {
  state = {};

  // eslint-disable-next-line class-methods-use-this
  componentDidMount() {
    window.location.href = window.location.origin;
  }

  // eslint-disable-next-line class-methods-use-this
  render() {
    return (
      <div>
        <img
          src="/static/images/loading.gif"
          alt="Loading..."
          width="56"
          height="56"
        />
        登陆成功,正在跳转...
      </div>
    );
  }
}

Redirect.propTypes = {};

Redirect.defaultProps = {};

export default function init(ngModule) {
  ngModule.component(
    'redirect',
    react2angular(Redirect, Object.keys(Redirect.propTypes), [
      '$scope',
      'appSettings'
    ])
  );
}

init.init = true;
