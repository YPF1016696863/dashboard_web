import React from 'react';
import _ from 'lodash';
import PropTypes from 'prop-types';
import { react2angular } from 'react2angular';
import Select from 'antd/lib/select';
import Input from 'antd/lib/input';
import InputNumber from 'antd/lib/input-number';
import { Query } from '@/services/query';
import { DateInput } from './DateInput';
import { DateRangeInput } from './DateRangeInput';
import { DateTimeInput } from './DateTimeInput';
import { DateTimeRangeInput } from './DateTimeRangeInput';
import { QueryBasedParameterInput } from './QueryBasedParameterInput';
import { QueryQueryParameterInput } from './QueryQueryParameterInput';

const { Option } = Select;
let fatherParameter = [];
let id = 0;

let keyName = "";
let keyList = [];
let xialaName = "";
let xialaList = [];
let condition={};
let enumOptionsArrayForQuery = [];

export class ParameterValueInput extends React.Component {
  static propTypes = {
    type: PropTypes.string,
    value: PropTypes.any, // eslint-disable-line react/forbid-prop-types
    enumOptions: PropTypes.string,
    queryId: PropTypes.number,
    parameter: PropTypes.any, // eslint-disable-line react/forbid-prop-types
    onSelect: PropTypes.func,
    className: PropTypes.string,
  };

  static defaultProps = {
    type: 'text',
    value: null,
    enumOptions: '',
    queryId: null,
    parameter: null,
    onSelect: () => { },
    className: '',
  };

  constructor(props) {
    super(props);
    this.state = {
      fatherParameterState: [],
      loader: true,
      keyNameState: "",
      xialaNameState: "",

      
      switchResState: [],
      keyname: '',
      conditionState: null,
      resultState: [],
      enumOptionsArrayState:[{
        name: "无.",
        key: "null"
      }],
    };
  }

