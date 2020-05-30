import { find, isFunction } from 'lodash';
import React from 'react';
import PropTypes from 'prop-types';
import { react2angular } from 'react2angular';
import Select from 'antd/lib/select';

const { Option } = Select;

export class QueryQueryParameterInput extends React.Component {
  static propTypes = {
    parameter: PropTypes.any, // eslint-disable-line react/forbid-prop-types
    value: PropTypes.any, // eslint-disable-line react/forbid-prop-types
    queryId: PropTypes.number,
    onSelect: PropTypes.func,
    className: PropTypes.string,
    // eslint-disable-next-line react/forbid-prop-types
    enum: PropTypes.any, 
  };

  static defaultProps = {
    value: null,
    parameter: null,
    queryId: null,
    onSelect: () => {},
    className: '',
    enum: null,
  };

  constructor(props) {
    super(props);
    this.state = {
      options: [],
      loading: false,
      optionEnum:[]
    };
  }

  componentDidMount() {
    console.log(this.props.enum);
    this.setState({ optionEnum: this.props.enum });
    // this._loadOptions(this.props.queryId);
  }

  // eslint-disable-next-line no-unused-vars
  componentWillReceiveProps(nextProps) {
    if (nextProps.queryId !== this.props.queryId) {
      console.log(this.state.optionEnum);
      // this._loadOptions(nextProps.queryId, nextProps.value);
    }
  }

  async _loadOptions(queryId) {
    if (queryId && (queryId !== this.state.queryId)) {
      this.setState({ loading: true });
      const options = await this.props.parameter.loadDropdownValues();

      // stale queryId check
      if (this.props.queryId === queryId) {
        this.setState({ options, loading: false });

        const found = find(options, option => option.value === this.props.value) !== undefined;
        if (!found && isFunction(this.props.onSelect)) {
          this.props.onSelect(options[0].value);
        }
      }
    }
  }

  render() {
    const { className, value, onSelect } = this.props;
    const { loading, options } = this.state;
    console.log(this.state.optionEnum);
    return (
      <span>
        <Select
          className={className}
          disabled={loading || (this.state.optionEnum.length === 0)}
          loading={loading}
          defaultValue={'' + value}
          onChange={onSelect}
          dropdownMatchSelectWidth={false}
          dropdownClassName="ant-dropdown-in-bootstrap-modal"
        >
          {this.state.optionEnum.map(option => (<Option value={option} key={option}>{option}</Option>))}
        </Select>
      </span>
    );
  }
}

export default function init(ngModule) {
  ngModule.component('queryQueryParameterInput', react2angular(QueryQueryParameterInput));
}

init.init = true;
