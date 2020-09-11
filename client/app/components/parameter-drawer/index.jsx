import React from 'react';
import PropTypes from 'prop-types';
import { react2angular } from 'react2angular';
import * as _ from 'lodash';
import {
  Drawer,
  Form,
  Button,
  Col,
  Row,
  Input,
  Select,
  DatePicker,
  Icon,
  Alert,
  Divider
} from 'antd';
import { appSettingsConfig } from '@/config/app-settings';
import './index.less';
import { ParameterValueInput } from '@/components/ParameterValueInput';

const { Option } = Select;

class ParameterDrawer extends React.Component {
  state = { visible: false };

  componentDidMount() {
    this.setState({
      visible: this.props.open
    });
  }

  componentDidUpdate(prevProps) {
    if (this.props.open !== prevProps.open) {
      // eslint-disable-next-line react/no-did-update-set-state
      this.setState({
        visible: this.props.open
      });
    }
  }

  onClose = () => {
    this.setState({
      visible: false
    });
    this.props.onClose();
  };

  onSubmit = () => {
    this.setState({
      visible: false
    });
    this.props.onClose();
    this.props.onSubmit(this.props.params);
  };

  render() {
    console.log("para",this.props);
    return (
      <div>
        <Drawer
          destroyOnClose
          title={
            <>
              <Icon type="setting" />
              &nbsp;&nbsp;为仪表板配置参数
            </>
          }
          width={720}
          onClose={this.onClose}
          visible={this.state.visible}
          bodyStyle={{ paddingBottom: 80 }}
          drawerStyle={{}}
          headerStyle={{}}
        >
          <Alert
            message="参数配置"
            description="修改参数配置会改变当前仪表板URL的查询参数,此修改不会保存为面板的默认URL,如需修改默认参数,请修改对应数据集."
            type="info"
            showIcon
          />
          <Divider />
          <Form layout="vertical" hideRequiredMark>
            <Row gutter={16}>
              {_.map(this.props.params, parameter => (
                <Col span={12}>
                  <Form.Item
                    label={parameter.title+":"}
                    help={'ID:' + parameter.name + ',类型:' + parameter.type}
                  >
                    <ParameterValueInput
                      type={parameter.type}
                      value={parameter.normalizedValue}
                      parameter={parameter}
                      enumOptions={parameter.enumOptions}
                      queryId={parameter.queryId}
                      onSelect={value => {
                      parameter.setValue(value);
                      }}
                    />
                  </Form.Item>
                </Col>
              ))}
            </Row>
          </Form>
          <div
            style={{
              position: 'absolute',
              right: 0,
              bottom: 0,
              width: '100%',
              borderTop: '1px solid #e9e9e9',
              padding: '10px 16px',
              textAlign: 'right'
            }}
          >
            <Button onClick={this.onClose} style={{ marginRight: 8 }}>
              取消
            </Button>
            <Button onClick={this.onSubmit} type="primary">
              保存
            </Button>
          </div>
        </Drawer>
      </div>
    );
  }
}

ParameterDrawer.propTypes = {
  open: PropTypes.bool,
  onSubmit: PropTypes.func,
  onClose: PropTypes.func,
  params: PropTypes.array
};
ParameterDrawer.defaultProps = {
  open: false,
  onSubmit: () => {
    this.setState({ visible: false });
  },
  onClose: () => {
    this.setState({ visible: false });
  },
  params: []
};

export default function init(ngModule) {
  ngModule.component(
    'parameterDrawer',
    react2angular(
      Form.create()(ParameterDrawer),
      Object.keys(ParameterDrawer.propTypes),
      ['$rootScope', '$scope']
    )
  );
}

init.init = true;
