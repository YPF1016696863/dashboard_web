/* eslint-disable func-names */
import React from 'react';
import PropTypes from 'prop-types';
import { react2angular } from 'react2angular';
import * as _ from 'lodash';
import {
  Form,
  Select,
  TreeNode,
  Checkbox,
  Input,
  Tree,
  Button,
  Layout,
  Drawer,
  Modal
} from 'antd';
// import { appSettingsConfig } from '@/config/app-settings';
import './index.less';


const { Header, Footer, Sider, Content } = Layout;

let checked =[];

class RightClick extends React.Component {
  state = {
    visible: this.props.open,
    treeData: [
      {
        title: '组件列表',
        key: 'root',
        children: [
          {
            title: 'null',
            key: '0-0-0',
          },
        ],
      }
    ],
    checkWidget: [], 

  };

  componentDidMount() {
    // console.log('da');
    
    // // this.onExpand();
    // this.onSubmit();

    this.setState({
      visible: this.props.open
    });
  }

  componentWillReceiveProps(nextProps) {

    this.setState({
      visible: nextProps.open
    });
    // console.log(this.props.params);
    this.onExpand();
    // 暂时解决树的刷新问题 但是选中函数要触发才可以获取treekey
    // console.log("aaa");
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
    console.log(this.state.checkWidget);
    this.props.onClose();
    this.props.onSubmit(this.state.checkWidget,true);// true表示不为第一次进入刷新 第一次默认显示全部
  };

  onCheck = (checkedKeys, info) => {// 得到选中的组件id数组
    // console.log('onCheck', checkedKeys);
    const a = /[a-z]/i;// true,说明有英文字母 
    // eslint-disable-next-line func-names
     checked = _.filter(checkedKeys, function (item) {
      return !a.test(item);
    });
    // console.log(checked);
    this.setState({
      checkWidget: checked
    })
  };

