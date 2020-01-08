
import { includes, startsWith, words, capitalize, clone, isNull } from 'lodash';
import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import Modal from 'antd/lib/modal';
import Form from 'antd/lib/form';
import Checkbox from 'antd/lib/checkbox';
import Button from 'antd/lib/button';
import Select from 'antd/lib/select';
import Input from 'antd/lib/input';
import Divider from 'antd/lib/divider';
import { wrap as wrapDialog, DialogPropType } from '@/components/DialogWrapper';
import { QuerySelector } from '@/components/QuerySelector';
import { Query } from '@/services/query';

const { Option } = Select;
const formItemProps = { labelCol: { span: 6 }, wrapperCol: { span: 16 } };

function getDefaultTitle(text) {
  return capitalize(words(text).join(' ')); // humanize
}

function isTypeDate(type) {
  return startsWith(type, 'date') && !isTypeDateRange(type);
}

function isTypeDateRange(type) {
  return /-range/.test(type);
}

function NameInput({ name, type, onChange, existingNames, setValidation }) {
  let helpText = '';
  let validateStatus = '';

  if (!name) {
    helpText = '选择此参数的关键字';
    setValidation(false);
  } else if (includes(existingNames, name)) {
    helpText = '具有该名称的参数已存在';
    setValidation(false);
    validateStatus = 'error';
  } else {
    if (isTypeDateRange(type)) {
      helpText = (
        <React.Fragment>
          Appears in query as {' '}
          <code style={{ display: 'inline-block', color: 'inherit' }}>
            {`{{${name}.start}} {{${name}.end}}`}
          </code>
        </React.Fragment>
      );
    }
    setValidation(true);
  }

  return (
    <Form.Item
      required
      label="关键词"
      help={helpText}
      validateStatus={validateStatus}
      {...formItemProps}
    >
      <Input onChange={e => onChange(e.target.value)} autoFocus />
    </Form.Item>
  );
}

NameInput.propTypes = {
  name: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  existingNames: PropTypes.arrayOf(PropTypes.string).isRequired,
  setValidation: PropTypes.func.isRequired,
  type: PropTypes.string.isRequired,
};

function EditParameterSettingsDialog(props) {
  const [param, setParam] = useState(clone(props.parameter));
  const [isNameValid, setIsNameValid] = useState(true);
  const [initialQuery, setInitialQuery] = useState();

  const isNew = !props.parameter.name;

  // fetch query by id
  useEffect(() => {
    const { queryId } = props.parameter;
    if (queryId) {
      Query.get({ id: queryId }, (query) => {
        setInitialQuery(query);
      });
    }
  }, []);

  function isFulfilled() {
    // name
    if (!isNameValid) {
      return false;
    }

    // title
    if (param.title === '') {
      return false;
    }

    // query
    if (param.type === 'query' && !param.queryId) {
      return false;
    }

    return true;
  }

  function onConfirm(e) {
    // update title to default
    if (!param.title) {
      // forced to do this cause param won't update in time for save
      param.title = getDefaultTitle(param.name);
      setParam(param);
    }

    props.dialog.close(param);

    e.preventDefault(); // stops form redirect
  }

  return (
    <Modal
      {...props.dialog.props}
      title={isNew ? '添加参数' : param.name}
      width={600}
      footer={[(
        <Button key="cancel" onClick={props.dialog.dismiss}>取消</Button>
      ), (
        <Button key="submit" htmlType="submit" disabled={!isFulfilled()} type="primary" form="paramForm" data-test="SaveParameterSettings">
          {isNew ? '添加参数' : '确定'}
        </Button>
      )]}
    >
      <Form layout="horizontal" onSubmit={onConfirm} id="paramForm">
        {isNew && (
          <NameInput
            name={param.name}
            onChange={name => setParam({ ...param, name })}
            setValidation={setIsNameValid}
            existingNames={props.existingParams}
            type={param.type}
          />
        )}
        <Form.Item label="标题" {...formItemProps}>
          <Input
            value={isNull(param.title) ? getDefaultTitle(param.name) : param.title}
            onChange={e => setParam({ ...param, title: e.target.value })}
          />
        </Form.Item>
        <Form.Item label="类型" {...formItemProps}>
          <Select value={param.type} onChange={type => setParam({ ...param, type })} data-test="ParameterTypeSelect">
            <Option value="text" data-test="TextParameterTypeOption">文本</Option>
            <Option value="number" data-test="NumberParameterTypeOption">数字</Option>
            <Option value="enum">下拉框</Option>
            <Option value="query">基于其他数据集的下拉框</Option>
            <Option disabled key="dv1">
              <Divider className="select-option-divider" />
            </Option>
            <Option value="date">日期</Option>
            <Option value="datetime-local">日期与时间</Option>
            <Option value="datetime-with-seconds">日期与时间 (+秒)</Option>
            <Option disabled key="dv2">
              <Divider className="select-option-divider" />
            </Option>
            <Option value="date-range">日期范围</Option>
            <Option value="datetime-range">日期时间范围</Option>
            <Option value="datetime-range-with-seconds">日期时间范围 (+秒)</Option>
          </Select>
        </Form.Item>
        {isTypeDate(param.type) && (
          <Form.Item label=" " colon={false} {...formItemProps}>
            <Checkbox
              defaultChecked={param.useCurrentDateTime}
              onChange={e => setParam({ ...param, useCurrentDateTime: e.target.checked })}
            >
              Default to Today/Now if no other value is set
            </Checkbox>
          </Form.Item>
        )}
        {param.type === 'enum' && (
          <Form.Item label="Values" help="下拉框 (换行符分隔)" {...formItemProps}>
            <Input.TextArea
              rows={3}
              value={param.enumOptions}
              onChange={e => setParam({ ...param, enumOptions: e.target.value })}
            />
          </Form.Item>
        )}
        {param.type === 'query' && (
          <Form.Item label="Query" help="选择查询以从加载下拉框" {...formItemProps}>
            <QuerySelector
              selectedQuery={initialQuery}
              onChange={q => setParam({ ...param, queryId: q && q.id })}
              type="select"
            />
          </Form.Item>
        )}
      </Form>
    </Modal>
  );
}

EditParameterSettingsDialog.propTypes = {
  parameter: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
  dialog: DialogPropType.isRequired,
  existingParams: PropTypes.arrayOf(PropTypes.string),
};

EditParameterSettingsDialog.defaultProps = {
  existingParams: [],
};

export default wrapDialog(EditParameterSettingsDialog);
