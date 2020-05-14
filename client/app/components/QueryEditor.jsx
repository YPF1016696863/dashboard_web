import React from 'react';
import PropTypes from 'prop-types';
import Tooltip from 'antd/lib/tooltip';
import { react2angular } from 'react2angular';

import AceEditor from 'react-ace';
import ace from 'brace';
import * as _ from 'lodash';
import { Form, Input, Button, Select, TreeSelect, InputNumber, Checkbox } from 'antd';
import { PlusCircleOutlined, DeleteOutlined } from '@ant-design/icons';
import notification from '@/services/notification';

import 'brace/ext/language_tools';
import 'brace/mode/json';
import 'brace/mode/python';
import 'brace/mode/sql';
import 'brace/mode/yaml';
import 'brace/theme/textmate';
import 'brace/ext/searchbox';

import { Query } from '@/services/query';
import { QuerySnippet } from '@/services/query-snippet';
import { KeyboardShortcuts } from '@/services/keyboard-shortcuts';

import localOptions from '@/lib/localOptions';
import AutocompleteToggle from '@/components/AutocompleteToggle';
import keywordBuilder from './keywordBuilder';
import { DataSource, Schema } from './proptypes';

import './QueryEditor.css';

const langTools = ace.acequire('ace/ext/language_tools');
const snippetsModule = ace.acequire('ace/snippets');
const { Option } = Select;
const { TreeNode } = TreeSelect;

let selectTableName = '';
let selectKeysArray = [];
let selectLimit = 0;
let boolLimit = false;
const whereIndex = [];
const conditionKV=[];
const andorKV=[];
const conditionZiduanKV=[];
const fuhaoKV=[];
let count = 0;
// By default Ace will try to load snippet files for the different modes and fail.
// We don't need them, so we use these placeholders until we define our own.
function defineDummySnippets(mode) {
  ace.define(`ace/snippets/${mode}`, ['require', 'exports', 'module'], (require, exports) => {
    exports.snippetText = '';
    exports.scope = mode;
  });
}

defineDummySnippets('python');
defineDummySnippets('sql');
defineDummySnippets('json');
defineDummySnippets('yaml');

class QueryEditor extends React.Component {
  static propTypes = {
    queryText: PropTypes.string.isRequired,
    schema: Schema, // eslint-disable-line react/no-unused-prop-types
    addNewParameter: PropTypes.func.isRequired,
    dataSources: PropTypes.arrayOf(DataSource),
    dataSource: DataSource,
    fileUpload: PropTypes.bool.isRequired,
    canEdit: PropTypes.bool.isRequired,
    isDirty: PropTypes.bool.isRequired,
    isQueryOwner: PropTypes.bool.isRequired,
    updateDataSource: PropTypes.func.isRequired,
    canExecuteQuery: PropTypes.func.isRequired,
    executeQuery: PropTypes.func.isRequired,
    queryExecuting: PropTypes.bool.isRequired,
    saveQuery: PropTypes.func.isRequired,
    updateQuery: PropTypes.func.isRequired,
    updateSelectedQuery: PropTypes.func.isRequired,
    listenForResize: PropTypes.func.isRequired,
    listenForEditorCommand: PropTypes.func.isRequired,
    isSimple: PropTypes.bool.isRequired,
  };

  static defaultProps = {
    schema: null,
    dataSource: {},
    dataSources: [],
  };

