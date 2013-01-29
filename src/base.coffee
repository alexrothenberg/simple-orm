###
Project:   Simple-ORM - ActiveRecord-lite for the browser.
Copyright: ©2013 Alex Rothenberg
License:   Licensed under MIT license
           See https://github.com/alexrothenberg/simple-orm#legal
###

@Model ||= {}

db = openDatabase('Models', '1.0', 'Models DB', 1000000)

class Model.Base
  constructor: (@table_name, @columns) ->
    @connection = db
    @init()

  execute: (sql, onSuccess=null, retval={})=>
    defer = $.Deferred()

    console.log sql
    errorCB = (tx, err)->
      defer.reject(sql, err)
    successCB = (tx, results)->
      onSuccess(results) if onSuccess?
      defer.resolve(retval)

    queryDB = (tx) ->
      tx.executeSql sql, [], successCB, errorCB
    @connection.transaction queryDB, errorCB
    defer.promise(retval)

  init: =>
    sql = "CREATE TABLE IF NOT EXISTS #{@table_name} (id unique, #{@columns.join(',')})"
    @execute(sql)

  delete_all: =>
    sql = "DELETE FROM #{@table_name}"
    @execute(sql)

  all: =>
    objects = []
    querySuccess = (results) ->
      len = results.rows.length
      i = 0
      while i < len
        objects.push results.rows.item(i)
        i++

    sql = "SELECT * FROM #{@table_name}"
    @execute(sql, querySuccess, objects)

  find: (id)=>
    foundObject = {}
    columns = @columns
    querySuccess = (results) ->
      if results.rows.length == 1
        objectFromDB = results.rows.item(0)
        foundObject.id = objectFromDB.id
        columns.forEach (column)->
          foundObject[column] = objectFromDB[column]

    sql = "SELECT * FROM #{@table_name} WHERE id='#{id}'"
    @execute(sql, querySuccess, foundObject)

  create: (object) =>
    id = object.id
    quoted_values = @columns.map (column)->
      "'#{object[column]}'"
    sql = "INSERT INTO #{@table_name} (id, #{@columns.join(',')}) VALUES ('#{id}', #{quoted_values.join(',')})"
    @execute(sql, null, object)
