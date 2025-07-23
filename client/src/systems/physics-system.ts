import { computed, watch, type Ref } from 'vue';
import type { GameObject } from './game-object-system';
import { useGameStore } from '../stores/game';
import { 
  updatePhysicsPosition, 
  checkCollision, 
  handleCollision, 
  handleWallCollision,
  PhysicsType
} from '../utils/physics';

export class PhysicsSystem {
  private objects: Ref<GameObject[]>;
  private lastTimestamp: number = 0;
  private animationFrameId: number | null = null;
  private hasActivePhysics: Ref<boolean>;

  private physicsObjects = computed(() => this.objects.value.filter(obj => obj.physics))
  private walls = computed(() => this.objects.value.filter(obj => obj.physics && obj.physics.mass == Infinity))
  private activeObjects = computed(() => this.physicsObjects.value.filter(obj => obj.physics && obj.physics.active == true))
  private gameStore;

  constructor(objects: Ref<GameObject[]>, hasActivePhysics: Ref<boolean>) {
    this.objects = objects;
    this.hasActivePhysics = hasActivePhysics;
    this.lastTimestamp = performance.now();
    const self = this;
    this.gameStore = useGameStore();

    // Watch activeObjects to control physics loop
    watch(this.activeObjects, (newActiveObjects) => {
      if(newActiveObjects.length > 0 && hasActivePhysics.value == false) {
        hasActivePhysics.value = true;
        self.start();
      }

      if (hasActivePhysics.value == true && newActiveObjects.length == 0) {
        hasActivePhysics.value = false;
        self.stop();
      }
    })
    
    // Add page visibility event listener to handle tab switching
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        // Tab is hidden, pause physics
        this.stop();
      } else {
        // Tab is visible again, restart if needed
        // Reset timestamp to prevent large delta time on tab refocus
        this.lastTimestamp = performance.now();
        
        // Reset any active physics objects to prevent the "haywire" effect
        this.resetActiveObjectVelocities();
        
        if (this.hasActivePhysics.value && this.animationFrameId === null) {
          this.start();
        }
      }
    });

    // Also handle window focus/blur events for additional safety
    window.addEventListener('blur', () => {
      this.stop();
    });

    window.addEventListener('focus', () => {
      // Reset timestamp to prevent large delta time on window refocus
      this.lastTimestamp = performance.now();
      
      // Reset any active physics objects to prevent the "haywire" effect
      this.resetActiveObjectVelocities();
      
      if (this.hasActivePhysics.value && this.animationFrameId === null) {
        this.start();
      }
    });
  }

  start() {
    if (this.animationFrameId !== null) {
      return; // Already running
    }
    
    // Start the physics loop
    this.lastTimestamp = performance.now();
    this.animationFrameId = requestAnimationFrame(this.update.bind(this));
  }

  stop() {
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
  }

  private update(timestamp: number) {
    // Calculate delta time in seconds
    let deltaTime = (timestamp - this.lastTimestamp) / 1000;
    
    // Handle edge cases that can cause physics instability:
    // 1. Negative delta time (can happen after tab switching)
    // 2. Very large delta time (tab was inactive for a long time)
    // 3. Very small delta time (can cause division by zero issues)
    if (deltaTime < 0 || deltaTime > 0.1) {
      // Reset timing and skip this frame
      this.lastTimestamp = timestamp;
      
      // If delta time was very large (tab was inactive), also reset velocities
      if (deltaTime > 0.1) {
        this.resetActiveObjectVelocities();
      }
      
      this.animationFrameId = requestAnimationFrame(this.update.bind(this));
      return;
    }
    
    // Cap delta time to prevent physics instability from large jumps
    // Make this even more conservative to ensure smooth physics
    const MAX_DELTA_TIME = 1/60; // Cap at ~16ms (60 FPS equivalent)
    const MIN_DELTA_TIME = 1/240; // Minimum delta time to prevent division issues
    deltaTime = Math.max(MIN_DELTA_TIME, Math.min(deltaTime, MAX_DELTA_TIME));
    
    this.lastTimestamp = timestamp;
    
    // Update physics for all objects
    this.updatePhysics(deltaTime);
    
    // Continue the loop
    this.animationFrameId = requestAnimationFrame(this.update.bind(this));
  }

  private updatePhysics(deltaTime: number) {    
    const self = this;
    // Update positions based on physics properties
    for (const obj of this.physicsObjects.value) {
      if (!obj.physics) {
        continue;
      }

      if (obj.physics.physicsType == PhysicsType.Static || obj.physics.physicsType == PhysicsType.Field) {
        // These items don't collide with each other
        continue;
      }

      // Safety check: Reset objects that have gone completely haywire
      if (!isFinite(obj.row) || !isFinite(obj.col) || 
          !isFinite(obj.physics.velocity) || !isFinite(obj.physics.verticalVelocity) ||
          Math.abs(obj.row) > 1000 || Math.abs(obj.col) > 1000 ||
          obj.physics.velocity > 100 || Math.abs(obj.physics.verticalVelocity) > 100) {
        
        // Reset object to a safe state
        obj.row = Math.max(0, Math.min(50, obj.row || 10));
        obj.col = Math.max(0, Math.min(50, obj.col || 10));
        obj.physics = {
          ...obj.physics,
          velocity: 0,
          verticalVelocity: 0,
          height: 0,
          active: false
        };
        continue;
      }

      // First check if the object is stuck and fix it if needed
      /*obj.physics = detectAndFixStuckObjects({
        row: obj.row,
        col: obj.col,
        width: obj.width || 1,
        depth: obj.depth || 1,
        physics: obj.physics
      });*/

      // Update position based on physics
      const { row, col, physics } = updatePhysicsPosition(
        obj.row, 
        obj.col, 
        obj.physics, 
        deltaTime
      );
      
      // Check for wall collisions
      const wallCollisionResult = handleWallCollision(
        row,
        col,
        obj.width || 1,
        obj.depth || 1,
        physics,
        self.walls.value.map(wall => ({
          row: wall.row,
          col: wall.col,
          width: wall.width || 1,
          depth: wall.depth || 1,
          height: wall.height || 1 // Pass wall height with default of 1
        }))
      );
      
      // Update object with new position and physics
      obj.row = wallCollisionResult.row;
      obj.col = wallCollisionResult.col;
      obj.physics = wallCollisionResult.physics;
    }
    
    // Check for collisions between active objects
    for (let i = 0; i < this.physicsObjects.value.length; i++) {
      for (let j = 0; j < this.physicsObjects.value.length; j++) {
        if (i == j) {
          continue;
        }

        const obj1 = this.physicsObjects.value[i];
        const obj2 = this.physicsObjects.value[j];

        if (!obj1.physics || !obj2.physics) {
          continue;
        }

        /*if (!obj1.physics || !obj2.physics) {
          continue;
        }*/

        if (obj1.physics.physicsType == PhysicsType.Static || obj2.physics.physicsType == PhysicsType.Static) {
          // Static type collisions were handled already
          continue;
        }
        
        // Check if objects are colliding
        const colliding = checkCollision(
          {
            row: obj1.row,
            col: obj1.col,
            width: obj1.width || 1,
            depth: obj1.depth || 1,
            physics: obj1.physics
          },
          {
            row: obj2.row,
            col: obj2.col,
            width: obj2.width || 1,
            depth: obj2.depth || 1,
            physics: obj2.physics
          }
        );
        
        if (!colliding) {
          continue;
        }
          
        if (obj1.physics.physicsType == PhysicsType.Field || obj2.physics.physicsType == PhysicsType.Field) {
          // Field type collisions don't actually collide, but they do event.
          if (obj1.physics.event && typeof obj1.physics.event === 'string') {
            this.gameStore.emitEvent(obj1.physics.event, { id: obj2.id });
          }
          if (obj2.physics.event && typeof obj2.physics.event === 'string') {
            this.gameStore.emitEvent(obj2.physics.event, { id: obj1.id });
          }

          continue;
        }

        // Handle collision with momentum transfer
        const { obj1Physics, obj2Physics } = handleCollision(
          {
            row: obj1.row,
            col: obj1.col,
            width: obj1.width || 1,
            depth: obj1.depth || 1,
            physics: obj1.physics
          },
          {
            row: obj2.row,
            col: obj2.col,
            width: obj2.width || 1,
            depth: obj2.depth || 1,
            physics: obj2.physics
          }
        );
        
        // Update physics properties
        obj1.physics = obj1Physics;
        obj2.physics = obj2Physics;
        
        // Check if either object has an event property in its physics configuration
        // and emit that event with the ID of the colliding object
        
        if (obj1.physics.event && typeof obj1.physics.event === 'string') {
          this.gameStore.emitEvent(obj1.physics.event, { id: obj2.id });
        }
        if (obj2.physics.event && typeof obj2.physics.event === 'string') {
          this.gameStore.emitEvent(obj2.physics.event, { id: obj1.id });
        }
        
        // Slightly separate objects to prevent sticking
        const pushFactor = 0.05;
        const centerDiffX = obj2.col - obj1.col;
        const centerDiffY = obj2.row - obj1.row;
        const distance = Math.sqrt(centerDiffX * centerDiffX + centerDiffY * centerDiffY);
        
        if (distance > 0) {
          const normalX = centerDiffX / distance;
          const normalY = centerDiffY / distance;
          
          obj1.col -= normalX * pushFactor;
          obj1.row -= normalY * pushFactor;
          obj2.col += normalX * pushFactor;
          obj2.row += normalY * pushFactor;
        }
      }
    }
  }

  // Apply an impulse to an object (useful for kicking or pushing)
  applyImpulse(objectId: string, angle: number, force: number) {
    const object = this.objects.value.find(obj => obj.id === objectId);
    if (!object || !object.physics) {
      return;
    }
    
    // Initialize physics if not active
    if (!object.physics.active) {
      object.physics.active = true;
      object.physics.velocity = 0;
    }
    
    // Convert current velocity to vector
    const currentVelocity = {
      x: Math.cos(object.physics.angle * (Math.PI / 180)) * object.physics.velocity,
      y: Math.sin(object.physics.angle * (Math.PI / 180)) * object.physics.velocity
    };
    
    // Convert impulse to vector
    const impulse = {
      x: Math.cos(angle * (Math.PI / 180)) * force,
      y: Math.sin(angle * (Math.PI / 180)) * force
    };
    
    // Add impulse to current velocity
    const newVelocity = {
      x: currentVelocity.x + impulse.x / object.physics.mass,
      y: currentVelocity.y + impulse.y / object.physics.mass
    };
    
    // Convert back to angle and magnitude
    const magnitude = Math.sqrt(newVelocity.x * newVelocity.x + newVelocity.y * newVelocity.y);
    let newAngle = Math.atan2(newVelocity.y, newVelocity.x) * (180 / Math.PI);
    if (newAngle < 0) newAngle += 360;
    
    // Update physics properties
    object.physics.angle = newAngle;
    object.physics.velocity = magnitude;
    object.physics.active = true;
  }

  // Apply a vertical impulse (jumping or throwing upward)
  applyVerticalImpulse(objectId: string, force: number) {
    const object = this.objects.value.find(obj => obj.id === objectId);
    if (!object || !object.physics) {
      return;
    }
    
    // Initialize physics if not active
    if (!object.physics.active) {
      object.physics.active = true;
    }
    
    // Add vertical impulse
    object.physics.verticalVelocity += force / object.physics.mass;
  }
  
  // Reset velocities of active physics objects to prevent the "haywire" effect when tabbing back in
  resetActiveObjectVelocities() {
    // Find all objects with active physics
    const activeObjects = this.physicsObjects.value.filter(obj => 
      obj.physics && obj.physics.active === true
    );
    
    // Apply velocity damping to all active objects
    for (const obj of activeObjects) {
      if (!obj.physics) continue;
      
      // If object is moving fast, reduce its velocity significantly
      if (obj.physics.velocity > 5) {
        obj.physics.velocity *= 0.3; // Reduce horizontal velocity by 70%
      }
      
      // If object is bouncing high, reduce vertical velocity
      if (Math.abs(obj.physics.verticalVelocity) > 3) {
        obj.physics.verticalVelocity *= 0.3; // Reduce vertical velocity by 70%
      }
      
      // If object is very high in the air, bring it down gently
      if (obj.physics.height > 5) {
        obj.physics.height = Math.min(obj.physics.height, 5);
        obj.physics.verticalVelocity = Math.min(obj.physics.verticalVelocity, 0);
      }
    }
  }
}