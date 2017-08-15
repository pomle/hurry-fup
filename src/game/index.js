import THREE from 'three';
import { Game, Entity, Scene, Tween } from '@snakesilk/engine';
import { Jump, Physics, Solid } from '@snakesilk/platform-traits';

Physics.prototype.__obstruct = function alternativePhysicsObstruct(object, attack) {
  switch (attack) {
  case object.SURFACE_TOP:
  case object.SURFACE_BOTTOM:
    this.velocity.y = object.velocity.y;
    break;
  case object.SURFACE_LEFT:
  case object.SURFACE_RIGHT:
    this.velocity.x = object.velocity.x;
    break;
  }
}

const ALIVE = 1;
const DEAD = 0;

const Y_MOVEMENT_FUDGE = 200;
const SCATTER = 100;
const SPACING = 500;
const OUTOFBOUNDS = -1000;
const ACCELERATION = 2;

function createPlayer() {
  const player = new Entity();
  player.aim.x = 1;

  player.applyTrait(new Physics());

  player.applyTrait(new Jump());
  player.jump.force.y = 1000;

  player.applyTrait(new Solid());

  player.physics.area = 0;
  player.physics.mass = 1;
  player.setModel(
    new THREE.Mesh(
      new THREE.PlaneGeometry(100, 100),
      new THREE.MeshBasicMaterial({
        color: '#' + Math.random().toString(16).substr(-6),
        wireframe: true,
      })));
  player.addCollisionRect(100, 100);
  return player;
}

function createGround(w, h, x = 0, y = 0) {
  const ground = new Entity();
  ground.setModel(
    new THREE.Mesh(
      new THREE.PlaneGeometry(w, h),
      new THREE.MeshBasicMaterial({
        color: '#f00',
        wireframe: true,
      })));
  ground.addCollisionRect(w, h);
  ground.applyTrait(new Solid());
  ground.solid.fixed = true;
  ground.solid.obstructs = true;
  ground.position.x = x;
  ground.position.y = y;
  return ground;
}

export function createGame() {
  const players = new Set();

  const game = new Game();
  const scene = new Scene();

  const grounds = [
    createGround(SPACING, 100),
    createGround(SPACING, 100),
  ];

  grounds.forEach(g => scene.world.addObject(g));
  game.setScene(scene);

  function reset() {
    players.forEach(instance => {
      const {player} = instance;

      const rX = Math.random() * SCATTER;
      const rY = Math.random() * SCATTER;

      player.position.x = 0;
      player.position.y = 0;
      player.physics.zero();
      player.physics.velocity.x = rX;
      player.physics.velocity.y = rY;
      instance.state = ALIVE;
    });

    grounds[0].position.x = SPACING / 2;
    grounds[0].position.y = -500;
    grounds[1].position.x = grounds[0].position.x + SPACING;
    grounds[1].position.y = -300;
  }
  reset();

  let leader = null;
  function onUpdate() {
    if (players.size === 0) {
      return;
    }

    leader = null;

    players.forEach((instance) => {
      const {player} = instance;

      if (instance.state === DEAD) {
        return;
      }

      player.physics.velocity.x += ACCELERATION;

      if (!leader || player.position.x > leader.position.x) {
        leader = player;
      }

      if (player.position.y < OUTOFBOUNDS) {
        instance.state = DEAD;
      }
    });

    if (!leader) {
      reset();
      return;
    }

    scene.camera.follow(leader);
    scene.camera.followOffset.x = 800;
    scene.camera.position.z = 1000;

    const c = leader.collision[0];
    grounds.forEach(ground => {
      const g = ground.collision[0];
      if (g.right < c.left) {
        const tween = new Tween({
          y: g.y + (Math.random() * Y_MOVEMENT_FUDGE) - Y_MOVEMENT_FUDGE / 2,
          left: c.x + SPACING + leader.velocity.x,
        });
        tween.addSubject(g);
        ground.doFor(.2, (elapsed, progress) => {
          tween.update(progress);
        });
      }
    });
  }

  scene.events.bind(scene.EVENT_UPDATE_TIME, onUpdate);

  const KEYS = new Map();
  function handleKeyboard(event) {
    const {type, keyCode} = event;
    const state = type === 'keydown' ? 1 : 0;

    if (!KEYS.has(keyCode)) {
      const player = createPlayer();
      if (leader) {
        player.position.copy(leader.position);
        player.physics.velocity.copy(leader.physics.velocity);
      }

      KEYS.set(keyCode, {
        player,
        lastInput: Date.now(),
      });

      players.add({
        player,
        state: ALIVE,
      });

      scene.world.addObject(player);
    }

    const keyBinding = KEYS.get(keyCode);
    if (state) {
      keyBinding.player.jump.engage();
    } else {
      keyBinding.player.jump.cancel();
    }
    keyBinding.lastInput = Date.now();
  }

  window.addEventListener('keydown', handleKeyboard);
  window.addEventListener('keyup', handleKeyboard);

  return {
    game,
    players,
  };
}
