CES.js
==============

CES.js is a lightweight Component-Entity-System framework for JavaScript games.


Basic Usage
-----------


To define a new component, simply extend `CES.Component`. 
Note that each component should have a unique `name` property.

```js
var Position = CES.Component.extend({
    name: 'position',
    init: function (x, y) {
        this.x = x;
        this.y = y;
    }
});

var Velocity = CES.Component.extend({
    name: 'velocity',
    init: function (x, y) {
        this.x = x;
        this.y = y;
    }
});

var Health = CES.Component.extend({
    name: 'health',
    init: function (maxHealth) {
        this.health = this.maxHealth = maxHealth;
    },
    isDead: function () {
        return this.health <= 0;
    },
    receiveDamage: function (damage) {
        this.health -= damage;
    }
});
```

An entity is essentially a container of one or more components.

```js
var hero = new CES.Entity();
hero.addComponent(new Position(0, 0));
hero.addComponent(new Velocity(0, 0));
hero.addComponent(new Health(100));
```

The system is responsible for updating the entities.
In a real game there may be a lot of systems, like `CollisionSystem`,
`RenderSystem`, `ControlSystem` etc.

```js
var PhysicSystem = CES.System.extend({
    update: function (dt) {
        var entities, position, velocity;

        entities = this.world.getEntities('position', 'velocity');

        entities.forEach(function (entity) {
            position = entity.getComponent('position');
            velocity = entity.getComponent('velocity');
            position.x += velocity.x * dt;
            position.y += velocity.y * dt;
        });
    }
});
```

The world is the container of all the entities and systems.
Calling the `update` method will *sequentially* update all the systems,
in the order they were added.

```js
var world = new CES.World();

world.addEntity(hero);
// ... add other entities

world.addSystem(new PhysicSystem());
// ... add other systems

requestAnimationFrame(function () {
    world.update(/* interval */);
})
```

A system is notified when it is added or removed from the world:

```js
var MySystem = CES.System.extend({
  addedToWorld: function(world)  {
    // Code to handle being added to world. Remeber to call this._super.
    this._super(world);
  },
  removedFromWorld: function(world) {
    // Code to handle being removed from world.
    this._super(world);
  }
});
```

The world emits signals when entities are added or removed. You can listen for
specific entities and handle the signal accordingly:

```js
var MySystem = CES.System.extend({
  addedToWorld: function(world) {
    world.entityAdded('position', 'velocity').add(function(entity) {
      // This function is called whenever an entity with both 'position' and
      // 'velocity' components is added to the world. It can also be called when
      // a component is added to an entity; for example, when an entity with
      // only 'position' has 'velocity' added to it.
    });
    world.entityRemoved('position', 'velocity').add(function(entity) {
      // This function is called whenever an entity with both 'position' and
      // 'velocity' components is removed from the world. It can also be called 
      // when a component is removed from an entity; for example, when an entity
      // with both 'position' and 'velocity' has 'velocity' removed from it.
    });
  }
});
```

Installation (Browser)
-------

Download the [minified js file](http://github.com/qiao/ces.js/raw/master/dist/ces-browser.min.js) and include it in your web page.

```html
<script type="text/javascript" src="./ces-browser.min.js"></script>
```

Installation (Node.js)
------

If you want to use it in Node.js, you may install it via `npm`.

```bash
npm install ces
```

Then, in your program:

```javascript
var CES = require('ces');
```


Development
------------

Layout:

    .
    |-- dist         # browser distribution
    |-- src          # source code
    `-- test         # test scripts

You will need to install `node.js` and use `npm` to install the dependencies: 

    npm install -d 

To build the browser distribution 
(It will use [node-browserify](https://github.com/substack/node-browserify) to generate a browser distribution,
and use [UglifyJS](https://github.com/mishoo/UglifyJS) to compress):

    make

To run the tests with
[mocha](http://visionmedia.github.com/mocha/) and [should.js](https://github.com/visionmedia/should.js) 

    make test

License
-------

[MIT License](http://www.opensource.org/licenses/mit-license.php)

Copyright 2013 Xueqiao Xu &lt;xueqiaoxu@gmail.com&gt;

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
