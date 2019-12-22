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

import './login-form.less';

const loginBackgroundImage = '/static/images/resources.png';

/* eslint class-methods-use-this: ["error", { "exceptMethods": [] }] */
class LoginForm extends React.Component {
  state = {};

  // eslint-disable-next-line class-methods-use-this
  componentDidMount() {}

  // eslint-disable-next-line class-methods-use-this
  componentWillReceiveProps(nextProps) {}

  // eslint-disable-next-line class-methods-use-this
  render() {
    const { getFieldDecorator } = this.props.form;

    return (
      <div>
        <Form onSubmit={this.handleSubmit} className="login-form">
          <Form.Item>
            {getFieldDecorator('username', {
              rules: [{ required: true, message: '用户名不能为空!' }]
            })(
              <Input
                prefix={
                  <Icon type="user" />
                }
                placeholder="用户名"
              />
            )}
          </Form.Item>
          <Form.Item>
            {getFieldDecorator('password', {
              rules: [{ required: true, message: '请输入正确的密码!' }]
            })(
              <Input
                prefix={
                  <Icon type="lock" />
                }
                type="password"
                placeholder="密码"
              />
            )}
          </Form.Item>
          <Form.Item>
            {getFieldDecorator('remember', {
              valuePropName: 'checked',
              initialValue: true
            })(<Checkbox>在本机保存登录信息</Checkbox>)}
            <a className="login-form-forgot" href="">
              忘记密码
            </a>
            <Button
              loading
              type="primary"
              htmlType="submit"
              className="login-form-button"
            >
              登录
            </Button>
          </Form.Item>
        </Form>
      </div>
    );
  }
}

LoginForm.propTypes = {};

LoginForm.defaultProps = {};

export default function init(ngModule) {
  ngModule.component(
    'loginForm',
    react2angular(
      Form.create({ name: 'datavis_login' })(LoginForm),
      Object.keys(LoginForm.propTypes),
      ['$scope', 'appSettings']
    )
  );
}

init.init = true;