  constructor(props) {
    super(props);

    this.refEditor = React.createRef();

    this.state = {
      schema: null, // eslint-disable-line react/no-unused-state
      keywords: {
        table: [],
        column: [],
        tableColumn: [],
      },
      autocompleteQuery: localOptions.get('liveAutocomplete', true),
      liveAutocompleteDisabled: false,
      // XXX temporary while interfacing with angular
      queryText: props.queryText,
      selectedQueryText: null,

      kValue: [],                   // 字段选择
      tValue: '',                   // 表的选择
      limitValue: null,             // 限制查询条数
      limitDisabled: true,          // 禁止限制条数查询 即全查
      whereNum: [],                 // 条件的数量 item 对应项
      andorKVstate:[],              // 与或的对应匹配数组
      conditionZiduanKVstate:[],    // 字段的匹配数组
      fuhaoKVstate:[],              // 条件的符号数组
      conditionKVstate:[],           // 条件的内容
      
    };
 
    const schemaCompleter = {
      identifierRegexps: [/[a-zA-Z_0-9.\-\u00A2-\uFFFF]/],
      getCompletions: (state, session, pos, prefix, callback) => {
        const tableKeywords = this.state.keywords.table;
        const columnKeywords = this.state.keywords.column;
        const tableColumnKeywords = this.state.keywords.tableColumn;

        if (prefix.length === 0 || tableKeywords.length === 0) {
          callback(null, []);
          return;
        }

        if (prefix[prefix.length - 1] === '.') {
          const tableName = prefix.substring(0, prefix.length - 1);
          callback(null, tableKeywords.concat(tableColumnKeywords[tableName]));
          return;
        }
        callback(null, tableKeywords.concat(columnKeywords));
      },
    };

    langTools.setCompleters([
      langTools.snippetCompleter,
      langTools.keyWordCompleter,
      langTools.textCompleter,
      schemaCompleter,
    ]);
  }


  static getDerivedStateFromProps(nextProps, prevState) {
    if (!nextProps.schema) {
      return {
        keywords: {
          table: [],
          column: [],
          tableColumn: [],
        },
        liveAutocompleteDisabled: false,
      };
    } else if (nextProps.schema !== prevState.schema) {
      const tokensCount = nextProps.schema.reduce((totalLength, table) => totalLength + table.columns.length, 0);
      return {
        schema: nextProps.schema,
        keywords: keywordBuilder.buildKeywordsFromSchema(nextProps.schema),
        liveAutocompleteDisabled: tokensCount > 5000,
      };
    }
    return null;
  }

  onLoad = (editor) => {
    // Release Cmd/Ctrl+L to the browser
    editor.commands.bindKey('Cmd+L', null);
    editor.commands.bindKey('Ctrl+P', null);
    editor.commands.bindKey('Ctrl+L', null);

    // Ignore Ctrl+P to open new parameter dialog
    editor.commands.bindKey({ win: 'Ctrl+P', mac: null }, null);
    // Lineup only mac
    editor.commands.bindKey({ win: null, mac: 'Ctrl+P' }, 'golineup');

    // Reset Completer in case dot is pressed
    editor.commands.on('afterExec', (e) => {
      if (e.command.name === 'insertstring' && e.args === '.'
        && editor.completer) {
        editor.completer.showPopup(editor);
      }
    });

    QuerySnippet.query((snippets) => {
      const snippetManager = snippetsModule.snippetManager;
      const m = {
        snippetText: '',
      };
      m.snippets = snippetManager.parseSnippetFile(m.snippetText);
      snippets.forEach((snippet) => {
        m.snippets.push(snippet.getSnippet());
      });
      snippetManager.register(m.snippets || [], m.scope);
    });

    editor.focus();
    this.props.listenForResize(() => editor.resize());
    this.props.listenForEditorCommand((e, command, ...args) => {
      switch (command) {
        case 'focus': {
          editor.focus();
          break;
        }
        case 'paste': {
          const [text] = args;
          editor.session.doc.replace(editor.selection.getRange(), text);
          const range = editor.selection.getRange();
          this.props.updateQuery(editor.session.getValue());
          editor.selection.setRange(range);
          break;
        }
        default:
          break;
      }
    });
  };

  updateSelectedQuery = (selection) => {
    // console.log(this.props.schema);
    const { editor } = this.refEditor.current;
    const doc = editor.getSession().doc;
    const rawSelectedQueryText = doc.getTextRange(selection.getRange());
    const selectedQueryText = (rawSelectedQueryText.length > 1) ? rawSelectedQueryText : null;
    this.setState({ selectedQueryText });
    this.props.updateSelectedQuery(selectedQueryText);
  };

  updateQuery = (queryText) => {
    this.props.updateQuery(queryText);
    this.setState({ queryText });
  };

  formatQuery = () => {
    Query.format(this.props.dataSource.syntax || 'sql', this.props.queryText)
      .then(this.updateQuery)
      .catch(error => notification.error(error));
  };

