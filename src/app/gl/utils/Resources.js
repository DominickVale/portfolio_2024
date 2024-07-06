import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { TinyEmitter } from 'tiny-emitter';
import { Howl } from 'howler';

export default class Resources extends TinyEmitter {
  constructor(sources) {
    super();
    this.sources = sources;
    this.items = {};
    this.toLoad = this.sources.length;
    this.loaded = 0;
    this.isReady = false;
    this.setLoaders();
    this.startLoading();
  }

  setLoaders() {
    this.loaders = {
      gltfLoader: new GLTFLoader(),
      textureLoader: new THREE.TextureLoader(),
      cubeTextureLoader: new THREE.CubeTextureLoader(),
      // We don't need AudioLoader anymore as we'll use Howler
    };
  }

  startLoading() {
    for (const source of this.sources) {
      if (source.type === 'gltfModel') {
        this.loaders.gltfLoader.load(source.path, (file) => {
          this.sourceLoaded(source, file);
        });
      } else if (source.type === 'texture') {
        this.loaders.textureLoader.load(source.path, (file) => {
          this.sourceLoaded(source, file);
        });
      } else if (source.type === 'cubeTexture') {
        this.loaders.cubeTextureLoader.load(source.path, (file) => {
          this.sourceLoaded(source, file);
        });
      } else if (source.type === 'audio') {
        const sound = new Howl({
          src: [source.path],
          preload: true,
          onload: () => {
            this.sourceLoaded(source, sound);
          },
          onloaderror: (id, error) => {
            console.error(`Error loading audio ${source.name}:`, error);
            this.sourceLoaded(source, null); // Count as loaded even if there's an error
          }
        });
      } else {
        throw new Error(`Unknown resource type: ${source.type}`);
      }
    }
  }

  sourceLoaded(source, file) {
    this.items[source.name] = {
      file,
      ...source
    };
    this.loaded++;
    if (this.loaded === this.toLoad) {
      this.emit('ready');
      this.isReady = true;
    }
  }
}
