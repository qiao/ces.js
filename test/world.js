/*globals describe: true, it: true */

var CES = require('../'),
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
});