  toggleAutocomplete = (state) => {
    this.setState({ autocompleteQuery: state });
    localOptions.set('liveAutocomplete', state);
  };

  componentDidUpdate = () => {  
    // ANGULAR_REMOVE_ME  Work-around for a resizing issue, see https://github.com/getredash/redash/issues/3353
    const { editor } = this.refEditor.current;
    editor.resize();
  };


  tableChange = (e) => {
    selectTableName = e;
    this.marge(selectTableName, selectKeysArray, selectLimit,conditionZiduanKV,conditionKV,fuhaoKV,andorKV);
    this.setState({
      kValue: [],
      tValue: e
    });// 清空
  }

  // 表名 字段名 限制条数 条件字段 条件（1000，bab之类的内容） 条件符号 条件连接（与或）
  marge = (tableValue, keysValue, limitValue, conditionkey, conditionValue, fuhao, condition) => {
    let keysTemp = "";
    // eslint-disable-next-line func-names
    _(keysValue).forEach(function (value) {
      keysTemp = keysTemp + value + " , ";
    });
    keysTemp = keysTemp.slice(0, -2);// 去掉最后一个逗号
    let queryText = "select " + keysTemp + " from " + tableValue; 

    let conditionString = '';
    for (let i = 0; i < conditionkey.length; i += 1) {
      let temp = '';
      if (conditionkey[i] !== null && conditionkey[i] !== undefined&&conditionkey[i] !== " ") {
        temp =
          (condition[i] === undefined ? " " : condition[i])
            + " " + conditionkey[i] + " " + fuhao[i] + " '" + conditionValue[i]+"'";
            conditionString = conditionString + " " + temp;
      }
    }
    
    conditionString=conditionString.replace(/\s+/ig,"  ");// 多余空格替换为两个
    
    if(conditionString!==null&&conditionString.replace(/\s+/ig,"")!==''){
      queryText=queryText+" where "+conditionString;
    }
    if (boolLimit) {// 禁用关闭时写入sql 
      queryText = queryText + " limit " + limitValue;
    }
    // console.log(queryText);
    this.updateQuery(queryText);
  }

  // 字段选择
  onTreeChange = value => {
    this.setState({ kValue: value });
    selectKeysArray = value;
    this.marge(selectTableName, selectKeysArray, selectLimit,conditionZiduanKV,conditionKV,fuhaoKV,andorKV);
  };

  limitChange = (value) => {
    // console.log(value);
    selectLimit = value;
    this.setState({ limitValue: selectLimit });
    this.marge(selectTableName, selectKeysArray, selectLimit,conditionZiduanKV,conditionKV,fuhaoKV,andorKV);
  }

  // 条目限制开关
  toggle = () => {
    this.setState({
      limitDisabled: !this.state.limitDisabled,
    });
    boolLimit = this.state.limitDisabled;
    this.marge(selectTableName, selectKeysArray, selectLimit,conditionZiduanKV,conditionKV,fuhaoKV,andorKV);
  };


  addCondition = () => {
    count += 1;
    whereIndex.push(count);
    this.setState({ whereNum: whereIndex }); 
    this.marge(selectTableName, selectKeysArray, selectLimit,conditionZiduanKV,conditionKV,fuhaoKV,andorKV);
  };

  deleteCondition = (e) => {
    _.pull(whereIndex, parseInt(e.currentTarget.id, 10));
    // 删除一个条件的时候 需要对数组进行删除操作
    conditionKV[parseInt(e.currentTarget.id, 10)] = " ";
    andorKV[parseInt(e.currentTarget.id, 10)] = " ";
    conditionZiduanKV[parseInt(e.currentTarget.id, 10)] = " ";
    fuhaoKV[parseInt(e.currentTarget.id, 10)] = " ";
    andorKV[1] = " ";

    this.setState({
      whereNum: whereIndex,
      andorKVstate: andorKV,// 与或的对应匹配
      conditionZiduanKVstate: conditionZiduanKV,// 字段的匹配
      conditionKVstate: conditionKV,
      fuhaoKVstate: fuhaoKV,
    });
    
    this.marge(selectTableName, selectKeysArray, selectLimit, conditionZiduanKV, conditionKV, fuhaoKV, andorKV);
  };
 
