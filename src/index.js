import * as pixi from 'pixi.js';
import domready from 'domready';
import raf from 'raf';

let stage = new pixi.Stage(0x66FF99);
let renderer = new pixi.WebGLRenderer(400, 300);//autoDetectRenderer(400, 300);

let texture = pixi.Texture.fromImage("bunny.png");
let bunny = new pixi.Sprite(texture);

bunny.anchor.x = 0.5;
bunny.anchor.y = 0.5;

bunny.position.x = 200;
bunny.position.y = 150;

stage.addChild(bunny);

domready(init);

function init() {
  document.body.appendChild(renderer.view);
  raf(function tick() {
    bunny.rotation += 0.1;
    renderer.render(stage);
    raf(tick);
  });
}
