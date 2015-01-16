var run = require('../');
var mongo = require('mongodb');
var assert = require('assert');
var debug = require('debug')('mongodb-runner:test');

describe('run', function(){
  it('should start a standalone', function(done){
    var prog = run('standalone', {smallfiles: true}, function(err){
      if(err) return done(err);
      prog.teardown();
    })
    .on('end', done);
  });

  it('should start with auth', function(done){
    var prog = run('auth-basic', {smallfiles: true}, function(err){
      if(err) return done(err);
      prog.teardown();
    })
    .on('end', done);
  });

  it('should start a replica set', function(done){
    var prog = run('replicaset', {smallfiles: true, oplogSize: 10}, function(err){
      if(err) return done(err);
      var uri = prog.options.get('uri');
      debug('connecting to ', uri);
      mongo(uri, function(err, db){
        if(err){
          prog.teardown();
          assert.ifError(err);
          return;
        }
        debug('connected.  making sure we can run a query');
        db.db('local').collection('oplog.rs').find().toArray(function(err, docs){
          if(err){
            prog.teardown();
            assert.ifError(err);
            return;
          }
          debug('have correct oplog init entry!');
          assert.equal(docs.length, 1);
          db.close(function(){
            prog.teardown();
          });
        });
      });
    })
    .on('end', done);
  });

  it.skip('should start a cluster', function(done){
    run('cluster', done);
  });
});
