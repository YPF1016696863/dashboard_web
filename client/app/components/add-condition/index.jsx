import React from 'react';
import PropTypes from 'prop-types';
import { react2angular } from 'react2angular';
import * as _ from 'lodash';
import { PlusCircleOutlined, DeleteOutlined } from '@ant-design/icons';
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
  Empty,
  Switch
} from 'antd';
import { appSettingsConfig } from '@/config/app-settings';
import { Query } from '@/services/query';

import { Widget } from '@/services/widget';

const { Option } = Select;

let conditionNum=[];
let conditionKey=[];
let conditionValue=[];
let row=[];// 字段数据
const corList=[];// 每一列的数据（筛选时使用）
let conditionRes={};// 条件json结果 传到父组件
let cont=0;
let fatherParameter = [];
let id=0;
let keyName="";
let xialaName="";
let enumOptionsArray = [];
let switcharray = [];

export class AddCondition extends React.Component { 

  constructor(props) {
    super(props);
    this.state = {
      conditionNumState: [],
      conditionKeyState: [],
      conditionValueState: [],
      rowState:[],// 所有字段名
      corListState:[],// 筛选的值
      switchState:[],// 开启别名列 传到父组件
      keyState:"",// key 传到父组件
      xialaState:""
    };
  }

  componentDidMount() {
    if(this.props.selectedcondiRes.global!==undefined&&this.props.selectedcondiRes.global!==null){
      id = this.props.selectedcondiRes.queryId;
      this.whereUpdata();
      const values = Object.values(this.props.selectedcondiRes.global[0][0]);
      conditionValue=[];
      for(let i=0;i<values.length;i+=1){
        conditionValue[i]=values[i];
      }
      // values=_.concat([0],values);
      // console.log(values);
      const keys = Object.keys(this.props.selectedcondiRes.global[0][0]);
      conditionKey = [];
      for(let i=0;i<keys.length;i+=1){
        conditionKey[i]=keys[i];
      }
      // keys=_.concat([0],keys);
      cont=keys===undefined?-1:keys.length-1;
      // console.log(keys);
      conditionNum = [];
      for(let i=0;i<keys.length;i+=1){
        conditionNum[i]=i;
      }

      console.log( "fatherParameter",this.props);
      // 给下拉框一个默认初值传入（父传子 props传>
      const resTemp = _.filter(fatherParameter, this.props.selectedcondiRes.global[0][0]);
      const keyNameTemp = this.props.selectedcondiRes.global[1][0];
      const xialaNameTemp = this.props.selectedcondiRes.global[2][0];
      const keyListTemp = _.map(resTemp, keyNameTemp);
      const xialaListTemp = _.map(resTemp, xialaNameTemp);
      enumOptionsArray = [];
      for (let i = 0; i < xialaListTemp.length; i += 1) {
        enumOptionsArray.push(
          {
            name: xialaListTemp[i],
            key: keyListTemp[i]
          }
        )
      }
      console.log("enumOptionArray",enumOptionsArray);
      switcharray = [];
      const switchtemp = this.props.selectedcondiRes.global[5][0];
      for(let i=0;i<switchtemp.length;i+=1){
          switcharray[i] = switchtemp[i];
      }
      // console.log(conditionNum);
      this.setState({
        conditionKeyState:keys,
        conditionValueState:values,
        keyState:this.props.selectedcondiRes.global[1][0],// key列
        xialaState:this.props.selectedcondiRes.global[2][0],// user列
        conditionNumState:conditionNum,// 条件数量的数组
        switchState:switcharray,
        rowState: row
      });
    }
  }

  upDataRow = () => {
    this.whereUpdata();
    this.setState({
      rowState: row
    });
  }

  upDataList = (item) => {
    corList[item]=_.map(this.state.fatherParameter,this.state.conditionKeyState[item]);
    this.setState({
      corListState: corList
    });
    
  }

