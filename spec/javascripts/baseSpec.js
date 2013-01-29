
/*
Coffeescript files are source.  Do not edit the .js files as they will be overwritten
*/


(function() {

  describe('Model.Base', function() {
    var failingTransaction, results, resultsSqlObj, stubConnection, successfulTransaction;
    results = [
      {
        id: 17,
        title: 'An Article'
      }
    ];
    resultsSqlObj = function() {
      return {
        rows: {
          length: results.length,
          item: function(i) {
            return results[i];
          }
        }
      };
    };
    successfulTransaction = {
      executeSql: function(sql, args, successCallback, errorCallback) {
        return successCallback(this, resultsSqlObj());
      }
    };
    failingTransaction = {
      executeSql: function(sql, args, successCallback, errorCallback) {
        return errorCallback(this, 'oops an error happened :(');
      }
    };
    stubConnection = function(tx) {
      return {
        transaction: function(executeFn, errorFn) {
          return executeFn(tx);
        }
      };
    };
    it('should be subclassable to a concrete object/table', function() {
      var Article;
      Article = new Model.Base('articles', ['title', 'author']);
      Article.table_name.should.equal('articles');
      return Article.columns.should.eql(['title', 'author']);
    });
    return describe('methods on a subclass', function() {
      var Article;
      Article = null;
      beforeEach(function() {
        Article = new Model.Base('articles', ['title']);
        return sinon.spy(successfulTransaction, 'executeSql');
      });
      afterEach(function() {
        return successfulTransaction.executeSql.restore();
      });
      describe('.execute', function() {
        it('should invoke callback after success', function() {
          var failCallback, successCallback;
          Article.connection = stubConnection(successfulTransaction);
          successCallback = sinon.spy();
          failCallback = sinon.spy();
          Article.execute('select * from something').done(successCallback).fail(failCallback);
          successfulTransaction.executeSql.should.have.been.calledWith('select * from something');
          successCallback.should.have.been.called;
          return failCallback.should.not.have.been.called;
        });
        return it('should invoke callback after failure', function() {
          var failCallback, successCallback;
          sinon.spy(console, 'log');
          sinon.spy(failingTransaction, 'executeSql');
          Article.connection = stubConnection(failingTransaction);
          successCallback = sinon.spy();
          failCallback = sinon.spy();
          Article.execute('select * from something').done(successCallback).fail(failCallback);
          successCallback.should.not.have.been.called;
          failingTransaction.executeSql.should.have.been.calledWith('select * from something');
          failingTransaction.executeSql.restore();
          successCallback.should.not.have.been.called;
          return failCallback.should.have.been.called;
        });
      });
      describe('.init', function() {
        return it('should callback with the articles after selecting them', function() {
          Article.connection = stubConnection(successfulTransaction);
          Article.init();
          return successfulTransaction.executeSql.should.have.been.calledWith('CREATE TABLE IF NOT EXISTS articles (id unique, title)');
        });
      });
      describe('.delete_all', function() {
        return it('should callback with the articles after selecting them', function() {
          Article.connection = stubConnection(successfulTransaction);
          Article.delete_all();
          return successfulTransaction.executeSql.should.have.been.calledWith('DELETE FROM articles');
        });
      });
      describe('.all', function() {
        return it('should callback with the articles after selecting them', function() {
          var doneCallback;
          Article.connection = stubConnection(successfulTransaction);
          doneCallback = sinon.spy();
          Article.all().done(doneCallback);
          successfulTransaction.executeSql.should.have.been.calledWith('SELECT * FROM articles');
          return doneCallback.should.have.been.calledWith(results);
        });
      });
      describe('.find', function() {
        it('should callback with result when able to find by id', function() {
          var doneCallback;
          Article.connection = stubConnection(successfulTransaction);
          doneCallback = sinon.spy();
          Article.find(17).done(doneCallback);
          successfulTransaction.executeSql.should.have.been.calledWith("SELECT * FROM articles WHERE id='17'");
          return doneCallback.should.have.been.calledWithMatch(results[0]);
        });
        return it('should callback when unable to find by id', function() {
          var doneCallback;
          Article.connection = stubConnection(successfulTransaction);
          results = [];
          doneCallback = sinon.spy();
          Article.find(987654321).done(doneCallback);
          successfulTransaction.executeSql.should.have.been.calledWith("SELECT * FROM articles WHERE id='987654321'");
          doneCallback.should.have.been.called;
          doneCallback.should.not.have.been.calledWithMatch(results[0]);
          return doneCallback.should.not.have.been.calledWithMatch({
            id: '987654321'
          });
        });
      });
      return describe('.create', function() {
        return it('should callback with the articles after selecting them', function() {
          var doneCallback, newArticle;
          Article.connection = stubConnection(successfulTransaction);
          newArticle = {
            id: 12345,
            title: 'A New Article'
          };
          doneCallback = sinon.spy();
          Article.create(newArticle).done(doneCallback);
          successfulTransaction.executeSql.should.have.been.calledWith("INSERT INTO articles (id, title) VALUES ('12345', 'A New Article')");
          return doneCallback.should.have.been.calledWithMatch(newArticle);
        });
      });
    });
  });

}).call(this);
