###
Coffeescript files are source.  Do not edit the .js files as they will be overwritten
###

describe 'Model.Base', ->
  results = [
    {id: 17, title: 'An Article'}
  ]
  resultsSqlObj = ()->
    rows:
      length: results.length
      item: (i)->
        results[i]
  successfulTransaction =
    executeSql: (sql, args, successCallback, errorCallback)->
      successCallback(@, resultsSqlObj())
  failingTransaction =
    executeSql: (sql, args, successCallback, errorCallback)->
      errorCallback(@, 'oops an error happened :(')
  stubConnection = (tx)->
    transaction: (executeFn, errorFn)->
      executeFn tx

  it 'should be subclassable to a concrete object/table', ->
    Article = new Model.Base('articles', ['title', 'author'])
    Article.table_name.should.equal 'articles'
    Article.columns.should.eql ['title', 'author']

  describe 'methods on a subclass', ->
    Article = null
    beforeEach ->
      Article = new Model.Base('articles', ['title'])
      sinon.spy(successfulTransaction, 'executeSql')
    afterEach ->
      successfulTransaction.executeSql.restore()

    describe '.execute', ->
      it 'should invoke callback after success', ->
        Article.connection = stubConnection(successfulTransaction)
        successCallback = sinon.spy()
        failCallback    = sinon.spy()
        Article.execute('select * from something').done(successCallback).fail(failCallback)
        successfulTransaction.executeSql.should.have.been.calledWith 'select * from something'
        successCallback.should.have.been.called
        failCallback.should.not.have.been.called

      it 'should invoke callback after failure', ->
        sinon.spy(App, 'debug_log')
        sinon.spy(failingTransaction, 'executeSql')
        Article.connection = stubConnection(failingTransaction)
        successCallback = sinon.spy()
        failCallback    = sinon.spy()
        Article.execute('select * from something').done(successCallback).fail(failCallback)
        successCallback.should.not.have.been.called
        failingTransaction.executeSql.should.have.been.calledWith 'select * from something'
        failingTransaction.executeSql.restore()
        successCallback.should.not.have.been.called
        failCallback.should.have.been.called

    describe '.init', ->
      it 'should callback with the articles after selecting them', ->
        Article.connection = stubConnection(successfulTransaction)
        Article.init()
        successfulTransaction.executeSql.should.have.been.calledWith 'CREATE TABLE IF NOT EXISTS articles (id unique, title)'

    describe '.delete_all', ->
      it 'should callback with the articles after selecting them', ->
        Article.connection = stubConnection(successfulTransaction)
        Article.delete_all()
        successfulTransaction.executeSql.should.have.been.calledWith 'DELETE FROM articles'

    describe '.all', ->
      it 'should callback with the articles after selecting them', ->
        Article.connection = stubConnection(successfulTransaction)
        doneCallback = sinon.spy()
        Article.all().done doneCallback
        successfulTransaction.executeSql.should.have.been.calledWith 'SELECT * FROM articles'
        doneCallback.should.have.been.calledWith(results)

    describe '.find', ->
      it 'should callback with result when able to find by id', ->
        Article.connection = stubConnection(successfulTransaction)
        doneCallback = sinon.spy()
        Article.find(17).done doneCallback
        successfulTransaction.executeSql.should.have.been.calledWith "SELECT * FROM articles WHERE id='17'"
        doneCallback.should.have.been.calledWithMatch(results[0])

      it 'should callback when unable to find by id', ->
        Article.connection = stubConnection(successfulTransaction)
        results = []
        doneCallback = sinon.spy()
        Article.find(987654321).done doneCallback
        successfulTransaction.executeSql.should.have.been.calledWith "SELECT * FROM articles WHERE id='987654321'"
        doneCallback.should.have.been.called
        doneCallback.should.not.have.been.calledWithMatch(results[0])
        doneCallback.should.not.have.been.calledWithMatch({id: '987654321'})

    describe '.create', ->
      it 'should callback with the articles after selecting them', ->
        Article.connection = stubConnection(successfulTransaction)
        newArticle =
          id: 12345
          title: 'A New Article'
        doneCallback = sinon.spy()
        Article.create(newArticle).done doneCallback
        successfulTransaction.executeSql.should.have.been.calledWith "INSERT INTO articles (id, title) VALUES ('12345', 'A New Article')"
        doneCallback.should.have.been.calledWithMatch(newArticle)

