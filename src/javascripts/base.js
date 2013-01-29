
/*
Project:   Simple-ORM - ActiveRecord-lite for the browser.
Copyright: ©2013 Alex Rothenberg
License:   Licensed under MIT license
           See https://github.com/alexrothenberg/simple-orm#legal
*/


(function() {
  var db,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  this.Model || (this.Model = {});

  db = openDatabase('Models', '1.0', 'Models DB', 1000000);

  Model.Base = (function() {

    function Base(table_name, columns) {
      this.table_name = table_name;
      this.columns = columns;
      this.create = __bind(this.create, this);

      this.find = __bind(this.find, this);

      this.all = __bind(this.all, this);

      this.delete_all = __bind(this.delete_all, this);

      this.init = __bind(this.init, this);

      this.execute = __bind(this.execute, this);

      this.connection = db;
      this.init();
    }

    Base.prototype.execute = function(sql, onSuccess, retval) {
      var defer, errorCB, queryDB, successCB;
      if (onSuccess == null) {
        onSuccess = null;
      }
      if (retval == null) {
        retval = {};
      }
      defer = $.Deferred();
      console.log(sql);
      errorCB = function(tx, err) {
        return defer.reject(sql, err);
      };
      successCB = function(tx, results) {
        if (onSuccess != null) {
          onSuccess(results);
        }
        return defer.resolve(retval);
      };
      queryDB = function(tx) {
        return tx.executeSql(sql, [], successCB, errorCB);
      };
      this.connection.transaction(queryDB, errorCB);
      return defer.promise(retval);
    };

    Base.prototype.init = function() {
      var sql;
      sql = "CREATE TABLE IF NOT EXISTS " + this.table_name + " (id unique, " + (this.columns.join(',')) + ")";
      return this.execute(sql);
    };

    Base.prototype.delete_all = function() {
      var sql;
      sql = "DELETE FROM " + this.table_name;
      return this.execute(sql);
    };

    Base.prototype.all = function() {
      var objects, querySuccess, sql;
      objects = [];
      querySuccess = function(results) {
        var i, len, _results;
        len = results.rows.length;
        i = 0;
        _results = [];
        while (i < len) {
          objects.push(results.rows.item(i));
          _results.push(i++);
        }
        return _results;
      };
      sql = "SELECT * FROM " + this.table_name;
      return this.execute(sql, querySuccess, objects);
    };

    Base.prototype.find = function(id) {
      var columns, foundObject, querySuccess, sql;
      foundObject = {};
      columns = this.columns;
      querySuccess = function(results) {
        var objectFromDB;
        if (results.rows.length === 1) {
          objectFromDB = results.rows.item(0);
          foundObject.id = objectFromDB.id;
          return columns.forEach(function(column) {
            return foundObject[column] = objectFromDB[column];
          });
        }
      };
      sql = "SELECT * FROM " + this.table_name + " WHERE id='" + id + "'";
      return this.execute(sql, querySuccess, foundObject);
    };

    Base.prototype.create = function(object) {
      var id, quoted_values, sql;
      id = object.id;
      quoted_values = this.columns.map(function(column) {
        return "'" + object[column] + "'";
      });
      sql = "INSERT INTO " + this.table_name + " (id, " + (this.columns.join(',')) + ") VALUES ('" + id + "', " + (quoted_values.join(',')) + ")";
      return this.execute(sql, null, object);
    };

    return Base;

  })();

}).call(this);