  // row,fatherParameter,enumOptionsArray
  whereUpdata = () => {
    
    id = this.props.selectedcondiRes.queryId;
    Query.query({ id })
      .$promise.then(query => {
        query
          .getQueryResultPromise()
          .then(queryRes => {
            fatherParameter = queryRes.query_result.data.rows;// 后执行
            if (fatherParameter !== [] && fatherParameter !== undefined && fatherParameter !== null) {
              row = Object.keys(fatherParameter[0]);
              
            }
          }
          )
          .catch(err => {
            query
              .getQueryResultByText(-1, query.query)
              .toPromise()
              .then(queryRes => {
                fatherParameter = queryRes.query_result.data.rows;// 后执行
                if (fatherParameter !== [] && fatherParameter !== undefined && fatherParameter !== null) {
                  row = Object.keys(fatherParameter[0]);
                   // 给下拉框一个默认初值传入（父传子 props传>
                  const resTemp = _.filter(fatherParameter, this.props.selectedcondiRes.global[0][0]);
                  const keyNameTemp = this.props.selectedcondiRes.global[1][0];
                  const xialaNameTemp = this.props.selectedcondiRes.global[2][0];
                  const keyListTemp = _.map(resTemp, keyNameTemp);
                  const xialaListTemp = _.map(resTemp, xialaNameTemp);
                  enumOptionsArray = [];
                  for (let i = 0; i < xialaListTemp.length; i += 1) {
                    enumOptionsArray.push(
                      {
                        name: xialaListTemp[i],
                        key: keyListTemp[i]
                      }
                    )
                  }
                }
              })
              .catch(ex => {
                console.log(ex);
                console.log(this.state);
              });
          });

      })
      .catch(err => {
        console.log(err);
      })
  }


  addCondition = () => {
    //  // 填完值才可以加
    cont += 1;
    conditionNum.push(cont);
    this.setState({
      conditionNumState: conditionNum
    });
  }

  deleteCondition = (e) => {
    cont -= 1;
    switcharray.splice(parseInt(e.currentTarget.id, 10),1);
    _.pull(conditionNum, parseInt(e.currentTarget.id, 10));
    conditionKey.splice(parseInt(e.currentTarget.id, 10),1);
    conditionValue.splice(parseInt(e.currentTarget.id, 10),1);
    this.setState({
      conditionNumState: conditionNum,
      conditionKeyState:conditionKey,
      conditionValueState:conditionValue,
      switchState: switcharray
    });
    this.merage();
    // console.log(this.state)
    // 删除一个条件的时候 需要对数组进行删除操作
    // conditionKV[parseInt(e.currentTarget.id, 10)] = " ";
    // andorKV[parseInt(e.currentTarget.id, 10)] = " ";
    // conditionZiduanKV[parseInt(e.currentTarget.id, 10)] = " ";
    // fuhaoKV[parseInt(e.currentTarget.id, 10)] = " ";
    // andorKV[1] = " ";
  };

  // 筛选的列名
  whereKey = (i, v) => {
    conditionKey[i] = v;

    this.setState({
      conditionKeyState: conditionKey
    });
    // console.log(this.state);
    this.merage();
  }

  // 改列名的值
  whereVaule = (i, v) => {
    conditionValue[i] = v;

    this.setState({
      conditionValueState: conditionValue
    });
    // console.log(this.state); 
    this.merage();
  }

  keyValue=(v)=>{
    keyName=v;
    this.merage();
    this.setState({
      keyState: keyName
    });
  }

  xialaValue=(v)=>{
    xialaName=v;
    this.merage();
    this.setState({
      xialaState: xialaName
    });
  }


  // 整合为条件json格式
  merage = () => {
    conditionRes = {};
    for (let i = 0; i < this.state.conditionNumState.length; i += 1) {
      const index = this.state.conditionNumState[i]
      if (this.state.conditionKeyState[index] !== null && 
        this.state.conditionKeyState[index] !== undefined && 
        this.state.conditionKeyState[index] !== ''
        ) {
        conditionRes[this.state.conditionKeyState[index]] = this.state.conditionValueState[index];
      }
    }

    this.props.condiRes(conditionRes);// 发送到父组件
    this.props.keyRes(keyName);
    this.props.xialaRes(xialaName);
    this.props.condiNum(this.state.conditionNumState);
    this.props.defaultValueForInput(enumOptionsArray);
    this.props.switchInput(switcharray);
  }

