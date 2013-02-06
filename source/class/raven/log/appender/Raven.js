qx.Class.define("raven.log.appender.Raven",
{
  extend : qx.core.Object,
  construct : function(dsn, registerGlobalError)
  {
    //Setup raven with DSN
    var uri = this.__parseUri(dsn), lastSlash = uri.path.lastIndexOf('/'), path = uri.path.substr(1, lastSlash);
    this.__project = ~~uri.path.substr(lastSlash + 1);
    this.__rpcUrl = '//' + uri.host + (uri.port ? ':' + uri.port : '') + '' + path + '/api/' + this.__project + '/store/';
    if (uri.protocol) {
      this.__rpcUrl = uri.protocol + ':' + this.__rpcUrl;
    }
    this.__rpcUrl += this.__getAuthQueryString(uri.user);
    this.base(arguments);
    this.__dateFormater = new qx.util.format.DateFormat(qx.util.format.DateFormat.ISO_MASKS.isoUtcDateTime)

    // Finally register to log engine
    qx.log.Logger.register(this);
    if (registerGlobalError === true) {
      qx.event.GlobalError.setErrorHandler(function(ex)
      {
        qx.log.Logger.error(ex);
        return true;
      });
    }
  },
  members :
  {
    __project : null,
    __rpcUrl : null,
    __dateFormater : null,
    __user : null,
    setUser : function(id, username, email)
    {
      this.__user = {

      }
      if (id) {
        this.__user.id = id;
      }
      if (username) {
        this.__user.username = username;
      }
      if (email) {
        this.__user.email = email;
      }
    },
    process : function(entry) {
      for (var i = 0, l = entry.items.length; i < l; i++)
      {
        var item = entry.items[i];
        var data =
        {
          message : item.text,
          level : entry.level,
          timestamp : entry.time,
          extra : {
            offset : entry.offset
          }
        }
        if (item.trace)
        {
          data['sentry.interfaces.Stacktrace'] = {
            frames : []
          };

          /*
          sentry.interfaces.Stacktrace
            [
              filename / function / module
              lineno
              colno
              abs_path
              context_line
              pre_context
              post_context
              in_app
              vars {}
            ]
          */
          for (var j = 0, m = item.trace.length; j < m; j++)
          {
            var trace = {

            };
            var info = item.trace[j].split(':');
            if (info.length === 3)
            {
              trace.filename = info[0].split('.').join('/') + '.js';
              trace.module = info[0];
              trace.lineno = info[1];
              trace.colno = info[2];
              data['sentry.interfaces.Stacktrace'].frames.push(trace);
            }
          }
        }
        if (entry.object) {
          data.extra.object_hash = entry.object;
        }
        this.__send(data);
      }
    },
    __parseUri : function(str)
    {
      var uriKeys = 'source protocol authority userInfo user password host port relative path directory file query anchor'.split(' '), uriPattern = /^(?:(?![^:@]+:[^:@\/]*@)([^:\/?#.]+):)?(?:\/\/)?((?:(([^:@]*)(?::([^:@]*))?)?@)?([^:\/?#]*)(?::(\d*))?)(((\/(?:[^?#](?![^?#\/]*\.[^?#\/.]+(?:[?#]|$)))*\/?)?([^?#\/]*))(?:\?([^#]*))?(?:#(.*))?)/;
      var m = uriPattern.exec(str), uri = {

      }, i = 14;
      while (i--) {
        uri[uriKeys[i]] = m[i] || '';
      }
      return uri;
    },
    __getHttpData : function()
    {
      /*
      Sentry message format :
        sentry.interfaces.Http
          url
          method
          data
          query_string
          cookies
          headers
          env
      */
      var http =
      {
        url : window.location.href,
        headers : {
          'User-Agent' : navigator.userAgent
        }
      };
      if (window.document.referrer) {
        http.headers.Referer = window.document.referrer;
      }
      return http;
    },
    __getAuthQueryString : function(key)
    {
      var qs = ['sentry_version=2.0', 'sentry_client=raven-qooxdoo/0.1', 'sentry_key=' + key];
      return '?' + qs.join('&');
    },
    __send : function(message)
    {
      var data = qx.lang.Object.mergeWith(
      {
        project : this.__project,
        logger : 'qooxdoo',
        platform : 'javascript',
        timestamp : new Date(),
        'sentry.interfaces.Http' : this.__getHttpData()
      }, message);
      if (this.__user) {
        data['sentry.interfaces.User'] = this.__user;
      }

      //platform

      //culprit

      //tags

      //server_name

      //modules

      //extra

      /*
       sentry.interfaces.Message
          message (1000)

       sentry.interfaces.Exception
        type
        value
        module

       sentry.interfaces.Stacktrace
        []
          filename / function / module
          lineno
          colno
          abs_path
          context_line
          pre_context
          post_context
          in_app
          vars {}

      */
      data.timestamp = this.__dateFormater.format(data.timestamp);
      new Image().src = this.__rpcUrl + '&sentry_data=' + encodeURIComponent(qx.util.Serializer.toJson(data));
    }
  }
});
