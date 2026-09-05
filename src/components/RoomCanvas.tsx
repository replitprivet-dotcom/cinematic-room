import React, { useCallback, useEffect, useRef } from 'react';
import * as THREE from 'three';
import { InteractionTarget, LightingMode, TVChannel } from '../types';
import { createWoodFloorTexture, createRugTexture, createSlatWallTexture } from '../utils/textures';
import { playFootstep } from '../utils/audio';

interface RoomCanvasProps {
  lightingMode: LightingMode;
  isSitting: boolean;
  tvPower: boolean;
  activeChannel: TVChannel;
  alarmActive: boolean;
  videoRef: React.RefObject<HTMLVideoElement | null>;
  onTargetChange: (target: InteractionTarget) => void;
  onInteract: () => void;
}

const ROOM = { width: 12, depth: 9.5, height: 5.4 };
const STANDING_HEIGHT = 1.68;
const SITTING_HEIGHT = 1.12;
const SITTING_POS = new THREE.Vector3(0.0, SITTING_HEIGHT, 1.1);

function createMat(color: number, roughness = 0.75, metalness = 0.05, map?: THREE.Texture | null) {
  const mat = new THREE.MeshStandardMaterial({
    color,
    roughness,
    metalness,
  });
  if (map) {
    mat.map = map;
    mat.needsUpdate = true;
  }
  return mat;
}

function addBox(
  scene: THREE.Scene,
  size: [number, number, number],
  pos: [number, number, number],
  mat: THREE.Material,
  interaction?: InteractionTarget,
  castShadow = true,
  receiveShadow = true
): THREE.Mesh {
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(...size), mat);
  mesh.position.set(...pos);
  mesh.castShadow = castShadow;
  mesh.receiveShadow = receiveShadow;
  if (interaction) {
    mesh.userData.interaction = interaction;
  }
  scene.add(mesh);
  return mesh;
}