  // 条件字段
  conditionZiduanChange=(value,e)=>{ 
    conditionZiduanKV[e.props.id] = value;// 条件id 前的连接字段
    this.setState({ conditionZiduanKVstate: conditionZiduanKV }); 
    this.marge(selectTableName, selectKeysArray, selectLimit,conditionZiduanKV,conditionKV,fuhaoKV,andorKV);
  }

  // 条件符号
  fuhaoChange = (value,e) => {  
    fuhaoKV[e.props.id] = value;// 符号 
    this.setState({ fuhaoKVstate: fuhaoKV }); 
    this.marge(selectTableName, selectKeysArray, selectLimit,conditionZiduanKV,conditionKV,fuhaoKV,andorKV);
  };

  // 条件内容
  whereInput = (e) => { 
    conditionKV[e.currentTarget.id] = e.target.value;
    this.setState({ conditionKVstate: conditionKV }); 
    this.marge(selectTableName, selectKeysArray, selectLimit,conditionZiduanKV,conditionKV,fuhaoKV,andorKV);
  };

  // 条件连接
  andORChange = (value,e) => {  
    andorKV[e.props.id] = value;// 条件id 前的连接字段
    this.setState({ andorKVstate: andorKV }); 
    this.marge(selectTableName, selectKeysArray, selectLimit,conditionZiduanKV,conditionKV,fuhaoKV,andorKV);
  };


