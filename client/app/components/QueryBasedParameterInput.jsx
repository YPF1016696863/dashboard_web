import { find, isFunction } from 'lodash';
import React from 'react';
import PropTypes from 'prop-types';
import { react2angular } from 'react2angular';
import Select from 'antd/lib/select';

const { Option } = Select;

export class QueryBasedParameterInput extends React.Component {
  static propTypes = {
    parameter: PropTypes.any, // eslint-disable-line react/forbid-prop-types
    value: PropTypes.any, // eslint-disable-line react/forbid-prop-types
    queryId: PropTypes.number,
    onSelect: PropTypes.func,
    className: PropTypes.string,
    fatherParameter:PropTypes.any,
  };

  static defaultProps = {
    value: null,
    parameter: null,
    queryId: null,
    onSelect: () => {},
    className: '',
    fatherParameter:[]
  };

  constructor(props) {
    super(props);
    this.state = {
      options: [],
      loading: false,
    };
  }

  componentDidMount() {
    this._loadOptions(this.props.queryId);
  }

  // eslint-disable-next-line no-unused-vars
  componentWillReceiveProps(nextProps) {
    if (nextProps.queryId !== this.props.queryId) {
      this._loadOptions(nextProps.queryId, nextProps.value);
    }
  }

  async _loadOptions(queryId) {
    console.log(this.props.fatherParameter);

    if (queryId && (queryId !== this.state.queryId)) {
      this.setState({ loading: true });
      const options = await this.props.parameter.loadDropdownValues()
      .catch(err => {
        console.log(err);
      }); ;
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
    
    console.log(this.props.fatherParameter);
    return (
      <span>
        <Select
          className={className}
          disabled={loading}
          // || (options.length === 0)
          loading={loading}
          defaultValue={'' + value}
          onChange={onSelect}
          dropdownMatchSelectWidth={false}
          dropdownClassName="ant-dropdown-in-bootstrap-modal"
        >
          {/* {options.map(option => (<Option value={option.value} key={option.value}>{option.name}</Option>))} */}
          {this.props.fatherParameter.map(
            (item) => (<Option value={item.KEYID} key={item.KEYID}>{item.KEYID}</Option>
            )
          )}
        
        </Select>
      </span>
    );
  }
}

export default function init(ngModule) {
  ngModule.component('queryBasedParameterInput', react2angular(QueryBasedParameterInput));
}

init.init = true;