  onExpand = (expandedKeys) => {
    // debugger
    // data query_result data_source_id 数据源id
    const dataHead = {
      title: '列表',
      key: 'root',
      children: [
        {
          title: '普通组件',
          key: 'Normal',
          children: []
        }, {
          title: '参数组件',
          key: 'Params',
          children: []
        }
      ]
    };
    console.log(this.props.params);
    // debugger
    const widgetsSourceName = _.map(this.props.params, 'query.name');
    const widgetsSourceId = _.map(this.props.params, 'data.query_result.data_source_id');
    const widgetsName = _.map(this.props.params, 'visualization.name');
    const widgetsId = _.map(this.props.params, 'id');
    // 组件是否为参数组件
    const isParamsTemp = _.map(this.props.params, 'options.parameterMappings');
    const isParams = [];
    _.forEach(isParamsTemp, function (value, key) {
      isParams.push(JSON.stringify(value) !== "{}");
    });
    // 参数组件是否有值 有值才显示在列表上
    // const isDataTemp = _.map(this.props.params, 'queryResult.query_result.data.rows');// **
    // [1].query.queryResult.query_result.data.rows
    // [2][2].queryResult.query_result.data.rows
    // [""0""].query.queryResult.filteredData
    const isDataTemp = _.map(this.props.params, 'query.queryResult.query_result.data.rows');
    
    const isData = [];
    _.forEach(isDataTemp, function (value, key) {
      let flag = false;
      if (value === undefined) {
        flag = false;
      }
      else if (value.length !== 0) {
        flag = true;
      } else {
        flag = false;
      }
      isData.push(flag);
    });
    
    // 普通组件数据源的id 名称
    let widgetsNormalSourceId = [];
    let widgetsNormalSourceName = [];
    let normalWidgetsId = [];
    let normalWidgetsName = [];
    // 参数组件数据源的id 名称
    let widgetsParamsSourceId = [];
    let widgetsParamsSourceName = [];
    let paramsWidgetsId = [];
    let paramsWidgetsName = [];
    for (let i = 0; i < isParams.length; i += 1) {
      if (!isParams[i]) {// 普通组件  
        // 数据源
        widgetsNormalSourceId[i] = widgetsSourceId[i];
        widgetsNormalSourceName[i] = widgetsSourceName[i];
        // 组件
        normalWidgetsId[i] = widgetsId[i];
        normalWidgetsName[i] = widgetsName[i];
        // 参数数据源初始值
        widgetsParamsSourceId[i] = 0;
        widgetsParamsSourceName[i] = 0;
        // 参数组件初始值
        paramsWidgetsId[i] = 0;
        paramsWidgetsName[i] = 0;
      } else {// 是参数组件
        // if (isData[i]) {// 此时的参数有数据
          widgetsParamsSourceId[i] = widgetsSourceId[i];
          widgetsParamsSourceName[i] = widgetsSourceName[i];
          paramsWidgetsId[i] = widgetsId[i];
          paramsWidgetsName[i] = widgetsName[i];
        // } else { // 没有选中有效参数 不显示数据源和组件 
        //   widgetsParamsSourceId[i] = 0;
        //   widgetsParamsSourceName[i] = 0;
        //   paramsWidgetsId[i] = 0;
        //   paramsWidgetsName[i] = 0;
        // }
        // 普通组件初始值
        widgetsNormalSourceId[i] = 0;
        widgetsNormalSourceName[i] = 0;
        normalWidgetsId[i] = 0;
        normalWidgetsName[i] = 0;
      }
    }
    widgetsNormalSourceId = _.pull(_.uniq(widgetsNormalSourceId), 0);
    widgetsNormalSourceName = _.pull(_.uniq(widgetsNormalSourceName), 0);
    widgetsParamsSourceId = _.pull(_.uniq(widgetsParamsSourceId), 0);
    widgetsParamsSourceName = _.pull(_.uniq(widgetsParamsSourceName), 0);

    normalWidgetsId = _.pull(_.uniq(normalWidgetsId), 0);
    normalWidgetsName = _.pull(_.uniq(normalWidgetsName), 0);
    paramsWidgetsId = _.pull(_.uniq(paramsWidgetsId), 0);
    paramsWidgetsName = _.pull(_.uniq(paramsWidgetsName), 0);


    const normalChild = [];
    const paramsChild = [];
    // 数据源层
    for (let i = 0; i < widgetsNormalSourceId.length; i += 1) {
      normalChild.push(
        {
          title: "数据来源:" + (widgetsNormalSourceName[i]===undefined?"文本":widgetsNormalSourceName[i]),
          key: "IDN" + widgetsNormalSourceId[i],// 前面加个id 到时候筛选出来不要
          children: []
        }
      )
    }
    for (let i = 0; i < widgetsParamsSourceId.length; i += 1) {
      paramsChild.push(
        {
          title: "数据来源:" + widgetsParamsSourceName[i],
          key: "IDP" + widgetsParamsSourceId[i],// 前面加个id 到时候筛选出来不要
          children: []
        }
      )
    }
    dataHead.children[0].children = normalChild;
    dataHead.children[1].children = paramsChild;
    // console.log(dataHead);
    // 组件层 找到对应数据源id 放入child层 

    for (let i = 0; i < normalWidgetsId.length; i += 1) {
      // 找到普通组件在原id数组的位置  对应找到数据源的id 填入响应child
      const index = _.findIndex(widgetsId, function (o) { return o === normalWidgetsId[i]; });
      // console.log(dataHead.children[0].children.length); 
      for (let j = 0; j < dataHead.children[0].children.length; j += 1) {
        // 数据源匹配
        if (dataHead.children[0].children[j].key + "" === "IDN" + widgetsSourceId[index] + "") {
          dataHead.children[0].children[j].children.push({
            title: normalWidgetsName[i],
            key: normalWidgetsId[i],
            children: []
          })
        }
      }
    }

    for (let i = 0; i < paramsWidgetsId.length; i += 1) {
      // 找到参数组件在原id数组的位置  对应找到数据源的id 填入响应child
      const index = _.findIndex(widgetsId, function (o) { return o === paramsWidgetsId[i]; });
      for (let j = 0; j < dataHead.children[1].children.length; j += 1) {
        // 数据源匹配
        if (dataHead.children[1].children[j].key + "" === "IDP" + widgetsSourceId[index] + "") {
          dataHead.children[1].children[j].children.push({
            title: paramsWidgetsName[i],
            key: paramsWidgetsId[i],
            children: []
          })
        }
      }
    }

    console.log(dataHead);


    this.setState({
      treeData: [dataHead]
    });
  }

  // onLoadData=()=>{
  //   console.log("asdasd");
  //   this.onExpand();
  // }

  render() {

    return (
      <div>
        <Drawer
          title=""
          // eslint-disable-next-line react/jsx-boolean-value
          closable={true}
          onClose={this.onClose}
          visible={this.state.visible}
          placement="left"
          width="25%"
        >
          <Tree
            // eslint-disable-next-line react/jsx-boolean-value
            checkable={true}
            // autoExpandParent={false}
            // eslint-disable-next-line react/jsx-boolean-value
            defaultExpandAll={false}
            // eslint-disable-next-line react/jsx-no-duplicate-props
            autoExpandParent={false}
            // defaultCheckedKeys={['root']}
            // defaultSelectedKeys={['root']}
            onExpand={this.onExpand}
            onCheck={this.onCheck}
            loadData={this.onLoadData}
            treeData={this.state.treeData}
          />
          <Button type="primary" onClick={this.onSubmit} style={{ position:'absolute', bottom: '4%',left: '60%'}}>
            确认
          </Button>
        </Drawer>
        {/* <Modal
          title=""
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
            // eslint-disable-next-line react/jsx-no-duplicate-props
            autoExpandParent={false}
            onExpand={this.onExpand}
            onCheck={this.onCheck}
            loadData={this.onLoadData}
            treeData={this.state.treeData}
          />
        </Modal> */}
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