  // 别名开关
  switchChange=(item)=>{

    if(switcharray ===null || switcharray === undefined ||
        switcharray[item]===null||switcharray[item]===undefined){
        switcharray[item]=true;
      for (let i=0;i<switcharray.length;i+=1){
        if (i!==item && switcharray[i]===true){
            switcharray[i] = false;
        }
      }
    }else{
        switcharray[item]=!switcharray[item];
        if(switcharray[item] === true){
            for (let i=0;i<switcharray.length;i+=1){
                if (i!==item && switcharray[i]===true){
                    console.log("i",i,item);
                    switcharray[i] = false;
                }
            }
        }
    };

    let flag = false;

    for(let i=0; i<switcharray.length;i+=1){
    flag = switcharray[i] && flag
    }

    if (flag === false){
        xialaName = "";
    }
    this.setState({
      switchState:switcharray,
      xialaState:xialaName
    });
    this.merage();
  };


  render() {
    this.whereUpdata();
    return (
      <div>        
        <PlusCircleOutlined onClick={this.addCondition}>增加</PlusCircleOutlined>
        {this.state.conditionNumState.map((item) => {
          return (
            <div>
              筛选列名：
              <Select 
                defaultValue={"列名"+item}
                style={{width:'20%'}}
                value={this.state.conditionKeyState[item]===undefined?"":this.state.conditionKeyState[item]}
                onChange={(e)=>this.whereKey(item,e)} 
                onDropdownVisibleChange={this.upDataRow}
              >
                {row.map(option => (<Option key={option} value={option}>{option}</Option>))}
              </Select>
              =
              <Input 
                style={{width:'20%'}} 
                placeholder="列值"  
                value={this.state.conditionValueState[item]===undefined || this.state.conditionValueState[item] === ""
                    ?"":this.state.conditionValueState[item]}
                onChange={(e)=>this.whereVaule(item,e.target.value)}
              />
              <Switch
                checkedChildren=""
                unCheckedChildren=""
                checked={this.state.switchState[item]}
                size="small"
                onChange={()=>this.switchChange(item)}
              />
              {this.state.switchState[item]&&(                 
                <Select
                  defaultValue={"别名"+item}
                  value={this.state.xialaState}
                  style={{width:'20%'}}
                  onDropdownVisibleChange={this.upDataRow}
                  onChange={e=>this.xialaValue(e)}
                >
                  {row.map(option => (<Option key={option} value={option}>{option}</Option>))}
                </Select>
              )}
              <DeleteOutlined id={item} onClick={this.deleteCondition} />
            </div>
          )            
        })}
        <br />
        目标列(key列): 
        <Select 
          defaultValue="目标名称" 
          value={this.state.keyState===undefined?"":this.state.keyState} 
          style={{width:'20%'}} 
          onDropdownVisibleChange={this.upDataRow}
          onChange={e=>this.keyValue(e)}
        >
          {row.map(option => (<Option key={option} value={option}>{option}</Option>))}
        </Select>
      </div>
    );
  }
}

AddCondition.propTypes = { 
  selectedcondiRes: PropTypes.any,
  // selectedkeyRes: PropTypes.any,
  // selectedxialaRes: PropTypes.any,
  

  condiRes: PropTypes.func.isRequired,
  keyRes: PropTypes.func.isRequired,
  xialaRes: PropTypes.func.isRequired,
  condiNum: PropTypes.func.isRequired,
  defaultValueForInput: PropTypes.func.isRequired,
  switchInput:PropTypes.func.isRequired
};
AddCondition.defaultProps = { 
  selectedcondiRes: null,
  // selectedkeyRes: null,
  // selectedxialaRes: null,
};

export default function init(ngModule) {
  ngModule.component(
    'addCondition',
    react2angular(
      Form.create()(AddCondition),
      Object.keys(AddCondition.propTypes),
      ['$rootScope', '$scope']
    )
  );
}

init.init = true;