  componentWillMount(){
    // console.log('componentWillMount');
     if (this.props.type === 'query') {
      id = this.props.parameter.queryId;
      this.setState({
        loader: true,
      });
      Query.query({ id })
        .$promise.then(query => {
          query
            .getQueryResultPromise()
            .then(queryRes => {
              fatherParameter = queryRes.query_result.data.rows;// 后执行
              if (fatherParameter !== [] && fatherParameter !== undefined && fatherParameter !== null) {
                
                this.whereUpdata();
                // console.log(fatherParameter);
                if(enumOptionsArrayForQuery.length===0){
                  enumOptionsArrayForQuery.push(
                    {
                      name: "无",
                      key: "null"
                    }
                  )
                }
                this.setState({
                  fatherParameterState: fatherParameter,
                  resultState: keyList,
                  switchResState: xialaList,
                  conditionState:condition,
                  loader: false,

                  keyNameState: keyName,
                  xialaNameState: xialaName,
                  enumOptionsArrayState:enumOptionsArrayForQuery
                });


              }
            }
            )
            .catch(err => {
              query
                .getQueryResultByText(-1, query.query)
                .toPromise()
                .then(queryRes => {
                  fatherParameter = queryRes.query_result.data.rows;// 后执行
                  // console.log(fatherParameter);
                  if (fatherParameter !== [] && fatherParameter !== undefined && fatherParameter !== null) {
                    this.whereUpdata();
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
  }

  componentDidMount() {
    // console.log("下拉框初始化函数");
    // console.log(this.state);
    if (this.props.type === 'query') {
      id = this.props.parameter.queryId;
      this.setState({
        loader: true,
      });
      Query.query({ id })
        .$promise.then(query => {
          query
            .getQueryResultPromise()
            .then(queryRes => {
              fatherParameter = queryRes.query_result.data.rows;// 后执行
              if (fatherParameter !== [] && fatherParameter !== undefined && fatherParameter !== null) {
                // console.log(fatherParameter);
                this.whereUpdata();
                // console.log(keyList);
                // console.log(xialaName);
                // this.props.parent.getChildrenMsg( this.state);// 子组件传给父组件
                if(enumOptionsArrayForQuery.length===0){
                  enumOptionsArrayForQuery.push(
                    {
                      name: "无",
                      key: "null"
                    }
                  )
                }
                this.setState({
                  fatherParameterState: fatherParameter,
                  resultState: keyList,
                  switchResState: xialaList,
                  conditionState:condition,
                  loader: false,

                  keyNameState: keyName,
                  xialaNameState: xialaName,
                  enumOptionsArrayState:enumOptionsArrayForQuery
                });


              }
            }
            )
            .catch(err => {
              query
                .getQueryResultByText(-1, query.query)
                .toPromise()
                .then(queryRes => {
                  fatherParameter = queryRes.query_result.data.rows;// 后执行
                  // console.log(fatherParameter);
                  if (fatherParameter !== [] && fatherParameter !== undefined && fatherParameter !== null) {
                    this.whereUpdata();
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
  }
 

  whereUpdata = () => {
    if (this.props.parameter.conditionvalue !== null && this.props.parameter.conditionvalue !== undefined) {
      // console.log("1");
      condition=this.props.parameter.conditionvalue;
      const res = _.filter(fatherParameter, this.props.parameter.conditionvalue);
      keyName = this.props.parameter.keyname;
      xialaName = this.props.parameter.xialaname;
      keyList = _.map(res, keyName);
      xialaList = _.map(res, xialaName);
      
    } else {
      // console.log("2");
      condition=this.props.parameter.global[0][0];
      const res = _.filter(fatherParameter, this.props.parameter.global[0][0]);
      keyName = this.props.parameter.global[1][0];
      xialaName = this.props.parameter.global[2][0];
      keyList = _.map(res, keyName);
      xialaList = _.map(res, xialaName);
    }
    
    enumOptionsArrayForQuery = [];
    for (let i = 0; i < keyList.length; i += 1) {
      enumOptionsArrayForQuery.push(
        {
          name: xialaList[i],
          key: keyList[i]
        }
      )
    }
    if(enumOptionsArrayForQuery.length===0){
      enumOptionsArrayForQuery.push(
        {
          name: "无",
          key: "null"
        }
      )
    }
    this.setState({
      fatherParameterState: fatherParameter,
      resultState: keyList,
      switchResState: xialaList,
      conditionState:condition,

      loader: false,
      keyNameState: keyName,
      xialaNameState: xialaName,
      enumOptionsArrayState:enumOptionsArrayForQuery
    });
  }

  upDataEnum = () => {
    if (this.props.type === 'query') {
      id = this.props.parameter.queryId;
      Query.query({ id })
        .$promise.then(query => {
          query
            .getQueryResultByText(-1, query.query)
            .toPromise()
            .then(queryRes => {
              fatherParameter = queryRes.query_result.data.rows;// 后执行
              if (fatherParameter !== [] && fatherParameter !== undefined && fatherParameter !== null) {
                this.whereUpdata();
                enumOptionsArrayForQuery = [];
                for (let i = 0; i < keyList.length; i += 1) {
                  enumOptionsArrayForQuery.push(
                    {
                      name: xialaList[i],
                      key: keyList[i]
                    }
                  )
                }
                if(enumOptionsArrayForQuery.length===0){
                  enumOptionsArrayForQuery.push(
                    {
                      name: "无",
                      key: "null"
                    }
                  )
                }
                this.setState({
                  fatherParameterState: fatherParameter,
                  resultState: keyList,
                  switchResState: xialaList,
                  conditionState:condition,

                  loader: false,
                  keyNameState: keyName,
                  xialaNameState: xialaName,
                  enumOptionsArrayState:enumOptionsArrayForQuery
                });
              }
            })
            .catch(err => {
              console.log(err);
            });
        })
        .catch(err => {
          console.log(err);
        })
    }
  }



  renderDateTimeWithSecondsInput() {
    const { value, onSelect } = this.props;
    return (
      <DateTimeInput
        className={this.props.className}
        value={value}
        onSelect={onSelect}
        withSeconds
      />
    );
  }

  renderDateTimeInput() {
    const { value, onSelect } = this.props;
    return (
      <DateTimeInput
        className={this.props.className}
        value={value}
        onSelect={onSelect}
      />
    );
  }

  renderDateInput() {
    const { value, onSelect } = this.props;
    return (
      <DateInput
        className={this.props.className}
        value={value}
        onSelect={onSelect}
      />
    );
  }

  renderDateTimeRangeWithSecondsInput() {
    const { value, onSelect } = this.props;
    return (
      <DateTimeRangeInput
        className={this.props.className}
        value={value}
        onSelect={onSelect}
        withSeconds
      />
    );
  }

  renderDateTimeRangeInput() {
    const { value, onSelect } = this.props;
    return (
      <DateTimeRangeInput
        className={this.props.className}
        value={value}
        onSelect={onSelect}
      />
    );
  }

  renderDateRangeInput() {
    const { value, onSelect } = this.props;
    return (
      <DateRangeInput
        className={this.props.className}
        value={value}
        onSelect={onSelect}
      />
    );
  }

  renderEnumInput() {
    const { value, onSelect, enumOptions } = this.props;
    const enumOptionsArray = enumOptions.split('\n').filter(v => v !== '');
    return (
      <Select
        className={this.props.className}
        disabled={enumOptionsArray.length === 0}
        defaultValue={value}
        onChange={onSelect}
        dropdownMatchSelectWidth={false}
        dropdownClassName="ant-dropdown-in-bootstrap-modal"
      >
        {enumOptionsArray.map(option => (<Option key={option} value={option}>{option}</Option>))}
      </Select>
    );
  }

  renderQueryQueryInput() {
    const { value, onSelect, queryId, parameter } = this.props;
    enumOptionsArrayForQuery = [];
    for (let i = 0; i < this.state.resultState.length; i += 1) {
      enumOptionsArrayForQuery.push(
        {
          name: this.state.switchResState[i],
          key: this.state.resultState[i]
        }
      )
    }
    
    // console.log(enumOptionsArrayForQuery);
    // console.log(this.state.enumOptionsArrayState);
    return (
        this.props.parameter.global !== undefined&& 
        !this.state.loader&&!(enumOptionsArrayForQuery === [] ||
           enumOptionsArrayForQuery === undefined || 
           enumOptionsArrayForQuery.length === 0) ?(// 加载完获得数据才加载显示下拉框的模块
             <Select
               className={this.props.className}
            // disabled={enumOptionsArray.length === 0}
            // defaultValue={this.state.enumOptionsArrayState[0].name}// enumOptionsArray[0].name==='无'?"无":value
               defaultValue={this.state.enumOptionsArrayState[0].name}
               key={this.state.enumOptionsArrayState[0].key}
               onChange={onSelect}
               dropdownMatchSelectWidth={false}
               dropdownClassName="ant-dropdown-in-bootstrap-modal"
               onDropdownVisibleChange={this.upDataEnum}
             >
               {enumOptionsArrayForQuery.map(option => (
                 <Option key={option.name} value={option.key}>{option.name}</Option>))}
             </Select>
          )
          :
          (
            <Select
              className={this.props.className}
              // disabled={enumOptionsArray.length === 0}
              defaultValue={this.state.enumOptionsArrayState[0].name}
              key={this.state.enumOptionsArrayState[0].key}
              onChange={onSelect}
              dropdownMatchSelectWidth={false}
              dropdownClassName="ant-dropdown-in-bootstrap-modal"
              onDropdownVisibleChange={this.upDataEnum}
            >
              <Option key="null" value="null">无数据</Option>
            </Select>
          )
        // )
    );
  }


  renderQueryBasedInput() {
    const { value, onSelect, queryId, parameter } = this.props;
    return (
      <QueryBasedParameterInput
        className={this.props.className}
        parameter={parameter}
        value={value}
        queryId={queryId}
        onSelect={onSelect}
      />
    );
  }

  renderNumberInput() {
    const { value, onSelect, className } = this.props;
    return (
      <InputNumber
        className={'form-control ' + className}
        defaultValue={!isNaN(value) && value || 0}
        onChange={onSelect}
      />
    );
  }

  renderTextInput() {
    const { value, onSelect, className } = this.props;
    return (
      <Input
        className={'form-control ' + className}
        defaultValue={value || ''}
        data-test="TextParamInput"
        onChange={event => onSelect(event.target.value)}
      />
    );
  }

  render() {
    const { type } = this.props;
    switch (type) {
      case 'datetime-with-seconds': return this.renderDateTimeWithSecondsInput();
      case 'datetime-local': return this.renderDateTimeInput();
      case 'date': return this.renderDateInput();
      case 'datetime-range-with-seconds': return this.renderDateTimeRangeWithSecondsInput();
      case 'datetime-range': return this.renderDateTimeRangeInput();
      case 'date-range': return this.renderDateRangeInput();
      case 'enum': return this.renderEnumInput();
      // case 'query': return this.renderQueryBasedInput();
      case 'query': return this.renderQueryQueryInput();
      case 'number': return this.renderNumberInput();
      default: return this.renderTextInput();
    }
  }
}

export default function init(ngModule) {
  ngModule.component('parameterValueInput', {
    template: `
      <parameter-value-input-impl
        type="$ctrl.param.type"
        value="$ctrl.param.normalizedValue"
        parameter="$ctrl.param"
        enum-options="$ctrl.param.enumOptions"
        query-id="$ctrl.param.queryId"
        on-select="$ctrl.setValue"
      ></parameter-value-input-impl>
    `,
    bindings: {
      param: '<',
    },
    controller($scope) {
      this.setValue = (value) => {
        this.param.setValue(value);
        $scope.$applyAsync();
      };
    },
  });
  ngModule.component('parameterValueInputImpl', react2angular(ParameterValueInput));
}

init.init = true;