export const RoomCanvas: React.FC<RoomCanvasProps> = ({
  lightingMode,
  isSitting,
  tvPower,
  activeChannel,
  alarmActive,
  videoRef,
  onTargetChange,
  onInteract,
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const joystickRef = useRef({ x: 0, y: 0, active: false });
  const joystickKnobRef = useRef<HTMLDivElement>(null);
  const keysRef = useRef(new Set<string>());
  const yawRef = useRef(0);
  const pitchRef = useRef(-0.04);
  const positionRef = useRef(new THREE.Vector3(-0.8, STANDING_HEIGHT, 3.2));
  const jumpVelocityRef = useRef(0);
  const isGroundedRef = useRef(true);
  const targetRef = useRef<InteractionTarget>(null);
  const dragRef = useRef({ active: false, x: 0, y: 0, moved: false, id: -1 });

  const setTarget = useCallback(
    (target: InteractionTarget) => {
      if (targetRef.current !== target) {
        targetRef.current = target;
        onTargetChange(target);
      }
    },
    [onTargetChange]
  );

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    // SCENE SETUP
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0e0b0d);
    scene.fog = new THREE.Fog(0x0e0b0d, 8, 22);

    const camera = new THREE.PerspectiveCamera(65, mount.clientWidth / mount.clientHeight, 0.08, 40);
    camera.rotation.order = 'YXZ';
    camera.position.copy(positionRef.current);

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
    } catch {
      return;
    }

    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(mount.clientWidth, mount.clientHeight);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.25;
    renderer.domElement.className = 'w-full h-full block touch-none cursor-grab active:cursor-grabbing';
    mount.appendChild(renderer.domElement);

    // TEXTURES
    const woodFloorTexture = createWoodFloorTexture();
    const rugTexture = createRugTexture();
    const slatWallTexture = createSlatWallTexture();

    // MATERIALS
    const floorMat = createMat(0xffffff, 0.55, 0.15, woodFloorTexture);
    const ceilingMat = createMat(0x131114, 0.95, 0.0);
    const wallSideMat = createMat(0x1d171d, 0.9, 0.02);
    const backWallMat = createMat(0x181217, 0.92, 0.02);
    const slatMat = createMat(0xffffff, 0.85, 0.05, slatWallTexture);
    const trimMat = createMat(0x282029, 0.65, 0.2);
    const rugMat = createMat(0xffffff, 0.96, 0.02, rugTexture);
    const sofaMat = createMat(0x382a44, 0.92, 0.02);
    const sofaCushionMat = createMat(0x453453, 0.94, 0.01);
    const pillowMat = createMat(0x6b4f7a, 0.9, 0.02);
    const tableMat = createMat(0x221a22, 0.5, 0.35);
    const metalMat = createMat(0x111012, 0.4, 0.7);
    const glassMat = new THREE.MeshPhysicalMaterial({
      color: 0x222228,
      metalness: 0.1,
      roughness: 0.1,
      transmission: 0.6,
      thickness: 0.5,
    });

    // ARCHITECTURE - WALLS, FLOOR & CEILING
    // Floor
    addBox(scene, [ROOM.width, 0.2, ROOM.depth], [0, -0.1, 0], floorMat);
    // Ceiling
    addBox(scene, [ROOM.width, 0.2, ROOM.depth], [0, ROOM.height + 0.1, 0], ceilingMat);
    // Back Wall (Behind TV)
    addBox(scene, [ROOM.width, ROOM.height, 0.2], [0, ROOM.height / 2, -ROOM.depth / 2], backWallMat);
    // Slat Acoustic Center Panel behind TV
    addBox(scene, [6.5, ROOM.height - 0.2, 0.06], [0, ROOM.height / 2, -ROOM.depth / 2 + 0.11], slatMat);
    // Front Wall
    addBox(scene, [ROOM.width, ROOM.height, 0.2], [0, ROOM.height / 2, ROOM.depth / 2], wallSideMat);
    // Left Wall
    addBox(scene, [0.2, ROOM.height, ROOM.depth], [-ROOM.width / 2, ROOM.height / 2, 0], wallSideMat);
    // Right Wall
    addBox(scene, [0.2, ROOM.height, ROOM.depth], [ROOM.width / 2, ROOM.height / 2, 0], wallSideMat);

    // Baseboards and Crown Moldings
    addBox(scene, [ROOM.width, 0.18, 0.08], [0, 0.09, -ROOM.depth / 2 + 0.14], trimMat);
    addBox(scene, [ROOM.width, 0.14, 0.08], [0, ROOM.height - 0.07, -ROOM.depth / 2 + 0.14], trimMat);
    addBox(scene, [0.08, 0.18, ROOM.depth], [-ROOM.width / 2 + 0.14, 0.09, 0], trimMat);
    addBox(scene, [0.08, 0.18, ROOM.depth], [ROOM.width / 2 - 0.14, 0.09, 0], trimMat);

    // Large Plush Rug
    addBox(scene, [8.2, 0.04, 5.2], [0, 0.02, 0.6], rugMat);

    // 85-INCH CINEMATIC TV SETUP
    const tvGroup = new THREE.Group();
    // Wall mount bracket & Frame
    const frameMesh = new THREE.Mesh(
      new THREE.BoxGeometry(4.8, 2.8, 0.12),
      createMat(0x1a161b, 0.45, 0.7)
    );
    frameMesh.position.set(0, 2.8, -ROOM.depth / 2 + 0.2);
    frameMesh.castShadow = true;
    frameMesh.userData.interaction = 'tv';
    scene.add(frameMesh);

    // TV Screen Plane
    let videoTexture: THREE.VideoTexture | null = null;
    let tvScreenMat: THREE.MeshBasicMaterial | THREE.MeshStandardMaterial;

    if (videoRef.current) {
      videoTexture = new THREE.VideoTexture(videoRef.current);
      videoTexture.minFilter = THREE.LinearFilter;
      videoTexture.magFilter = THREE.LinearFilter;
      videoTexture.colorSpace = THREE.SRGBColorSpace;
      tvScreenMat = new THREE.MeshBasicMaterial({
        map: videoTexture,
        color: tvPower ? 0xffffff : 0x050507,
      });
    } else {
      tvScreenMat = new THREE.MeshStandardMaterial({
        color: tvPower ? 0x111116 : 0x020204,
        roughness: 0.15,
        metalness: 0.2,
      });
    }

    const screenMesh = new THREE.Mesh(new THREE.PlaneGeometry(4.56, 2.56), tvScreenMat);
    screenMesh.position.set(0, 2.8, -ROOM.depth / 2 + 0.27);
    screenMesh.userData.interaction = 'tv';
    scene.add(screenMesh);

    // TV Ambilight / Backlight PointLights behind the TV
    const tvBacklight = new THREE.PointLight(activeChannel.ambientColor, 2.2, 7.5, 1.8);
    tvBacklight.position.set(0, 2.8, -ROOM.depth / 2 + 0.15);
    scene.add(tvBacklight);

    // Slim Soundbar / Media Console underneath
    const consoleMat = createMat(0x1c171e, 0.6, 0.4);
    addBox(scene, [5.2, 0.45, 0.9], [0, 0.25, -ROOM.depth / 2 + 0.7], consoleMat);
    // Soundbar on top of console
    const soundbarMat = createMat(0x110f13, 0.7, 0.5);
    addBox(scene, [3.2, 0.14, 0.22], [0, 0.55, -ROOM.depth / 2 + 0.7], soundbarMat, 'speakers');
    // Soundbar status LED
    const ledMat = new THREE.MeshBasicMaterial({ color: tvPower ? 0x00ff88 : 0xff3333 });
    const ledMesh = new THREE.Mesh(new THREE.SphereGeometry(0.018, 12, 12), ledMat);
    ledMesh.position.set(0, 0.55, -ROOM.depth / 2 + 0.82);
    scene.add(ledMesh);

    // Left & Right Tower Speakers
    [-2.8, 2.8].forEach((x) => {
      // Main speaker column
      addBox(scene, [0.42, 1.7, 0.45], [x, 0.85, -ROOM.depth / 2 + 0.6], soundbarMat, 'speakers');
      // Brass accent ring / cone
      const cone = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 0.02, 24), createMat(0xb89255, 0.3, 0.85));
      cone.rotation.x = Math.PI / 2;
      cone.position.set(x, 1.25, -ROOM.depth / 2 + 0.84);
      scene.add(cone);
    });

    // LUXURIOUS SECTIONAL COUCH / SOFA
    const sofaGroup = new THREE.Group();
    // Base platform
    addBox(scene, [5.2, 0.35, 1.8], [0, 0.2, 1.1], sofaMat, 'sofa');
    // Main Seat Cushions (3 sections)
    [-1.6, 0, 1.6].forEach((x) => {
      addBox(scene, [1.54, 0.32, 1.45], [x, 0.48, 1.0], sofaCushionMat, 'sofa');
    });
    // Backrest
    addBox(scene, [5.2, 0.85, 0.42], [0, 0.88, 1.85], sofaMat, 'sofa');
    // Left & Right Armrests
    addBox(scene, [0.46, 0.65, 1.8], [-2.45, 0.65, 1.1], sofaMat, 'sofa');
    addBox(scene, [0.46, 0.65, 1.8], [2.45, 0.65, 1.1], sofaMat, 'sofa');
    // Accent throw pillows
    const p1 = addBox(scene, [0.55, 0.55, 0.18], [-2.05, 0.72, 1.45], pillowMat, 'sofa');
    p1.rotation.y = 0.35;
    p1.rotation.z = -0.15;
    const p2 = addBox(scene, [0.55, 0.55, 0.18], [2.05, 0.72, 1.45], pillowMat, 'sofa');
    p2.rotation.y = -0.35;
    p2.rotation.z = 0.15;

    // MODERN COFFEE TABLE
    // Wooden / Smoked glass tabletop
    addBox(scene, [2.4, 0.08, 1.1], [0, 0.52, -0.6], tableMat);
    addBox(scene, [2.3, 0.02, 1.0], [0, 0.57, -0.6], glassMat);
    // Table Legs (4 sleek metal legs)
    [-1.05, 1.05].forEach((x) => {
      [-0.42, 0.42].forEach((z) => {
        addBox(scene, [0.07, 0.52, 0.07], [x, 0.26, -0.6 + z], metalMat);
      });
    });

    // TABLE ITEMS:
    // TV Remote Control
    const remote = addBox(scene, [0.18, 0.03, 0.45], [-0.4, 0.6, -0.55], createMat(0x1a181b, 0.4, 0.6), 'remote');
    remote.rotation.y = 0.28;
    // Remote mini buttons
    addBox(scene, [0.08, 0.01, 0.08], [-0.4, 0.62, -0.68], new THREE.MeshBasicMaterial({ color: 0xff3344 }), 'remote');
    addBox(scene, [0.08, 0.01, 0.08], [-0.4, 0.62, -0.55], new THREE.MeshBasicMaterial({ color: 0x00d4ff }), 'remote');

    // Popcorn Bowl
    const bowl = new THREE.Mesh(
      new THREE.CylinderGeometry(0.24, 0.16, 0.22, 24),
      createMat(0xee3333, 0.5, 0.1)
    );
    bowl.position.set(0.45, 0.68, -0.6);
    bowl.castShadow = true;
    scene.add(bowl);
    // Popcorn mound inside
    const popcorn = new THREE.Mesh(
      new THREE.SphereGeometry(0.22, 16, 12),
      createMat(0xf7e9a8, 0.9, 0.0)
    );
    popcorn.scale.set(1, 0.65, 1);
    popcorn.position.set(0.45, 0.77, -0.6);
    scene.add(popcorn);

    // Soda Cup with Straw
    const cup = new THREE.Mesh(
      new THREE.CylinderGeometry(0.1, 0.08, 0.28, 20),
      createMat(0x282030, 0.3, 0.2)
    );
    cup.position.set(0.05, 0.71, -0.75);
    cup.castShadow = true;
    scene.add(cup);
    const straw = new THREE.Mesh(
      new THREE.CylinderGeometry(0.01, 0.01, 0.28, 8),
      new THREE.MeshBasicMaterial({ color: 0xffaa00 })
    );
    straw.rotation.z = 0.25;
    straw.position.set(0.07, 0.86, -0.75);
    scene.add(straw);

    // WALL SWITCH ON LEFT WALL
    const switchPlate = addBox(
      scene,
      [0.05, 0.65, 0.9],
      [-ROOM.width / 2 + 0.12, 1.9, -1.2],
      createMat(0x352e38, 0.7, 0.2),
      'switch'
    );
    // Switch Rockers
    [-0.24, 0, 0.24].forEach((z, idx) => {
      const rocker = addBox(
        scene,
        [0.04, 0.3, 0.12],
        [-ROOM.width / 2 + 0.15, 1.9, -1.2 + z],
        createMat(0xddccb5, 0.5, 0.2),
        'switch'
      );
      rocker.rotation.z = idx === 1 ? -0.12 : 0.12;
    });

    // EMERGENCY ALARM BEACON ON RIGHT WALL
    const alarmBase = new THREE.Mesh(
      new THREE.CylinderGeometry(0.2, 0.2, 0.08, 24),
      createMat(0x281215, 0.5, 0.5)
    );
    alarmBase.rotation.z = Math.PI / 2;
    alarmBase.position.set(ROOM.width / 2 - 0.12, 2.2, -0.5);
    alarmBase.userData.interaction = 'alarm';
    scene.add(alarmBase);

    const alarmDomeMat = new THREE.MeshStandardMaterial({
      color: 0xff1122,
      emissive: 0xaa0511,
      emissiveIntensity: alarmActive ? 2.5 : 0.4,
      roughness: 0.2,
      metalness: 0.1,
    });
    const alarmDome = new THREE.Mesh(new THREE.SphereGeometry(0.14, 20, 16), alarmDomeMat);
    alarmDome.position.set(ROOM.width / 2 - 0.16, 2.2, -0.5);
    alarmDome.userData.interaction = 'alarm';
    scene.add(alarmDome);

    const alarmLight = new THREE.PointLight(0xff0022, 0, 10, 2);
    alarmLight.position.set(ROOM.width / 2 - 0.3, 2.2, -0.5);
    scene.add(alarmLight);

    // CEILING SPOTLIGHT FIXTURES & LIGHTS
    const ambientLight = new THREE.AmbientLight(0x5a4855, 0.5);
    scene.add(ambientLight);

    const hemiLight = new THREE.HemisphereLight(0x7e6676, 0x1f1715, 0.45);
    scene.add(hemiLight);

    const ceilingSpots: THREE.SpotLight[] = [];
    const ceilingLenses: THREE.MeshStandardMaterial[] = [];

    const fixturePositions: [number, number, number][] = [
      [-3.5, ROOM.height - 0.05, -2.4],
      [0, ROOM.height - 0.05, -2.4],
      [3.5, ROOM.height - 0.05, -2.4],
      [-2.2, ROOM.height - 0.05, 1.2],
      [2.2, ROOM.height - 0.05, 1.2],
    ];

    fixturePositions.forEach(([x, y, z], idx) => {
      // Metallic recessed rim
      const rim = new THREE.Mesh(
        new THREE.TorusGeometry(0.2, 0.035, 16, 32),
        createMat(0x2a242c, 0.4, 0.8)
      );
      rim.rotation.x = Math.PI / 2;
      rim.position.set(x, y, z);
      scene.add(rim);

      // Glowing lens
      const lensMat = new THREE.MeshStandardMaterial({
        color: 0xffedd0,
        emissive: 0xffca7a,
        emissiveIntensity: 1.5,
        roughness: 0.3,
      });
      ceilingLenses.push(lensMat);
      const lens = new THREE.Mesh(new THREE.CircleGeometry(0.18, 32), lensMat);
      lens.rotation.x = Math.PI / 2;
      lens.position.set(x, y - 0.01, z);
      scene.add(lens);

      // Downward spot
      const spot = new THREE.SpotLight(0xffdfa8, 2.8, 8.5, Math.PI / 4.2, 0.45, 1.5);
      spot.position.set(x, y - 0.05, z);
      spot.target.position.set(x * 0.5, 0, z > 0 ? 0.6 : -1.5);
      spot.castShadow = idx === 1 || idx === 3;
      if (spot.castShadow) {
        spot.shadow.mapSize.set(1024, 1024);
        spot.shadow.bias = -0.0008;
      }
      scene.add(spot);
      scene.add(spot.target);
      ceilingSpots.push(spot);
    });

    // COLLIDERS FOR FIRST-PERSON PLAYER
    const furnitureColliders = [
      // Sofa bounding box
      new THREE.Box3(new THREE.Vector3(-2.8, 0, 0.1), new THREE.Vector3(2.8, 1.8, 2.2)),
      // Coffee table bounding box
      new THREE.Box3(new THREE.Vector3(-1.3, 0, -1.25), new THREE.Vector3(1.3, 0.8, -0.05)),
      // TV Media Console
      new THREE.Box3(new THREE.Vector3(-3.2, 0, -ROOM.depth / 2), new THREE.Vector3(3.2, 1.2, -ROOM.depth / 2 + 1.2)),
    ];

    const canMoveTo = (x: number, z: number): boolean => {
      const margin = 0.36;
      // Room perimeter
      if (
        x < -ROOM.width / 2 + margin ||
        x > ROOM.width / 2 - margin ||
        z < -ROOM.depth / 2 + margin ||
        z > ROOM.depth / 2 - margin
      ) {
        return false;
      }
      // Furniture check
      const point = new THREE.Vector3(x, 0.8, z);
      for (const box of furnitureColliders) {
        if (box.clone().expandByScalar(margin).containsPoint(point)) {
          return false;
        }
      }
      return true;
    };

    // RAYCASTING FOR INTERACTION
    const raycaster = new THREE.Raycaster();
    const centerVec = new THREE.Vector2(0, 0);

    const checkInteraction = () => {
      raycaster.setFromCamera(centerVec, camera);
      const intersects = raycaster.intersectObjects(scene.children, true);
      const hit = intersects.find((entry) => {
        let cur: THREE.Object3D | null = entry.object;
        while (cur) {
          if (cur.userData.interaction) return true;
          cur = cur.parent;
        }
        return false;
      });

      if (!hit) {
        setTarget(null);
        return;
      }

      let cur: THREE.Object3D | null = hit.object;
      let targetFound: InteractionTarget = null;
      while (cur) {
        if (cur.userData.interaction) {
          targetFound = cur.userData.interaction as InteractionTarget;
          break;
        }
        cur = cur.parent;
      }

      const dist = camera.position.distanceTo(hit.point);
      if (targetFound === 'tv') {
        if (dist > 5.5) {
          targetFound = null;
        } else if (dist > 3.8) {
          targetFound = 'tv-far';
        }
      } else if (targetFound === 'sofa' && dist > 3.6) {
        targetFound = null;
      } else if (targetFound === 'remote' && dist > 3.8) {
        targetFound = null;
      } else if (targetFound === 'switch' && dist > 3.8) {
        targetFound = null;
      } else if (targetFound === 'alarm' && dist > 3.5) {
        targetFound = null;
      } else if (targetFound === 'speakers' && dist > 4.2) {
        targetFound = null;
      }

      setTarget(targetFound);
    };

    // RENDER / ANIMATION LOOP
    const clock = new THREE.Clock();
    let animId: number;
    let alarmCycle = 0;
    let stepTimer = 0;

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const delta = Math.min(clock.getDelta(), 0.05);

      // Light modes handling
      let targetIntensity = 1.0;
      let targetColor = 0xffdfa8;
      let targetEmissive = 1.5;

      if (lightingMode === 'cinema') {
        targetIntensity = 0.25;
        targetEmissive = 0.35;
        targetColor = 0xffa055;
      } else if (lightingMode === 'neon') {
        targetIntensity = 0.4;
        targetEmissive = 0.7;
        targetColor = 0x8855ff;
      } else if (lightingMode === 'off') {
        targetIntensity = 0.03;
        targetEmissive = 0.05;
      }

      ceilingSpots.forEach((spot) => {
        spot.intensity = THREE.MathUtils.lerp(spot.intensity, targetIntensity * 2.8, delta * 4);
        spot.color.setHex(targetColor);
      });
      ceilingLenses.forEach((lens) => {
        lens.emissiveIntensity = THREE.MathUtils.lerp(lens.emissiveIntensity, targetEmissive, delta * 4);
      });

      // Update TV Backlight & Screen
      const tvColor = tvPower ? activeChannel.ambientColor : 0x000000;
      tvBacklight.color.setHex(tvColor);
      tvBacklight.intensity = tvPower
        ? lightingMode === 'cinema' || lightingMode === 'off'
          ? 3.8
          : 2.2
        : 0;

      if (tvScreenMat instanceof THREE.MeshBasicMaterial) {
        tvScreenMat.color.setHex(tvPower ? 0xffffff : 0x030305);
      }

      // Alarm flashing effect
      if (alarmActive) {
        alarmCycle += delta * 6;
        const flash = Math.sin(alarmCycle) > 0 ? 1 : 0;
        alarmDomeMat.emissiveIntensity = flash ? 3.5 : 0.2;
        alarmLight.intensity = flash * 4.5;
      } else {
        alarmDomeMat.emissiveIntensity = 0.35;
        alarmLight.intensity = 0;
      }

      // Sitting camera lerp
      if (isSitting) {
        positionRef.current.lerp(SITTING_POS, delta * 3.5);
        // Look towards TV center
        yawRef.current = THREE.MathUtils.lerp(yawRef.current, 0, delta * 3.5);
        pitchRef.current = THREE.MathUtils.lerp(pitchRef.current, 0.05, delta * 3.5);
      } else {
        // Player Movement in First-Person
        const keys = keysRef.current;
        let forwardInput = 0;
        let sideInput = 0;

        if (keys.has('KeyW') || keys.has('ArrowUp')) forwardInput += 1;
        if (keys.has('KeyS') || keys.has('ArrowDown')) forwardInput -= 1;
        if (keys.has('KeyD') || keys.has('ArrowRight')) sideInput += 1;
        if (keys.has('KeyA') || keys.has('ArrowLeft')) sideInput -= 1;

        if (joystickRef.current.active) {
          forwardInput = -joystickRef.current.y;
          sideInput = joystickRef.current.x;
        }

        const moveSpeed = 3.2;
        if (forwardInput !== 0 || sideInput !== 0) {
          const forward = new THREE.Vector3(-Math.sin(yawRef.current), 0, -Math.cos(yawRef.current));
          const right = new THREE.Vector3(Math.cos(yawRef.current), 0, -Math.sin(yawRef.current));
          const moveDir = new THREE.Vector3()
            .addScaledVector(forward, forwardInput)
            .addScaledVector(right, sideInput);

          if (moveDir.lengthSq() > 1) moveDir.normalize();

          const newX = positionRef.current.x + moveDir.x * moveSpeed * delta;
          const newZ = positionRef.current.z + moveDir.z * moveSpeed * delta;

          // Axis separated collision check
          if (canMoveTo(newX, positionRef.current.z)) {
            positionRef.current.x = newX;
          }
          if (canMoveTo(positionRef.current.x, newZ)) {
            positionRef.current.z = newZ;
          }

          stepTimer += delta;
          if (stepTimer > 0.42 && isGroundedRef.current) {
            stepTimer = 0;
            playFootstep();
          }
        }

        // Jump & Gravity physics
        jumpVelocityRef.current -= 12.0 * delta;
        positionRef.current.y += jumpVelocityRef.current * delta;
        if (positionRef.current.y <= STANDING_HEIGHT) {
          positionRef.current.y = STANDING_HEIGHT;
          jumpVelocityRef.current = 0;
          isGroundedRef.current = true;
        } else {
          isGroundedRef.current = false;
        }
      }

      camera.position.copy(positionRef.current);
      camera.rotation.y = yawRef.current;
      camera.rotation.x = pitchRef.current;

      checkInteraction();
      renderer.render(scene, camera);
    };

    animId = requestAnimationFrame(animate);

    // RESIZE LISTENER
    const handleResize = () => {
      if (!mount) return;
      camera.aspect = mount.clientWidth / mount.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(mount.clientWidth, mount.clientHeight);
    };

    window.addEventListener('resize', handleResize);

    // KEYBOARD INPUTS
    const handleKeyDown = (e: KeyboardEvent) => {
      keysRef.current.add(e.code);
      if (['Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.code)) {
        e.preventDefault();
      }
      if (e.code === 'Space' && isGroundedRef.current && !isSitting) {
        jumpVelocityRef.current = 4.2;
        isGroundedRef.current = false;
      }
      if (e.code === 'KeyE' || e.code === 'Enter') {
        onInteract();
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      keysRef.current.delete(e.code);
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    // MOUSE / TOUCH LOOK AROUND
    const handleMouseMove = (e: MouseEvent) => {
      if (document.pointerLockElement === renderer.domElement) {
        yawRef.current -= e.movementX * 0.0022;
        pitchRef.current = THREE.MathUtils.clamp(pitchRef.current - e.movementY * 0.002, -1.35, 1.35);
      }
    };

    const handlePointerDown = (e: PointerEvent) => {
      // If clicking directly on desktop canvas, request pointer lock
      if (e.pointerType === 'mouse') {
        renderer.domElement.requestPointerLock?.();
      } else {
        dragRef.current = {
          active: true,
          x: e.clientX,
          y: e.clientY,
          moved: false,
          id: e.pointerId,
        };
        renderer.domElement.setPointerCapture(e.pointerId);
      }
    };

    const handlePointerMove = (e: PointerEvent) => {
      if (!dragRef.current.active || dragRef.current.id !== e.pointerId) return;
      const dx = e.clientX - dragRef.current.x;
      const dy = e.clientY - dragRef.current.y;
      dragRef.current.x = e.clientX;
      dragRef.current.y = e.clientY;

      if (Math.hypot(dx, dy) > 4) {
        dragRef.current.moved = true;
      }

      yawRef.current -= dx * 0.0065;
      pitchRef.current = THREE.MathUtils.clamp(pitchRef.current - dy * 0.0055, -1.35, 1.35);
    };

    const handlePointerUp = (e: PointerEvent) => {
      if (dragRef.current.active && dragRef.current.id === e.pointerId) {
        if (!dragRef.current.moved) {
          // A clean tap! Trigger interact
          onInteract();
        }
        dragRef.current.active = false;
      }
    };

    document.addEventListener('mousemove', handleMouseMove);
    renderer.domElement.addEventListener('pointerdown', handlePointerDown);
    renderer.domElement.addEventListener('pointermove', handlePointerMove);
    renderer.domElement.addEventListener('pointerup', handlePointerUp);
    renderer.domElement.addEventListener('pointercancel', handlePointerUp);

    // CUSTOM ACTION EVENTS (From mobile buttons)
    const handleTurnBack = () => {
      yawRef.current += Math.PI;
    };
    const handleJumpEvent = () => {
      if (isGroundedRef.current && !isSitting) {
        jumpVelocityRef.current = 4.2;
        isGroundedRef.current = false;
      }
    };

    window.addEventListener('room-turn-back', handleTurnBack);
    window.addEventListener('room-jump', handleJumpEvent);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      document.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('room-turn-back', handleTurnBack);
      window.removeEventListener('room-jump', handleJumpEvent);

      renderer.domElement.removeEventListener('pointerdown', handlePointerDown);
      renderer.domElement.removeEventListener('pointermove', handlePointerMove);
      renderer.domElement.removeEventListener('pointerup', handlePointerUp);
      renderer.domElement.removeEventListener('pointercancel', handlePointerUp);

      renderer.dispose();
      woodFloorTexture.dispose();
      rugTexture.dispose();
      slatWallTexture.dispose();
      mount.removeChild(renderer.domElement);
    };
  }, [lightingMode, isSitting, tvPower, activeChannel, alarmActive, onInteract, setTarget, videoRef]);

  // VIRTUAL JOYSTICK LOGIC FOR TOUCH
  const handleJoystickMove = (e: React.PointerEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (!joystickRef.current.active) {
      joystickRef.current.active = true;
      e.currentTarget.setPointerCapture(e.pointerId);
    }
    const rect = e.currentTarget.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const maxRadius = rect.width * 0.38;

    const rawX = e.clientX - centerX;
    const rawY = e.clientY - centerY;
    const dist = Math.min(maxRadius, Math.hypot(rawX, rawY));
    const angle = Math.atan2(rawY, rawX);

    const clampedX = Math.cos(angle) * dist;
    const clampedY = Math.sin(angle) * dist;

    joystickRef.current.x = clampedX / maxRadius;
    joystickRef.current.y = clampedY / maxRadius;

    if (joystickKnobRef.current) {
      joystickKnobRef.current.style.transform = `translate(${clampedX}px, ${clampedY}px)`;
    }
  };

  const handleJoystickEnd = (e: React.PointerEvent<HTMLDivElement>) => {
    joystickRef.current = { x: 0, y: 0, active: false };
    if (joystickKnobRef.current) {
      joystickKnobRef.current.style.transform = 'translate(0px, 0px)';
    }
  };

  return (
    <div ref={mountRef} className="relative w-full h-full select-none">
      {/* Touch Joystick on bottom left (visible on mobile / small screens) */}
      <div
        id="touch-joystick-pad"
        className="absolute left-6 bottom-8 sm:hidden z-20 w-32 h-32 rounded-full border border-white/20 bg-black/40 backdrop-blur-md shadow-2xl flex items-center justify-center touch-none"
        onPointerDown={handleJoystickMove}
        onPointerMove={(e) => joystickRef.current.active && handleJoystickMove(e)}
        onPointerUp={handleJoystickEnd}
        onPointerCancel={handleJoystickEnd}
        aria-label="Walk Joystick"
      >
        {/* Joystick inner indicator */}
        <div
          ref={joystickKnobRef}
          className="w-14 h-14 rounded-full border border-white/40 bg-white/25 shadow-inner pointer-events-none transition-transform duration-75 ease-out flex items-center justify-center text-white/50 text-[10px] tracking-widest font-mono uppercase"
        >
          MOVE
        </div>
      </div>
    </div>
  );
};