  render() {
    const modKey = KeyboardShortcuts.modKey;
    const isExecuteDisabled = this.props.queryExecuting || !this.props.canExecuteQuery();

    const queryText = this.props.fileUpload ? this.props.queryText : this.state.queryText;

    return (
      // 简单 高级切换
      this.props.isSimple ? (
        <section style={{ height: '100%' }} data-test="QueryEditor">
          <div className="container p-15 m-b-10" style={{ height: '100%' }}>
            <div data-executing={this.props.queryExecuting} style={{ height: 'calc(100% - 40px)', marginBottom: '0px' }} className="editor__container">
              <AceEditor
                readOnly={this.props.fileUpload}
                ref={this.refEditor}
                theme="textmate"
                mode={this.props.dataSource.syntax || 'sql'}
                value={queryText}
                editorProps={{ $blockScrolling: Infinity }}
                width="100%"
                height="100%"
                setOptions={{
                  behavioursEnabled: true,
                  enableSnippets: true,
                  enableBasicAutocompletion: true,
                  enableLiveAutocompletion: !this.state.liveAutocompleteDisabled && this.state.autocompleteQuery,
                  autoScrollEditorIntoView: true,
                }}
                showPrintMargin={false}
                wrapEnabled={false}
                onLoad={this.onLoad}
                onPaste={this.onPaste}
                onChange={this.updateQuery}
                onSelectionChange={this.updateSelectedQuery}
              />
            </div>

            <div className="editor__control">
              <div className="form-inline d-flex">
                <Tooltip
                  placement="top"
                  title={<span>添加新参数 (<i>{modKey} + P</i>)</span>}
                >
                  <button type="button" className="btn btn-default m-r-5" onClick={this.props.addNewParameter}>
                    &#123;&#123;&nbsp;&#125;&#125;
                  </button>
                </Tooltip>
                <Tooltip placement="top" title="格式化">
                  <button type="button" className="btn btn-default m-r-5" onClick={this.formatQuery}>
                    <span className="zmdi zmdi-format-indent-increase" />
                  </button>
                </Tooltip>
                <AutocompleteToggle
                  state={this.state.autocompleteQuery}
                  onToggle={this.toggleAutocomplete}
                  disabled={this.state.liveAutocompleteDisabled}
                />
                <select
                  className="form-control datasource-small flex-fill w-100"
                  onChange={this.props.updateDataSource}
                  disabled={!this.props.isQueryOwner}
                >
                  {this.props.dataSources.map(ds => (
                    <option label={ds.name} value={ds.id} key={`ds-option-${ds.id}`}>
                      {ds.name}
                    </option>
                  ))}
                </select>
                {this.props.canEdit ? (
                  <Tooltip placement="top" title={modKey + ' + S'}>
                    <button
                      type="button"
                      className="btn btn-default m-l-5"
                      onClick={this.props.saveQuery}
                      data-test="SaveButton"
                      title="Save"
                    >
                      <span className="fa fa-floppy-o" />
                      <span className="hidden-xs m-l-5">保存</span>
                      {this.props.isDirty ? '*' : null}
                    </button>
                  </Tooltip>
                ) : null}
                <Tooltip placement="top" title={modKey + ' + Enter'}>
                  {/*
                  Tooltip wraps disabled buttons with `<span>` and moves all styles
                  and classes to that `<span>`. There is a piece of CSS that fixes
                  button appearance, but also wwe need to add `disabled` class to
                  disabled buttons so it will be assigned to wrapper and make it
                  looking properly
                */}
                  <button
                    type="button"
                    className={'btn btn-primary m-l-5' + (isExecuteDisabled ? ' disabled' : '')}
                    disabled={isExecuteDisabled}
                    onClick={this.props.executeQuery}
                    data-test="ExecuteButton"
                  >
                    <span className="zmdi zmdi-play" />
                    <span className="hidden-xs m-l-5">{(this.state.selectedQueryText == null) ? '执行' : '执行被选项'}</span>
                  </button>
                </Tooltip>
              </div>
            </div>
          </div>
        </section>
      ) : (
        <section style={{ height: '100%' }} data-test="QueryEditor">
          <div className="container p-15 m-b-10" style={{ height: '100%' }}>
            <div data-executing={this.props.queryExecuting} style={{ height: 'calc(100% - 40px)', marginBottom: '0px' }} className="editor__container">

              从
              <Select defaultValue="选择表名.." value={this.state.tValue===''?"表名称":this.state.tValue} style={{ width: 200 }} onChange={this.tableChange}>
                {_.map(this.props.schema, 'name').map((item) => {
                    return <Option value={item}>{item}</Option>
                  })}
              </Select>
              表中,
              选择字段
              <TreeSelect
                showSearch
                style={{ width: '55%' }}
                value={this.state.kValue}
                dropdownStyle={{ maxHeight: 400, overflow: 'auto' }}
                placeholder="选择字段..."
                allowClear
                multiple
                treeDefaultExpandAll
                onChange={this.onTreeChange}
              >
                <TreeNode value=" * " title="所有字段" />
                {
                    _.flattenDeep(
                      // eslint-disable-next-line func-names
                      _.map(_.filter(this.props.schema, function (o) { return o.name === selectTableName; }), 'columns')
                    )
                      .map((item) => {
                        return <TreeNode value={item} title={item} />
                      })
                  }
              </TreeSelect>
              <br />
              限制查询条数
              <InputNumber min={1} disabled={this.state.limitDisabled} defaultValue={this.state.limitValue} onChange={this.limitChange} />

              <Button onClick={this.toggle} type="primary">
                  条目限制开关
              </Button>


              <br />
              筛选条件
              <PlusCircleOutlined onClick={this.addCondition}>增加</PlusCircleOutlined>
              <br />
              {
                  this.props.schema ? (
                    this.state.whereNum.map((item) => {
                      return (
                        <span>
                          {item!==this.state.whereNum[0]?(
                            // eslint-disable-next-line react/jsx-no-duplicate-props
                            <Select defaultValue="条件连接.." value={this.state.andorKVstate[item]===undefined?"条件连接":this.state.andorKVstate[item]} style={{ width: '10%' }} id={item} onChange={this.andORChange}>
                              <Option id={item} value="and">和</Option>
                              <Option id={item} value="or">或</Option>
                            </Select>
                            ):null} 
                          <br />
                          <Select defaultValue="筛选字段.." value={this.state.conditionZiduanKVstate[item]===undefined?"筛选字段":this.state.conditionZiduanKVstate[item]} style={{ width: '30%' }} id={item} onChange={this.conditionZiduanChange}>
                            {
                              _.flattenDeep(
                                // eslint-disable-next-line func-names
                                _.map(_.filter(this.props.schema, function (o) { return o.name === selectTableName; }), 'columns')
                              )
                                .map((ziduan) => {
                                  return <Option id={item} value={ziduan}>{ziduan}</Option>
                                })
                            }
                          </Select>
                          <Select defaultValue="条件选择.." value={this.state.fuhaoKVstate[item]===undefined?"条件选择":this.state.fuhaoKVstate[item]} style={{ width: '10%' }} id={item} onChange={this.fuhaoChange}>
                            <Option id={item} value=" > ">大于</Option>
                            <Option id={item} value=" >= ">大于等于</Option>
                            <Option id={item} value=" = ">等于</Option>
                            <Option id={item} value=" < ">小于</Option>
                            <Option id={item} value=" <= ">小于等于</Option>
                          </Select>
                          <Input placeholder="条件输入.." value={this.state.conditionKVstate[item]===undefined?"输入条件":this.state.conditionKVstate[item]} id={item} onChange={this.whereInput} style={{ width: '30%' }} /> <DeleteOutlined id={item} onClick={this.deleteCondition} />
                        </span>
                      )
                    })

                  ) : null
                }

              {/* 隐藏 */}
              <AceEditor
                readOnly={this.props.fileUpload}
                ref={this.refEditor}
                theme="textmate"
                mode={this.props.dataSource.syntax || 'sql'}
                value={queryText}
                editorProps={{ $blockScrolling: Infinity }}
                width="100%"
                height="100%"
                setOptions={{
                    behavioursEnabled: true,
                    enableSnippets: true,
                    enableBasicAutocompletion: true,
                    enableLiveAutocompletion: !this.state.liveAutocompleteDisabled && this.state.autocompleteQuery,
                    autoScrollEditorIntoView: true,
                  }}
                showPrintMargin={false}
                wrapEnabled={false}
                onLoad={this.onLoad}
                onPaste={this.onPaste}
                onChange={this.updateQuery}
                onSelectionChange={this.updateSelectedQuery}
                style={{ visibility: 'hidden' }}
              />
            </div>



            <div className="editor__control">
              <div className="form-inline d-flex">
                <select
                  className="form-control datasource-small flex-fill w-100"
                  onChange={this.props.updateDataSource}
                  disabled={!this.props.isQueryOwner}
                >
                  {this.props.dataSources.map(ds => (
                    <option label={ds.name} value={ds.id} key={`ds-option-${ds.id}`}>
                      {ds.name}
                    </option>
                    ))}
                </select>
                {this.props.canEdit ? (
                  <Tooltip placement="top" title={modKey + ' + S'}>
                    <button
                      type="button"
                      className="btn btn-default m-l-5"
                      onClick={this.props.saveQuery}
                      data-test="SaveButton"
                      title="Save"
                    >
                      <span className="fa fa-floppy-o" />
                      <span className="hidden-xs m-l-5">保存</span>
                      {this.props.isDirty ? '*' : null}
                    </button>
                  </Tooltip>
                  ) : null}
                <Tooltip placement="top" title={modKey + ' + Enter'}>
                  {/*
                  Tooltip wraps disabled buttons with `<span>` and moves all styles
                  and classes to that `<span>`. There is a piece of CSS that fixes
                  button appearance, but also wwe need to add `disabled` class to
                  disabled buttons so it will be assigned to wrapper and make it
                  looking properly
                */}
                  <button
                    type="button"
                    className={'btn btn-primary m-l-5' + (isExecuteDisabled ? ' disabled' : '')}
                    disabled={isExecuteDisabled}
                    onClick={this.props.executeQuery}
                    data-test="ExecuteButton"
                  >
                    <span className="zmdi zmdi-play" />
                    <span className="hidden-xs m-l-5">{(this.state.selectedQueryText == null) ? '执行' : '执行被选项'}</span>
                  </button>
                </Tooltip>
              </div>
            </div>
          </div>
        </section>
        )
    );
  }
}

export default function init(ngModule) {
  ngModule.component('queryEditor', react2angular(QueryEditor));
}

init.init = true;
