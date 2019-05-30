/* eslint-disable */

/* export default */ function init(ngModule) {
  ngModule.run(($httpBackend) => {
    $httpBackend.whenGET('api/organization/status').respond(
      {
        object_counters: {
          queries: 0,
          alerts: 0,
          dashboards: 1,//0
          users: 1,
          data_sources: 1,//0
        },
      },
    );

    $httpBackend.whenGET('api/queries/favorites').respond(
      {
        count: 0,
        page: 1,
        page_size: 25,
        results: [],
      },
    );

    $httpBackend.whenGET('api/dashboards/favorites').respond(
      {
        count: 0,
        page: 1,
        page_size: 25,
        results: [],
      },
    );

    $httpBackend.whenGET('api/queries/favorites').respond(
      {
        count: 0,
        page: 1,
        page_size: 25,
        results: [],
      },
    );

    $httpBackend.whenGET('api/dashboards/favorites').respond(
      {
        count: 0,
        page: 1,
        page_size: 25,
        results: [],
      },
    );

    $httpBackend.whenPOST('api/events').respond(
      null,
    );

    $httpBackend.whenGET('api/session').respond(
      {
        org_slug: 'default',
        messages: [],
        user: {
          name: '中科蜂巢科技测试用户',
          profile_image_url: 'https://www.gravatar.com/avatar/53444f91e698c0c7caa2dbc3bdbf93fc?s=40&d=identicon',
          id: 1,
          groups: [1, 2],
          email: 'demo@demo.com',
          permissions: ['admin', 'super_admin', 'create_dashboard', 'create_query', 'edit_dashboard', 'edit_query', 'view_query', 'view_source', 'execute_query', 'list_users', 'schedule_query', 'list_dashboards', 'list_alerts', 'list_data_sources'],
        },
        client_config: {
          allowScriptsInUserInput: false,
          googleLoginEnabled: false,
          dateFormatList: ['DD/MM/YY', 'YYYY-MM-DD', 'MM/DD/YY'],
          pageSize: 20,
          showPermissionsControl: false,
          dateFormat: 'DD/MM/YY',
          floatFormat: '0,0.00',
          mailSettingsMissing: true,
          basePath: 'http://localhost:8080/',
          autoPublishNamedQueries: true,
          queryRefreshIntervals: [60, 300, 600, 900, 1800, 3600, 7200, 10800, 14400, 18000, 21600, 25200, 28800,
            32400, 36000, 39600, 43200, 86400, 604800, 1209600, 2592000],
          version: '0.0.1',
          dashboardRefreshIntervals: [60, 300, 600, 1800, 3600, 43200, 86400],
          integerFormat: '0,0',
          dateTimeFormat: 'DD/MM/YY HH:mm',
          newVersionAvailable: false,
          allowCustomJSVisualizations: false,
          pageSizeOptions: [5, 10, 20, 50, 100],
          tableCellMaxJSONSize: 50000,
        },
      },
    );

    $httpBackend.whenGET('api/users/1').respond(
      {
        "auth_type": "password",
        "is_disabled": false,
        "updated_at": "2019-05-02T20:56:27.879Z",
        "profile_image_url": "https://www.gravatar.com/avatar/53444f91e698c0c7caa2dbc3bdbf93fc?s=40&d=identicon",
        "is_invitation_pending": false,
        "groups": [
          1,
          2
        ],
        "id": 1,
        "name": "中科蜂巢科技测试用户",
        "created_at": "2019-05-01T19:09:11.134Z",
        "disabled_at": null,
        "is_email_verified": true,
        "active_at": "2019-05-02T20:30:02Z",
        "api_key": "oacBhhxMIFgn46U0XiO5KI5C6xYGQUA7HBOmyscU",
        "email": "demo@demo.com"
      }
    );

    $httpBackend.whenGET('api/groups').respond(
      [
        {
          "created_at": "2019-05-01T19:09:11.043Z",
          "permissions": [
            "admin",
            "super_admin"
          ],
          "type": "builtin",
          "id": 1,
          "name": "admin"
        },
        {
          "created_at": "2019-05-01T19:09:11.043Z",
          "permissions": [
            "create_dashboard",
            "create_query",
            "edit_dashboard",
            "edit_query",
            "view_query",
            "view_source",
            "execute_query",
            "list_users",
            "schedule_query",
            "list_dashboards",
            "list_alerts",
            "list_data_sources"
          ],
          "type": "builtin",
          "id": 2,
          "name": "default"
        }
      ]
    );

    $httpBackend.whenGET('api/data_sources').respond(
      [{
        "name": "My MySQL",
        "pause_reason": null,
        "syntax": "sql",
        "paused": 0,
        "view_only": false,
        "type": "mysql",
        "id": 1
      }]
    );

    $httpBackend.whenGET('api/data_sources/1/schema').respond(
      {"error": {"message": "Error retrieving schema.", "code": 2}}
    );

    $httpBackend.whenGET('api/query_snippets').respond([]);


    $httpBackend.whenGET('api/data_sources/types').respond([
      {
        "configuration_schema": {
          "secret": [
            "passwd"
          ],
          "required": [
            "db"
          ],
          "type": "object",
          "properties": {
            "ssl_key": {
              "type": "string",
              "title": "Path to private key file (SSL)"
            },
            "ssl_cert": {
              "type": "string",
              "title": "Path to client certificate file (SSL)"
            },
            "ssl_cacert": {
              "type": "string",
              "title": "Path to CA certificate file to verify peer against (SSL)"
            },
            "passwd": {
              "type": "string",
              "title": "Password"
            },
            "db": {
              "type": "string",
              "title": "Database name"
            },
            "host": {
              "default": "127.0.0.1",
              "type": "string"
            },
            "user": {
              "type": "string"
            },
            "use_ssl": {
              "type": "boolean",
              "title": "Use SSL"
            },
            "port": {
              "default": 3306,
              "type": "number"
            }
          },
          "order": [
            "host",
            "port",
            "user",
            "passwd",
            "db"
          ]
        },
        "type": "mysql",
        "name": "MySQL数据库"
      },
      {
        "configuration_schema": {
          "secret": [
            "password"
          ],
          "required": [
            "db"
          ],
          "type": "object",
          "properties": {
            "tds_version": {
              "default": "7.0",
              "type": "string",
              "title": "TDS Version"
            },
            "charset": {
              "default": "UTF-8",
              "type": "string",
              "title": "Character Set"
            },
            "db": {
              "type": "string",
              "title": "Database Name"
            },
            "server": {
              "default": "127.0.0.1",
              "type": "string"
            },
            "user": {
              "type": "string"
            },
            "password": {
              "type": "string"
            },
            "port": {
              "default": 1433,
              "type": "number"
            }
          }
        },
        "type": "mssql",
        "name": "Microsoft SQL Server 数据库"
      },
      {
        "configuration_schema": {
          "required": [
            "connectionString",
            "dbName"
          ],
          "type": "object",
          "properties": {
            "connectionString": {
              "type": "string",
              "title": "Connection String"
            },
            "dbName": {
              "type": "string",
              "title": "Database Name"
            },
            "replicaSetName": {
              "type": "string",
              "title": "Replica Set Name"
            }
          }
        },
        "type": "mongodb",
        "name": "MongoDB 数据库"
      },
      {
        "configuration_schema": {
          "secret": [
            "jsonKeyFile"
          ],
          "required": [
            "jsonKeyFile"
          ],
          "type": "object",
          "properties": {
            "jsonKeyFile": {
              "type": "string",
              "title": "JSON Key File"
            }
          }
        },
        "type": "google_spreadsheets",
        "name": "Microsoft Excel sheet 表单"
      },
      {
        "configuration_schema": {
          "required": [
            "url"
          ],
          "type": "object",
          "properties": {
            "url": {
              "type": "string",
              "title": "Prometheus API URL"
            }
          }
        },
        "type": "prometheus",
        "name": "Prometheus - Kubernetes 集群数据监控工具"
      },
      {
        "configuration_schema": {
          "secret": [
            "basic_auth_password"
          ],
          "required": [
            "server"
          ],
          "type": "object",
          "properties": {
            "basic_auth_password": {
              "type": "string",
              "title": "Basic Auth Password"
            },
            "basic_auth_user": {
              "type": "string",
              "title": "Basic Auth User"
            },
            "server": {
              "type": "string",
              "title": "Base URL"
            }
          },
          "order": [
            "server",
            "basic_auth_user",
            "basic_auth_password"
          ]
        },
        "type": "elasticsearch",
        "name": "Elasticsearch 分布式全文检索框架"
      },
      {
        "configuration_schema": {
          "secret": [
            "password"
          ],
          "required": [
            "dbname"
          ],
          "type": "object",
          "properties": {
            "port": {
              "default": 5432,
              "type": "number"
            },
            "host": {
              "default": "127.0.0.1",
              "type": "string"
            },
            "user": {
              "type": "string"
            },
            "sslmode": {
              "default": "prefer",
              "type": "string",
              "title": "SSL Mode"
            },
            "password": {
              "type": "string"
            },
            "dbname": {
              "type": "string",
              "title": "Database Name"
            }
          },
          "order": [
            "host",
            "port",
            "user",
            "password"
          ]
        },
        "type": "pg",
        "name": "PostgreSQL 对象关系数据库"
      },
      {
        "configuration_schema": {
          "required": [
            "dbpath"
          ],
          "type": "object",
          "properties": {
            "dbpath": {
              "type": "string",
              "title": "Database Path"
            }
          }
        },
        "type": "sqlite",
        "name": "Sqlite"
      },
      {
        "configuration_schema": {
          "required": [
            "host"
          ],
          "type": "object",
          "properties": {
            "username": {
              "type": "string"
            },
            "host": {
              "type": "string"
            },
            "port": {
              "type": "number"
            },
            "database": {
              "type": "string"
            }
          },
          "order": [
            "host",
            "port",
            "database",
            "username"
          ]
        },
        "type": "hive",
        "name": "Hive 数据仓库"
      },
      {
        "configuration_schema": {
          "secret": [
            "password"
          ],
          "required": [
            "url",
            "username",
            "password"
          ],
          "type": "object",
          "properties": {
            "url": {
              "type": "string",
              "title": "JIRA URL"
            },
            "username": {
              "type": "string",
              "title": "Username"
            },
            "password": {
              "type": "string",
              "title": "Password"
            }
          },
          "order": [
            "url",
            "username",
            "password"
          ]
        },
        "type": "jirajql",
        "name": "JIRA (JQL)"
      },
      {
        "configuration_schema": {
          "secret": [
            "basic_auth_password"
          ],
          "required": [
            "server"
          ],
          "type": "object",
          "properties": {
            "basic_auth_password": {
              "type": "string",
              "title": "Basic Auth Password"
            },
            "basic_auth_user": {
              "type": "string",
              "title": "Basic Auth User"
            },
            "server": {
              "type": "string",
              "title": "Base URL"
            }
          },
          "order": [
            "server",
            "basic_auth_user",
            "basic_auth_password"
          ]
        },
        "type": "kibana",
        "name": "Kibana - 分析及可视化平台"
      },
      {
        "configuration_schema": {
          "secret": [
            "password"
          ],
          "required": [
            "dbname"
          ],
          "type": "object",
          "properties": {
            "host": {
              "default": "127.0.0.1",
              "type": "string"
            },
            "password": {
              "type": "string"
            },
            "user": {
              "type": "string"
            },
            "dbname": {
              "type": "string",
              "title": "Database Name"
            },
            "port": {
              "default": 50000,
              "type": "number"
            }
          },
          "order": [
            "host",
            "port",
            "user",
            "password",
            "dbname"
          ]
        },
        "type": "db2",
        "name": "DB2"
      },
      {
        "configuration_schema": {
          "secret": [
            "password"
          ],
          "type": "object",
          "properties": {
            "url": {
              "type": "string",
              "title": "URL base path"
            },
            "username": {
              "type": "string",
              "title": "HTTP Basic Auth Username"
            },
            "password": {
              "type": "string",
              "title": "HTTP Basic Auth Password"
            }
          },
          "order": [
            "url",
            "username",
            "password"
          ]
        },
        "type": "url",
        "name": "Url"
      },
      {
        "configuration_schema": {
          "type": "object",
          "properties": {}
        },
        "type": "results",
        "name": "DataVis 查询结果数据集"
      },
    ]);

    $httpBackend.whenGET('api/destinations').respond([]);

    $httpBackend.whenGET('api/destinations/types').respond([
      {
        "configuration_schema": {
          "required": [
            "message_template",
            "api_token",
            "room_id"
          ],
          "type": "object",
          "properties": {
            "room_id": {
              "type": "string",
              "title": "Room ID"
            },
            "message_template": {
              "default": "{alert_name} changed state to {new_state}.\\n{alert_url}\\n{query_url}",
              "type": "string",
              "title": "Message Template"
            },
            "api_token": {
              "type": "string",
              "title": "API Token"
            }
          }
        },
        "type": "chatwork",
        "name": "ChatWork",
        "icon": "fa-comment"
      },
      {
        "configuration_schema": {
          "required": [
            "integration_key"
          ],
          "type": "object",
          "properties": {
            "integration_key": {
              "type": "string",
              "title": "PagerDuty Service Integration Key"
            },
            "description": {
              "type": "string",
              "title": "Description for the event, defaults to query"
            }
          }
        },
        "type": "pagerduty",
        "name": "PagerDuty",
        "icon": "creative-commons-pd-alt"
      },
      {
        "configuration_schema": {
          "type": "object",
          "properties": {
            "url": {
              "type": "string",
              "title": "Slack Webhook URL"
            },
            "username": {
              "type": "string",
              "title": "Username"
            },
            "channel": {
              "type": "string",
              "title": "Channel"
            },
            "icon_emoji": {
              "type": "string",
              "title": "Icon (Emoji)"
            },
            "icon_url": {
              "type": "string",
              "title": "Icon (URL)"
            }
          }
        },
        "type": "slack",
        "name": "Slack",
        "icon": "fa-slack"
      },
      {
        "configuration_schema": {
          "secret": [
            "password"
          ],
          "required": [
            "url"
          ],
          "type": "object",
          "properties": {
            "url": {
              "type": "string"
            },
            "username": {
              "type": "string"
            },
            "password": {
              "type": "string"
            }
          }
        },
        "type": "webhook",
        "name": "Webhook",
        "icon": "fa-bolt"
      },
      {
        "configuration_schema": {
          "required": [
            "url"
          ],
          "type": "object",
          "properties": {
            "url": {
              "type": "string",
              "title": "HipChat Notification URL (get it from the Integrations page)"
            }
          }
        },
        "type": "hipchat",
        "name": "HipChat",
        "icon": "fa-comment-o"
      },
      {
        "configuration_schema": {
          "type": "object",
          "properties": {
            "url": {
              "type": "string",
              "title": "Mattermost Webhook URL"
            },
            "username": {
              "type": "string",
              "title": "Username"
            },
            "channel": {
              "type": "string",
              "title": "Channel"
            },
            "icon_url": {
              "type": "string",
              "title": "Icon (URL)"
            }
          }
        },
        "type": "mattermost",
        "name": "Mattermost",
        "icon": "fa-bolt"
      },
      {
        "configuration_schema": {
          "required": [
            "addresses"
          ],
          "type": "object",
          "properties": {
            "subject_template": {
              "default": "({state}) {alert_name}",
              "type": "string",
              "title": "Subject Template"
            },
            "addresses": {
              "type": "string"
            }
          }
        },
        "type": "email",
        "name": "Email",
        "icon": "fa-envelope"
      },
      {
        "configuration_schema": {
          "required": [
            "url"
          ],
          "type": "object",
          "properties": {
            "url": {
              "type": "string",
              "title": "Webhook URL (get it from the room settings)"
            },
            "icon_url": {
              "type": "string",
              "title": "Icon URL (32x32 or multiple, png format)"
            }
          }
        },
        "type": "hangouts_chat",
        "name": "Google Hangouts Chat",
        "icon": "fa-bolt"
      }
    ]);

    $httpBackend.whenGET('api/query_snippets').respond([]);

    $httpBackend.whenGET('api/settings/organization').respond({
      "settings": {
        "date_format": "DD/MM/YY",
        "auth_jwt_auth_public_certs_url": "",
        "auth_jwt_auth_audience": "",
        "auth_saml_enabled": false,
        "integer_format": "0,0",
        "auth_jwt_login_enabled": false,
        "auth_saml_nameid_format": "",
        "auth_jwt_auth_algorithms": [
          "HS256",
          "RS256",
          "ES256"
        ],
        "auth_google_apps_domains": [],
        "auth_jwt_auth_cookie_name": "",
        "float_format": "0,0.00",
        "auth_saml_metadata_url": "",
        "feature_show_permissions_control": false,
        "auth_saml_entity_id": "",
        "auth_password_login_enabled": true,
        "auth_jwt_auth_header_name": "",
        "auth_jwt_auth_issuer": ""
      }
    });

    $httpBackend.whenGET('api/events').respond(null);

    $httpBackend.whenGET('status.json').respond({
      "dashboards_count": 0,
      "database_metrics": {
        "metrics": [
          [
            "Query Results Size",
            24576
          ],
          [
            "Redash DB Size",
            8396972
          ]
        ]
      },
      "manager": {
        "last_refresh_at": "1558127725.793",
        "outdated_queries_count": "0",
        "query_ids": "[]",
        "queues": {
          "celery": {
            "size": 62
          }
        }
      },
      "queries_count": 0,
      "query_results_count": 0,
      "redis_used_memory": 1231488,
      "redis_used_memory_human": "1.17M",
      "unused_query_results_count": 0,
      "version": "7.0.0",
      "widgets_count": 0,
      "workers": []
    });

    $httpBackend.whenGET('api/dashboards/tags').respond({"tags": []});

    $httpBackend.whenGET('api/alerts').respond([]);

    $httpBackend.whenGET('api/groups/1').respond({
      "created_at": "2019-05-01T19:09:11.043Z",
      "permissions": ["admin", "super_admin"],
      "type": "builtin",
      "id": 1,
      "name": "admin"
    });

    $httpBackend.whenGET('api/groups/1/members').respond([
      {
        "auth_type": "password",
        "is_disabled": false,
        "updated_at": "2019-05-02T20:56:27.879Z",
        "profile_image_url": "https://www.gravatar.com/avatar/53444f91e698c0c7caa2dbc3bdbf93fc?s=40&d=identicon",
        "is_invitation_pending": false,
        "groups": [
          1,
          2
        ],
        "id": 1,
        "name": "demo",
        "created_at": "2019-05-01T19:09:11.134Z",
        "disabled_at": null,
        "is_email_verified": true,
        "active_at": "2019-05-02T20:30:02Z",
        "email": "demo@demo.com"
      }
    ]);

    //api/queries/tags
    $httpBackend.whenGET('api/queries/tags').respond({"tags": []});

    //api/queries?order=-created_at&page=1&page_size=20
    $httpBackend.whenGET('api/queries?order=-created_at&page=1&page_size=20').respond(
      {"count": 0, "page": 1, "page_size": 20, "results": []}
    );

    $httpBackend.whenGET('api/dashboards?order=-created_at&page=1&page_size=20').respond(
      {
        "count": 1,
        "page": 1,
        "page_size": 20,
        "results": [{
          "tags": [],
          "is_archived": false,
          "updated_at": "2019-05-21T21:01:00.747Z",
          "is_favorite": false,
          "user": {
            "auth_type": "password",
            "is_disabled": false,
            "updated_at": "2019-05-21T21:01:00.747Z",
            "profile_image_url": "https://www.gravatar.com/avatar/53444f91e698c0c7caa2dbc3bdbf93fc?s=40&d=identicon",
            "is_invitation_pending": false,
            "groups": [1, 2],
            "id": 1,
            "name": "demo",
            "created_at": "2019-05-01T19:09:11.134Z",
            "disabled_at": null,
            "is_email_verified": true,
            "active_at": "2019-05-02T20:30:02Z",
            "email": "demo@demo.com"
          },
          "layout": [],
          "is_draft": true,
          "id": 2,
          "user_id": 1,
          "name": "\u6d4b\u8bd5Dashboard",
          "created_at": "2019-05-21T21:01:00.747Z",
          "slug": "-dashboard",
          "version": 1,
          "widgets": null,
          "dashboard_filters_enabled": false
        }]
      }
    );

    $httpBackend.whenGET('api/dashboards/-dashboard').respond(
      {
        "tags": [],
        "is_archived": false,
        "updated_at": "2019-05-21T21:01:00.747Z",
        "is_favorite": false,
        "user": {
          "auth_type": "password",
          "is_disabled": false,
          "updated_at": "2019-05-21T21:01:00.747Z",
          "profile_image_url": "https://www.gravatar.com/avatar/53444f91e698c0c7caa2dbc3bdbf93fc?s=40&d=identicon",
          "is_invitation_pending": false,
          "groups": [1, 2],
          "id": 1,
          "name": "demo",
          "created_at": "2019-05-01T19:09:11.134Z",
          "disabled_at": null,
          "is_email_verified": true,
          "active_at": "2019-05-02T20:30:02Z",
          "email": "demo@demo.com"
        },
        "layout": [],
        "is_draft": true,
        "id": 2,
        "can_edit": true,
        "user_id": 1,
        "name": "\u6d4b\u8bd5Dashboard",
        "created_at": "2019-05-21T21:01:00.747Z",
        "slug": "-dashboard",
        "version": 1,
        "widgets": [],
        "dashboard_filters_enabled": false
      }
    );

    // {"name":"测试Dashboard"}
    $httpBackend.whenPOST('api/dashboards').respond(
      {
        "tags": [],
        "is_archived": false,
        "updated_at": "2019-05-21T21:01:00.747Z",
        "is_favorite": false,
        "user": {
          "auth_type": "password",
          "is_disabled": false,
          "updated_at": "2019-05-21T21:01:00.747Z",
          "profile_image_url": "https://www.gravatar.com/avatar/53444f91e698c0c7caa2dbc3bdbf93fc?s=40&d=identicon",
          "is_invitation_pending": false,
          "groups": [1, 2],
          "id": 1,
          "name": "demo",
          "created_at": "2019-05-01T19:09:11.134Z",
          "disabled_at": null,
          "is_email_verified": true,
          "active_at": "2019-05-02T20:30:02Z",
          "email": "demo@demo.com"
        },
        "layout": [],
        "is_draft": true,
        "id": 2,
        "user_id": 1,
        "name": "\u6d4b\u8bd5Dashboard",
        "created_at": "2019-05-21T21:01:00.747Z",
        "slug": "-dashboard",
        "version": 1,
        "widgets": null,
        "dashboard_filters_enabled": false
      }
    );


  });
}

init.init = true;
