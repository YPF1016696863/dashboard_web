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
import { Widget } from '@/services/widget';

const { Option } = Select;
let name=[];
let key=[];
export class ParameterDrawerC extends React.Component { 

  constructor(props) {
    super(props);
    this.state = {
      nameState:[],
      keyState:[]
    };
  }
  // componentDidMount() {
  //   this.getChildrenMsg 
  // }

  onSubmit = () => {  
    
    this.props.onSubmit(this.props.params);
    // 提交后要在执行查询刷新下拉框？
  };

  getChildrenMsg = (msg) => {   
    // debugger 
    name=msg.switchResState;
    key=msg.resultState;
    console.log(this.state.nameState);
    console.log(this.state.keyState);
  }

  render() {
    console.log("show parameter",this.props.params);
    return (
      <div> 
        <Form layout="vertical" hideRequiredMark>
          <Row gutter={[8, 8]}>

            {_.map(this.props.params, parameter => (
              <Col span={6}>
                <Form.Item
                  label={parameter.title + ":"}
                  style={{color:'rgba(250, 250, 248, 0.85)  !important'}}
                  // help={'ID:' + parameter.name + ',类型:' + parameter.type}
                >
                  <ParameterValueInput
                    type={parameter.type}
                    value={parameter.normalizedValue}
                    parameter={parameter}
                    enumOptions={parameter.enumOptions}
                    queryId={parameter.queryId}
                    onSelect={value => {
                      parameter.setValue(value);
                      this.onSubmit();
                    }}
                    // parent={this}
                  />
                </Form.Item>
              </Col>
            ))}
           
          </Row>
        </Form> 
      </div>
    );
  }
}

ParameterDrawerC.propTypes = { 
  onSubmit: PropTypes.func,
  // onClose: PropTypes.func,
  params: PropTypes.array
};
ParameterDrawerC.defaultProps = { 
  onSubmit: () => {  }, 
  params: []
};

export default function init(ngModule) {
  ngModule.component(
    'parameterDrawerC',
    react2angular(
      Form.create()(ParameterDrawerC),
      Object.keys(ParameterDrawerC.propTypes),
      ['$rootScope', '$scope']
    )
  );
}

init.init = true;
