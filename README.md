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

An entity is simply a container of the components.

```js
var hero = new CES.Entity();
hero.addComponent(new Position(0, 0));
hero.addComponent(new Velocity(0, 0));
hero.addComponent(new Health(100));
```

A system will get from the world the entities having one or more components,
and update the components accordingly.

```js
var PhysicSystem = CES.System.extend({
    update: function (dt) {
        var nodes, entities, position, velocity;

        entities = this.world.getEntities('position', 'velocity');

        entities.forEach(function (entity) {
            position = entity.getComponent('position');
            velocity = entity.getComponent('velocity');
            position.x += velocity.x * dt;
            position.y += velocity.y * dt;
        });
    }
});
world.addSystem(new MovementSystem());
```

The world is the container of all the entities and systems.
Calling the `update` method will sequentially update all systems.

```js
var world = new CES.World();

world.addEntity(hero);
// ... add other entities

world.addSystem(PhysicSystem);
// ... add other systems

requestAnimationFrame(function () {
    world.update(/* interval */);
})
```

Installation (Browser)
-------

Download the [minified js file](http://qiao.github.com/ces.js/lib/ces-browser.min.js) and include it in your web page.

```html
<script type="text/javascript" src="./ces-browser.min.js"></script>
```

Now skip to the `Basic Usage` section of this readme.

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
