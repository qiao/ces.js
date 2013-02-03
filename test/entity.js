/*globals describe: true, it: true */

var CES = require('../'),
    CompA = CES.Component.extend({ name: 'a' }),
    CompB = CES.Component.extend({ name: 'b' }),
    CompC = CES.Component.extend({ name: 'c' }),
    should = require('should');

describe('entity', function () {
    it('should have unique id', function () {
        var ea = new CES.Entity(),
            eb = new CES.Entity(),
            ec = new CES.Entity();
        
        ea.id.should.not.equal(eb.id);
        eb.id.should.not.equal(ec.id);
        ea.id.should.not.equal(ec.id);
    });

    it('should return true when checking added components', function () {
        var entity = new CES.Entity();
        entity.addComponent(new CompA());
        entity.addComponent(new CompB());
        entity.addComponent(new CompC());

        entity.hasComponent('a').should.be.true;
        entity.hasComponent('b').should.be.true;
        entity.hasComponent('c').should.be.true;
        entity.hasComponent('d').should.be.false;
    });

    it('should return false when checking removed components', function () {
        var entity = new CES.Entity();
        entity.addComponent(new CompA());
        entity.addComponent(new CompB());
        entity.addComponent(new CompC());

        entity.removeComponent('b');
        entity.removeComponent('c');
    
        entity.hasComponent('a').should.be.true;
        entity.hasComponent('b').should.be.false;
        entity.hasComponent('c').should.be.false;
    });

    it('should return the correct component', function () {
        var entity = new CES.Entity(),
            ca = new CompA(),
            cb = new CompB(),
            cc = new CompC();

        entity.addComponent(ca);
        entity.addComponent(cb);
        entity.addComponent(cc);
    
        entity.getComponent('a').should.equal(ca);
        entity.getComponent('b').should.equal(cb);
        entity.getComponent('c').should.equal(cc);
        should.not.exist(entity.getComponent('d'));
    });

    it('should emit signals when adding components', function () {
        var entity = new CES.Entity(),
            collections = [];

        entity.onComponentAdded.add(function (entity, componentName) {
            collections.push([entity, componentName]);
        });

        entity.addComponent(new CompA());
        entity.addComponent(new CompB());

        collections.should.eql([[entity, 'a'], [entity, 'b']]);
    });

    it('should emit signals when removing components', function () {
        var entity = new CES.Entity(),
            collections = [];

        entity.onComponentRemoved.add(function (entity, componentName) {
            collections.push([entity, componentName]);
        });
        entity.onComponentRemoved.add(function (entity, componentName) {
            collections.push('removed');
        });

        entity.addComponent(new CompA());
        entity.addComponent(new CompB());
        entity.addComponent(new CompC());

        entity.removeComponent('a');
        entity.removeComponent('b');

        collections.should.eql([
            [entity, 'a'], 'removed', [entity, 'b'], 'removed'
        ]);
    });
});
