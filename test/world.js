/*globals describe: true, it: true */

var sinon = require('sinon'),
    CES = require('../'),
    CompA = CES.Component.extend({ name: 'a' }),
    CompB = CES.Component.extend({ name: 'b' }),
    CompC = CES.Component.extend({ name: 'c' });

function createEntityA() {
    var entity = new CES.Entity();
    entity.addComponent(new CompA());
    entity.addComponent(new CompB());
    entity.addComponent(new CompC());
    return entity;
}

function createEntityB() {
    var entity = new CES.Entity();
    entity.addComponent(new CompA());
    entity.addComponent(new CompB());
    return entity;
}

function createEntityC() {
    var entity = new CES.Entity();
    entity.addComponent(new CompA());
    entity.addComponent(new CompC());
    return entity;
}

describe('world', function () {
    it('should get correct entities for each family', function () {
        var world = new CES.World(),
            e, i;

        for (i = 0; i < 100; ++i) {
            e = createEntityA();
            world.addEntity(e);
        }
        for (i = 0; i < 100; ++i) {
            e = createEntityB();
            world.addEntity(e);
        }
        for (i = 0; i < 100; ++i) {
            e = createEntityC();
            world.addEntity(e);
        }

        world.getEntities('a').length.should.equal(300);
        world.getEntities('b').length.should.equal(200);
        world.getEntities('c').length.should.equal(200);
        world.getEntities('a', 'b', 'c').length.should.equal(100);
        world.getEntities('a', 'b').length.should.equal(200);
        world.getEntities('a', 'c').length.should.equal(200);
        world.getEntities('a', 'b', 'c', 'd').length.should.equal(0);
    });

    it('should update entity-family relationship when adding components', function () {
        var world = new CES.World(),
            e, i;

        for (i = 0; i < 100; ++i) {
            e = createEntityB();
            world.addEntity(e);
        }
        world.getEntities('a', 'b').length.should.equal(100);
        world.getEntities('a', 'b', 'c').length.should.equal(0);

        e.addComponent(new CompC());
        world.getEntities('a', 'b', 'c').length.should.equal(1);
    });

    it('should update entity-family relationship when removing components', function () {
        var world = new CES.World(),
            e, i;

        for (i = 0; i < 100; ++i) {
            e = createEntityA();
            world.addEntity(e);
        }
        world.getEntities('a', 'b', 'c').length.should.equal(100);
        world.getEntities('a', 'b').length.should.equal(100);

        e.removeComponent('c');

        world.getEntities('a', 'b', 'c').length.should.equal(99);
        world.getEntities('a', 'b').length.should.equal(100);
    });

    it('should emit signal when entity with one component is added', function() {
        var world = new CES.World();

        var aListener = sinon.spy();
        var bListener = sinon.spy();
        world.entityAdded('a').add(aListener);
        world.entityAdded('b').add(bListener);

        var entity = new CES.Entity();
        entity.addComponent(new CompA());
        world.addEntity(entity);

        aListener.calledOnce.should.be.true;
        bListener.calledOnce.should.be.false;
    });

    it('should emit signal when entity with two components is added', function() {
        var world = new CES.World();

        var aListener = sinon.spy();
        var abListener = sinon.spy();
        var cListener = sinon.spy();

        world.entityAdded('a').add(aListener);
        world.entityAdded('a', 'b').add(abListener);
        world.entityAdded('c').add(abListener);

        var entity = new CES.Entity();
        entity.addComponent(new CompA());
        entity.addComponent(new CompB());
        world.addEntity(entity);

        aListener.calledOnce.should.be.true;
        abListener.calledOnce.should.be.true;
        cListener.calledOnce.should.be.false;
    });

    it('should emit signal when entity is removed', function() {
        var world = new CES.World();

        var aListener = sinon.spy();
        var bListener = sinon.spy();
        world.entityRemoved('a').add(aListener);
        world.entityRemoved('b').add(bListener);

        var entity = new CES.Entity();
        entity.addComponent(new CompA());
        world.addEntity(entity);

        aListener.calledOnce.should.be.false;
        bListener.calledOnce.should.be.false;

        world.removeEntity(entity);

        aListener.calledOnce.should.be.true;
        bListener.calledOnce.should.be.false;
    });

    it('should emit signal when entity has component added', function() {
        var world = new CES.World();

        var abListener = sinon.spy();
        var bListener = sinon.spy();
        world.entityAdded('a', 'b').add(abListener);

        var entity = new CES.Entity();
        entity.addComponent(new CompA());
        world.addEntity(entity);

        abListener.calledOnce.should.be.false;

        entity.addComponent(new CompB());

        abListener.calledOnce.should.be.true;
    });

    it('should emit signal when entity has component removed', function() {
        var world = new CES.World();

        var abListener = sinon.spy();
        var bListener = sinon.spy();
        world.entityRemoved('a', 'b').add(abListener);

        var entity = new CES.Entity();
        entity.addComponent(new CompA());
        entity.addComponent(new CompB());
        world.addEntity(entity);

        abListener.calledOnce.should.be.false;

        entity.removeComponent('b');

        abListener.calledOnce.should.be.true;
    });

    describe('with system', function() {
        it('addToWorld should be called when system is added', function() {
            var world = new CES.World();
            var system = new CES.System();
            var addedToWorld = sinon.spy(system, 'addedToWorld');

            world.addSystem(system);

            addedToWorld.calledOnce.should.be.true;
        });

        it('addToWorld should be called when system is removed', function() {
            var world = new CES.World();
            var system = new CES.System();
            var removedFromWorld = sinon.spy(system, 'removedFromWorld');

            world.addSystem(system);

            removedFromWorld.calledOnce.should.be.false;

            world.removeSystem(system);

            removedFromWorld.calledOnce.should.be.true;
         });
    })
});
