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
  Divider,
  Tree,
  Modal
} from 'antd';
import { appSettingsConfig } from '@/config/app-settings';
import './index.less';

const { Option } = Select;

class RightClick extends React.Component {
  state = {
    visible: this.props.open,
    treeData: [
      {
        title: '组件列表',
        key: '0-0',
        children: [
          {
            title: 'null',
            key: '0-0-0',
          },
        ],
      }
    ],
    checkWidget:[]

  };

  componentDidMount() {
    this.setState({
      visible: this.props.open
    });
    // console.log("componentDidMount");
  }

  componentWillReceiveProps(nextProps) {

    this.setState({
      visible: nextProps.open
    });
    // console.log("nextProps.open::" + nextProps.open);
  }

  // componentDidUpdate(prevProps) {
  //   console.log(this.props.open+"::::"+prevProps.open);
  //   if (this.props.open !== prevProps.open) {
  //     // eslint-disable-next-line react/no-did-update-set-state
  //     this.setState({
  //       visible: this.props.open
  //     }); 
  //   } 

  // }

  onClose = () => {
    this.setState({
      visible: false
    });
    this.props.onClose();
  };
  
   

  onSubmit = () => {
    // console.log(this.props.params);
    this.setState({
      visible: false
    });
    // console.log("onSubmit");
    this.props.onClose();
    this.props.onSubmit(this.state.checkWidget);
  };

  onCheck = (checkedKeys, info) => {// 得到选中的组件id数组
    // console.log('onCheck', checkedKeys, info);
    const a = /[a-z]/i;// true,说明有英文字母 
    // eslint-disable-next-line func-names
    const checked = _.filter(checkedKeys, function (item) {
      return !a.test(item);
    });
    // console.log(checked);
    this.setState({
      checkWidget:checked
    })
  };

  onExpand = (expandedKeys) => {
    // data query_result data_source_id 数据源id
    const dataHead = {
      title: '组件列表',
      key: '0-0',
      children: []
    };
    // console.log(this.props.params);
    const widgetsSourceName = _.map(this.props.params, 'query.name');
    const widgetsSourceId = _.map(this.props.params, 'data.query_result.data_source_id')
    const widgetsName = _.map(this.props.params, 'visualization.name')
    const widgetsId = _.map(this.props.params, 'id')
    // console.log(widgetsSourceName);

    // 除去重复id
    const cildId = _.uniq(widgetsSourceId);
    const cildName = _.uniq(widgetsSourceName);
    // console.log(cildName);
    // 对应数据源id生成child
    const childData = [];
    for (let i = 0; i < cildId.length; i += 1) {
      childData.push({
        title: "数据来源:" + cildName[i],
        key: "ID" + cildId[i],// 前面加个id 到时候筛选出来不要
        children: []
      }
      );
    }
    // console.log(childData);
    dataHead.children = childData;
    // console.log(dataHead);
    // 和数据源一一对应 放入组件名称
    for (let i = 0; i < widgetsSourceId.length; i += 1) {// 第一个数据源 对应的组件名称
      for (let j = 0; j < cildId.length; j += 1) {
        // 找到数据源在child的位置，放入组件名称
        if (dataHead.children[j].key === ("ID" + widgetsSourceId[i])) {
          // console.log(dataHead.children[j].title);
          dataHead.children[j].children.push({
            title: widgetsName[i],
            key: widgetsId[i],
          });
        }
      }
    }

    // console.log(dataHead);


    this.setState({
      treeData: [dataHead]
    });
  }

  render() {

    return (
      <div>
        <Modal
          title="组件列表"
          visible={this.state.visible}
          onOk={this.onSubmit}
          onCancel={this.onClose}
        >
          <Tree
            // eslint-disable-next-line react/jsx-boolean-value
            checkable={true}
            autoExpandParent={false}
            defaultExpandAll={false}
            // defaultSelectedKeys={ }
            // defaultCheckedKeys={ }
            onExpand={this.onExpand}
            onCheck={this.onCheck}
            loadData={this.onLoadData}
            treeData={this.state.treeData}
          />
        </Modal>
      </div>
    );
  }
}

RightClick.propTypes = {
  open: PropTypes.bool,
  onClose: PropTypes.func,
  // eslint-disable-next-line react/no-unused-prop-types
  onSubmit: PropTypes.func,
  // eslint-disable-next-line react/forbid-prop-types
  params: PropTypes.array
};
RightClick.defaultProps = {
  open: false,
  onClose: () => {
    this.setState({ visible: false });
  },
  onSubmit: () => {
    this.setState({ visible: false });
  },
  params: []
};

export default function init(ngModule) {
  ngModule.component(
    'rightClick',
    react2angular(
      Form.create()(RightClick),
      Object.keys(RightClick.propTypes),
      ['$rootScope', '$scope']
    )
  );
}

init.init = true;
