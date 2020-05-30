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
let fatherParameter=[];
let id=0;

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
    onSelect: () => {},
    className: '',
  };

  constructor(props) {
    super(props);
    this.state = {
      fatherParameterState: [], 
      loader:true
    };
  }

  componentDidMount() {
    // console.log(this.props.type);
    if (this.props.type === 'query') {
      id = this.props.parameter.queryId;
      
      Query.query({ id })
        .$promise.then(query => {
          query
          .getQueryResultByText(-1, query.query)
          .toPromise()
          .then(queryRes => {
            fatherParameter = queryRes.query_result.data.rows;// 后执行
            // console.log(fatherParameter);
              if (fatherParameter !== []&& fatherParameter !== undefined && fatherParameter !== null) {
                this.setState({
                  fatherParameterState: fatherParameter,
                  loader: false
                });
              }
          })
          .catch(err => {
            console.log(err);
          });


          // query
          //   .getQueryResultPromise()
          //   .then(queryRes => {
          //     fatherParameter = queryRes.query_result.data.rows;// 后执行
          //     if (fatherParameter !== []&& fatherParameter !== undefined && fatherParameter !== null) {
          //       this.setState({
          //         fatherParameterState: fatherParameter,
          //         loader: false
          //       });
          //     }
          //   }
          //   )
          //   .catch(err => {
          //     console.log(err);
          //   });

        })
        .catch(err => {
          console.log(err);
        })
    }
  }
 

  upDataEnum=()=>{
    if (this.props.type === 'query') {  
      id= this.props.parameter.queryId;  
      Query.query({ id })
        .$promise.then(query => {
          query
          .getQueryResultByText(-1, query.query)
          .toPromise()
          .then(queryRes => {
            fatherParameter = queryRes.query_result.data.rows;// 后执行
            // console.log(fatherParameter);
              if (fatherParameter !== []&& fatherParameter !== undefined && fatherParameter !== null) {
                this.setState({
                  fatherParameterState: fatherParameter,
                  loader: false
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
        {enumOptionsArray.map(option => (<Option key={option} value={option}>{ option }</Option>))}
      </Select>
    );
  }

  renderQueryQueryInput() {
    const { value, onSelect, queryId, parameter  } = this.props;
    const enumOptionsArray=[];
    // eslint-disable-next-line func-names
    _.forEach(this.state.fatherParameterState, function(v, key) {
      enumOptionsArray.push(v.KEYID);
    });
    return (
      this.state.loader ? (
        <Select
          className={this.props.className}
          disabled={enumOptionsArray.length === 0}
          defaultValue={value}
          onChange={onSelect}
          dropdownMatchSelectWidth={false}
          dropdownClassName="ant-dropdown-in-bootstrap-modal"
          onDropdownVisibleChange={this.upDataEnum}
        ><Option key="null" value="null">null</Option>
        </Select>
    ) : (
      <Select
        className={this.props.className}
        disabled={enumOptionsArray.length === 0}
        defaultValue={enumOptionsArray[0]}
        onChange={onSelect}
        dropdownMatchSelectWidth={false}
        dropdownClassName="ant-dropdown-in-bootstrap-modal"
        onDropdownVisibleChange={this.upDataEnum}
      >
        {enumOptionsArray.map(option => (<Option key={option} value={option}>{option}</Option>))}
      </Select>
)
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
