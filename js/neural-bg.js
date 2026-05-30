/**
 * Planetary Knowledge Graph Background — Three.js r128
 * Solar system orbits · Knowledge graph nodes · Depth parallax
 */
(function () {
  var canvas = document.getElementById('neural-canvas');
  if (!canvas) return;

  var W = function() { return window.innerWidth; };
  var H = function() { return window.innerHeight; };

  var renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: false, alpha: true, powerPreference: 'low-power' });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
  renderer.setSize(W(), H());
  renderer.setClearColor(0x000000, 0);

  var scene = new THREE.Scene();
  var camera = new THREE.PerspectiveCamera(55, W() / H(), 0.1, 1000);
  camera.position.set(0, 0, 48);

  var coreX = 16, coreY = -5, coreZ = -10;

  function makeOrbitRing(radius, color, opacity, tiltX, tiltZ, cx, cy, cz) {
    var pts = [];
    for (var i = 0; i <= 160; i++) {
      var a = (i / 160) * Math.PI * 2;
      pts.push(new THREE.Vector3(Math.cos(a) * radius, Math.sin(a) * radius, 0));
    }
    var geo = new THREE.BufferGeometry().setFromPoints(pts);
    var mat = new THREE.LineBasicMaterial({ color: color, transparent: true, opacity: opacity, blending: THREE.AdditiveBlending });
    var ring = new THREE.Line(geo, mat);
    ring.rotation.x = tiltX;
    ring.rotation.z = tiltZ;
    ring.position.set(cx, cy, cz);
    return ring;
  }

  scene.add(makeOrbitRing(13, 0x7c75f5, 0.07, 0.42, 0.15, coreX, coreY, coreZ));
  scene.add(makeOrbitRing(21, 0x26d4e8, 0.055, 0.60, -0.18, coreX, coreY, coreZ));
  scene.add(makeOrbitRing(31, 0x3bdc8f, 0.04, 0.32, 0.32, coreX, coreY, coreZ));

  var coreGeo = new THREE.SphereGeometry(1.1, 16, 16);
  var coreMat = new THREE.MeshBasicMaterial({ color: 0x9d98f7, transparent: true, opacity: 0.9 });
  var core = new THREE.Mesh(coreGeo, coreMat);
  core.position.set(coreX, coreY, coreZ);
  scene.add(core);

  var haloGeo = new THREE.SphereGeometry(2.4, 12, 12);
  var haloMat = new THREE.MeshBasicMaterial({ color: 0x7c75f5, transparent: true, opacity: 0.10 });
  var halo = new THREE.Mesh(haloGeo, haloMat);
  halo.position.copy(core.position);
  scene.add(halo);

  var isMobile = window.innerWidth < 768;

  var PLANET_DATA = [
    { color: 0x7c75f5, size: 0.55, orbitR: 12.5, tiltX: 0.42, speed: 0.00045, phase: 0.0  },
    { color: 0x26d4e8, size: 0.48, orbitR: 13.0, tiltX: 0.42, speed: 0.00038, phase: 2.1  },
    { color: 0x3bdc8f, size: 0.42, orbitR: 13.2, tiltX: 0.42, speed: 0.00052, phase: 4.2  },
    { color: 0x818cf8, size: 0.38, orbitR: 20.8, tiltX: 0.60, speed: 0.00028, phase: 1.1  },
    { color: 0xf59e0b, size: 0.35, orbitR: 21.0, tiltX: 0.60, speed: 0.00031, phase: 3.4  },
    { color: 0x26d4e8, size: 0.30, orbitR: 21.4, tiltX: 0.60, speed: 0.00035, phase: 5.2  },
    { color: 0x7c75f5, size: 0.26, orbitR: 30.5, tiltX: 0.32, speed: 0.00018, phase: 0.7  },
    { color: 0x3bdc8f, size: 0.22, orbitR: 31.0, tiltX: 0.32, speed: 0.00022, phase: 2.8  },
    { color: 0x818cf8, size: 0.18, orbitR: 30.8, tiltX: 0.32, speed: 0.00015, phase: 4.6  },
    { color: 0xaaaacc, size: 0.14, orbitR: 31.5, tiltX: 0.32, speed: 0.00020, phase: 1.9  }
  ];

  var visibleCount = isMobile ? 6 : PLANET_DATA.length;
  var planets = [];

  for (var pi = 0; pi < visibleCount; pi++) {
    var pd = PLANET_DATA[pi];
    var geo2 = new THREE.SphereGeometry(pd.size, 10, 10);
    var mat2 = new THREE.MeshBasicMaterial({ color: pd.color, transparent: true, opacity: 0.88 });
    var mesh = new THREE.Mesh(geo2, mat2);
    var cosA = Math.cos(pd.phase), sinA = Math.sin(pd.phase);
    mesh.position.set(
      coreX + cosA * pd.orbitR,
      coreY + sinA * pd.orbitR * Math.cos(pd.tiltX),
      coreZ + sinA * pd.orbitR * Math.sin(pd.tiltX) * 0.35
    );
    mesh.userData = { orbitR: pd.orbitR, tiltX: pd.tiltX, speed: pd.speed, angle: pd.phase };
    scene.add(mesh);
    planets.push(mesh);
  }

  var FLOAT_COUNT = isMobile ? 8 : 18;
  var floatNodes = [];
  var floatPalette = [0x7c75f5, 0x26d4e8, 0x3bdc8f, 0x818cf8, 0x6677aa];

  for (var fi = 0; fi < FLOAT_COUNT; fi++) {
    var fcol = floatPalette[fi % floatPalette.length];
    var fsize = 0.08 + Math.random() * 0.18;
    var fgeo = new THREE.SphereGeometry(fsize, 6, 6);
    var fmat = new THREE.MeshBasicMaterial({ color: fcol, transparent: true, opacity: 0.28 + Math.random() * 0.28 });
    var fmesh = new THREE.Mesh(fgeo, fmat);
    var fx, fy;
    do { fx = (Math.random() - 0.5) * 72; fy = (Math.random() - 0.5) * 48; }
    while (Math.abs(fx) < 10 && Math.abs(fy) < 8);
    fmesh.position.set(fx, fy, -10 - Math.random() * 18);
    fmesh.userData = { phase: Math.random() * Math.PI * 2, baseX: fx, baseY: fy };
    scene.add(fmesh);
    floatNodes.push(fmesh);
  }

  var MAX_EDGES = isMobile ? 20 : 44;
  var edgePositions = new Float32Array(MAX_EDGES * 6);
  var edgeColors    = new Float32Array(MAX_EDGES * 6);
  var edgeGeo = new THREE.BufferGeometry();
  edgeGeo.setAttribute('position', new THREE.BufferAttribute(edgePositions, 3));
  edgeGeo.setAttribute('color',    new THREE.BufferAttribute(edgeColors, 3));
  var edgeMat = new THREE.LineBasicMaterial({ vertexColors: true, transparent: true, opacity: 0.20, blending: THREE.AdditiveBlending });
  var edgeLines = new THREE.LineSegments(edgeGeo, edgeMat);
  scene.add(edgeLines);

  var STAR_COUNT = 100;
  var starGeo = new THREE.BufferGeometry();
  var starPos = new Float32Array(STAR_COUNT * 3);
  for (var si = 0; si < STAR_COUNT * 3; si += 3) {
    starPos[si]   = (Math.random() - 0.5) * 200;
    starPos[si+1] = (Math.random() - 0.5) * 130;
    starPos[si+2] = -32 - Math.random() * 20;
  }
  starGeo.setAttribute('position', new THREE.BufferAttribute(starPos, 3));
  scene.add(new THREE.Points(starGeo, new THREE.PointsMaterial({ color: 0x4455aa, size: 0.11, transparent: true, opacity: 0.30 })));

  var mouseX = 0, mouseY = 0, camX = 0, camY = 0;
  document.addEventListener('mousemove', function(e) {
    mouseX = (e.clientX / W() - 0.5) * 2.0;
    mouseY = (e.clientY / H() - 0.5) * 1.4;
  });

  var clock = new THREE.Clock();
  var c1 = new THREE.Color(), c2 = new THREE.Color();
  var frame = 0;
  var CONNECT_DIST = 24;

  function animate() {
    requestAnimationFrame(animate);
    frame++;
    var t = clock.getElapsedTime();

    for (var i = 0; i < planets.length; i++) {
      var p = planets[i];
      p.userData.angle += p.userData.speed;
      var a = p.userData.angle;
      var r = p.userData.orbitR;
      var tx = p.userData.tiltX;
      p.position.x = coreX + Math.cos(a) * r;
      p.position.y = coreY + Math.sin(a) * r * Math.cos(tx);
      p.position.z = coreZ + Math.sin(a) * r * Math.sin(tx) * 0.35;
    }

    for (var fi2 = 0; fi2 < floatNodes.length; fi2++) {
      var n = floatNodes[fi2];
      n.position.x = n.userData.baseX + Math.sin(t * 0.065 + n.userData.phase) * 1.4;
      n.position.y = n.userData.baseY + Math.cos(t * 0.05 + n.userData.phase) * 0.9;
    }

    var pulse = 0.92 + Math.sin(t * 1.3) * 0.08;
    core.scale.setScalar(pulse);
    halo.scale.setScalar(1.0 + Math.sin(t * 0.9) * 0.2);
    halo.position.copy(core.position);

    camX += (mouseX * 1.8 - camX) * 0.022;
    camY += (-mouseY * 1.2 - camY) * 0.022;
    camera.position.x = camX;
    camera.position.y = camY;
    camera.lookAt(0, 0, 0);

    if (frame % 4 === 0) {
      var allNodes = planets.concat(floatNodes.slice(0, 8));
      var ei = 0;
      outer: for (var ii = 0; ii < allNodes.length; ii++) {
        for (var jj = ii + 1; jj < allNodes.length; jj++) {
          if (ei >= MAX_EDGES) break outer;
          var dx = allNodes[ii].position.x - allNodes[jj].position.x;
          var dy = allNodes[ii].position.y - allNodes[jj].position.y;
          var dz = allNodes[ii].position.z - allNodes[jj].position.z;
          var dist = Math.sqrt(dx*dx + dy*dy + dz*dz);
          if (dist < CONNECT_DIST) {
            var base = ei * 6;
            edgePositions[base]   = allNodes[ii].position.x;
            edgePositions[base+1] = allNodes[ii].position.y;
            edgePositions[base+2] = allNodes[ii].position.z;
            edgePositions[base+3] = allNodes[jj].position.x;
            edgePositions[base+4] = allNodes[jj].position.y;
            edgePositions[base+5] = allNodes[jj].position.z;
            var alpha = (1 - dist / CONNECT_DIST) * 0.55;
            c1.set(allNodes[ii].material.color);
            c2.set(allNodes[jj].material.color);
            var mid = c1.clone().lerp(c2, 0.5);
            edgeColors[base]   = mid.r * alpha; edgeColors[base+1] = mid.g * alpha; edgeColors[base+2] = mid.b * alpha;
            edgeColors[base+3] = mid.r * alpha; edgeColors[base+4] = mid.g * alpha; edgeColors[base+5] = mid.b * alpha;
            ei++;
          }
        }
      }
      for (var k = ei; k < MAX_EDGES; k++) {
        var kbase = k * 6;
        for (var x = 0; x < 6; x++) edgePositions[kbase + x] = 0;
      }
      edgeGeo.attributes.position.needsUpdate = true;
      edgeGeo.attributes.color.needsUpdate = true;
    }

    renderer.render(scene, camera);
  }
  animate();

  window.addEventListener('resize', function() {
    renderer.setSize(W(), H());
    camera.aspect = W() / H();
    camera.updateProjectionMatrix();
  });

})();
