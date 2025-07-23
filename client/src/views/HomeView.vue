<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { staticAssets } from '../assets/index'

const openSourceCode = () => {
  window.open('https://github.com/kirodotdev/spirit-of-kiro/', '_blank')
}

const openGuide = () => {
  window.open('https://kiro.dev/docs/guides/learn-by-playing/', '_blank')
}

// Demo crafting state
const demoItems = ref([
  { id: 1, name: 'Rusty Gear', rarity: 'common', active: false },
  { id: 2, name: 'Crystal Shard', rarity: 'rare', active: false },
  { id: 3, name: 'Ethereal Essence', rarity: 'epic', active: false }
])

const craftingInProgress = ref(false)
const craftedItem = ref(null)
const sparkles = ref([])

// Generate random sparkle positions
const generateSparkles = () => {
  sparkles.value = Array.from({ length: 12 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    delay: Math.random() * 2,
    duration: 1 + Math.random() * 2
  }))
}

// Demo crafting animation
const startCraftingDemo = () => {
  if (craftingInProgress.value) return
  
  craftingInProgress.value = true
  craftedItem.value = null
  
  // Activate items one by one
  demoItems.value.forEach((item, index) => {
    setTimeout(() => {
      item.active = true
    }, index * 800)
  })
  
  // Show crafting result after all items are active
  setTimeout(() => {
    craftedItem.value = {
      name: 'Clockwork Prism',
      rarity: 'legendary',
      description: 'A mesmerizing fusion of mechanical precision and crystalline magic'
    }
    
    // Reset after showing result
    setTimeout(() => {
      demoItems.value.forEach(item => item.active = false)
      craftingInProgress.value = false
      craftedItem.value = null
    }, 3000)
  }, 3000)
}

let demoInterval = null

onMounted(() => {
  generateSparkles()
  
  // Start demo automatically and repeat
  startCraftingDemo()
  demoInterval = setInterval(startCraftingDemo, 8000)
})

onUnmounted(() => {
  if (demoInterval) {
    clearInterval(demoInterval)
  }
})
</script>

<template>
  <div class="home">
    <!-- Animated background sparkles -->
    <div class="sparkles-container">
      <div 
        v-for="sparkle in sparkles" 
        :key="sparkle.id"
        class="sparkle"
        :style="{
          left: sparkle.x + '%',
          top: sparkle.y + '%',
          animationDelay: sparkle.delay + 's',
          animationDuration: sparkle.duration + 's'
        }"
      ></div>
    </div>

    <div class="hero">
      <div class="hero-content">
        <!-- Live Crafting Demo -->
        <div class="crafting-demo">
          <div class="atelier-title">
            <h2>✨ Enchanted Atelier ✨</h2>
            <p>Watch the magic of infinite crafting unfold</p>
          </div>
          
          <div class="workbench-container">
            <img :src="staticAssets.workbench" alt="Magical Workbench" class="demo-workbench" />
            
            <!-- Crafting ingredients -->
            <div class="crafting-ingredients">
              <div 
                v-for="item in demoItems" 
                :key="item.id"
                class="demo-item"
                :class="[`rarity-${item.rarity}`, { active: item.active }]"
              >
                <div class="item-glow"></div>
                <div class="item-name">{{ item.name }}</div>
              </div>
            </div>
            
            <!-- Crafting magic effects -->
            <div v-if="craftingInProgress" class="magic-effects">
              <div class="magic-circle"></div>
              <div class="energy-beams"></div>
            </div>
            
            <!-- Crafted result -->
            <div v-if="craftedItem" class="crafted-result" :class="`rarity-${craftedItem.rarity}`">
              <div class="result-glow"></div>
              <div class="result-name">{{ craftedItem.name }}</div>
              <div class="result-description">{{ craftedItem.description }}</div>
            </div>
          </div>
        </div>

        <div class="hero-text">
          <h1>Spirit of Kiro</h1>
          <p class="tagline">Where imagination meets infinite creation</p>
          <div class="button-group">
            <router-link to="/play" class="play-button">
              Enter the Atelier
            </router-link>
            <div class="utility-buttons">
              <button class="source-button" @click="openSourceCode">Source</button>
              <button class="guide-button" @click="openGuide">Guide</button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="content">
      <div class="section">
        <p class="large-text">Step into an enchanted workshop where every item pulses with possibility. Watch as mundane objects transform into legendary artifacts through the alchemy of AI-powered crafting.</p>
      </div>

      <div class="features">
        <div class="feature">
          <div class="feature-icon">🔮</div>
          <h3>Mystical Generation</h3>
          <p>Every item emerges from the ethereal realm, unique and imbued with its own magical properties and story.</p>
        </div>
        <div class="feature">
          <div class="feature-icon">⚗️</div>
          <h3>Alchemical Fusion</h3>
          <p>Combine, transmute, and evolve items through ancient crafting rituals powered by artificial intelligence.</p>
        </div>
        <div class="feature">
          <div class="feature-icon">✨</div>
          <h3>Living Enchantments</h3>
          <p>Your creations breathe with life, each possessing unique behaviors that emerge from their mystical essence.</p>
        </div>
      </div>

      <div class="section">
        <h2>The atelier awaits your touch.</h2>
        <p class="large-text">Discover. Craft. Transcend. Every creation in this mystical workshop carries the spark of infinite possibility.</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.home {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  background: linear-gradient(135deg, #0a0a1a 0%, #1a0a2a 50%, #2a1a0a 100%);
  color: white;
  text-align: center;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
  position: relative;
  overflow-x: hidden;
}

.hero {
  padding: 4rem 2rem 3rem;
  width: 100%;
  max-width: 1400px;
  min-height: 85vh;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

.content {
  width: 100%;
  max-width: 1200px;
  padding: 0 2rem 6rem;
}

h1 {
  font-size: 5.5rem;
  font-weight: 700;
  margin-bottom: 1rem;
  background: linear-gradient(135deg, #ffd700 0%, #ff6b6b 50%, #4ecdc4 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  letter-spacing: -0.02em;
  text-shadow: 0 0 30px rgba(255, 215, 0, 0.3);
}

h2 {
  font-size: 3rem;
  font-weight: 600;
  margin-bottom: 1.5rem;
  letter-spacing: -0.02em;
}

.tagline {
  font-size: 1.8rem;
  color: #c9a96e;
  margin-bottom: 2.5rem;
  font-weight: 400;
  letter-spacing: 0.02em;
  text-shadow: 0 0 10px rgba(201, 169, 110, 0.5);
}

.large-text {
  font-size: 1.4rem;
  line-height: 1.4;
  color: #888;
  max-width: 800px;
  margin: 0 auto 3rem;
}

.section {
  margin-bottom: 6rem;
  padding: 0 2rem;
}

.features {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 2rem;
  margin: 3rem 0;
  padding: 0 2rem;
}

.feature {
  padding: 2.5rem 2rem;
  background: linear-gradient(135deg, rgba(139, 92, 246, 0.1) 0%, rgba(255, 107, 107, 0.05) 100%);
  border-radius: 20px;
  border: 1px solid rgba(139, 92, 246, 0.2);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
}

.feature::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: radial-gradient(circle at 50% 0%, rgba(255, 215, 0, 0.1) 0%, transparent 50%);
  opacity: 0;
  transition: opacity 0.3s ease;
}

.feature:hover::before {
  opacity: 1;
}

.feature:hover {
  transform: translateY(-8px);
  background: linear-gradient(135deg, rgba(139, 92, 246, 0.15) 0%, rgba(255, 107, 107, 0.1) 100%);
  border-color: rgba(139, 92, 246, 0.4);
  box-shadow: 0 10px 30px rgba(139, 92, 246, 0.2);
}

.feature-icon {
  font-size: 3rem;
  margin-bottom: 1.5rem;
  filter: drop-shadow(0 0 10px rgba(255, 215, 0, 0.5));
}

.feature h3 {
  margin-bottom: 1rem;
  color: #fff;
  font-size: 1.6rem;
  font-weight: 600;
  letter-spacing: -0.01em;
  text-shadow: 0 0 10px rgba(255, 255, 255, 0.3);
}

.feature p {
  font-size: 1.1rem;
  color: #c9a96e;
  line-height: 1.6;
}

.play-button {
  display: inline-block;
  padding: 1.2rem 4rem;
  font-size: 1.5rem;
  font-weight: 500;
  text-decoration: none;
  color: white;
  background: linear-gradient(135deg, #8b5cf6 0%, #a855f7 50%, #c084fc 100%);
  border-radius: 12px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  border: 2px solid rgba(139, 92, 246, 0.3);
  box-shadow: 0 4px 20px rgba(139, 92, 246, 0.4), 0 0 30px rgba(139, 92, 246, 0.2);
}

.play-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 25px rgba(139, 92, 246, 0.6), 0 0 40px rgba(139, 92, 246, 0.4);
  background: linear-gradient(135deg, #7c3aed 0%, #8b5cf6 50%, #a855f7 100%);
  border-color: rgba(139, 92, 246, 0.6);
}

.button-group {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.5rem;
}

.utility-buttons {
  display: flex;
  gap: 1rem;
}

.source-button {
  padding: 0.8rem 2rem;
  background-color: #2196F3;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 1rem;
  font-weight: 500;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  text-decoration: none;
  display: inline-block;
  box-shadow: 0 2px 10px rgba(33, 150, 243, 0.2);
}

.source-button:hover {
  background-color: #1976D2;
  transform: translateY(-2px);
  box-shadow: 0 4px 15px rgba(33, 150, 243, 0.3);
}

.guide-button {
  padding: 0.8rem 2rem;
  background-color: #FF9800;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 1rem;
  font-weight: 500;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  text-decoration: none;
  display: inline-block;
  box-shadow: 0 2px 10px rgba(255, 152, 0, 0.2);
}

.guide-button:hover {
  background-color: #F57C00;
  transform: translateY(-2px);
  box-shadow: 0 4px 15px rgba(255, 152, 0, 0.3);
}

/* Sparkles background animation */
.sparkles-container {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 0;
}

.sparkle {
  position: absolute;
  width: 4px;
  height: 4px;
  background: radial-gradient(circle, #ffd700 0%, transparent 70%);
  border-radius: 50%;
  animation: sparkle-twinkle 3s ease-in-out infinite;
}

@keyframes sparkle-twinkle {
  0%, 100% { opacity: 0; transform: scale(0); }
  50% { opacity: 1; transform: scale(1); }
}

.hero-content {
  display: flex;
  align-items: center;
  gap: 4rem;
  max-width: 1400px;
  margin: 0 auto;
  position: relative;
  z-index: 1;
}

.hero-text {
  flex: 1;
  position: relative;
}

/* Crafting Demo Styles */
.crafting-demo {
  flex: 1;
  max-width: 600px;
  position: relative;
}

.atelier-title {
  margin-bottom: 2rem;
}

.atelier-title h2 {
  font-size: 2.5rem;
  margin-bottom: 0.5rem;
  background: linear-gradient(135deg, #ffd700 0%, #ff6b6b 50%, #4ecdc4 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  text-shadow: 0 0 20px rgba(255, 215, 0, 0.3);
}

.atelier-title p {
  color: #c9a96e;
  font-size: 1.1rem;
  opacity: 0.9;
}

.workbench-container {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 2rem;
  background: radial-gradient(ellipse at center, rgba(139, 92, 246, 0.1) 0%, transparent 70%);
  border-radius: 20px;
  border: 1px solid rgba(139, 92, 246, 0.2);
}

.demo-workbench {
  width: 300px;
  height: auto;
  filter: drop-shadow(0 10px 20px rgba(139, 92, 246, 0.3));
  margin-bottom: 2rem;
}

.crafting-ingredients {
  display: flex;
  gap: 1.5rem;
  margin-bottom: 2rem;
  flex-wrap: wrap;
  justify-content: center;
}

.demo-item {
  position: relative;
  padding: 1rem 1.5rem;
  background: rgba(0, 0, 0, 0.4);
  border-radius: 12px;
  border: 2px solid transparent;
  transition: all 0.5s ease;
  opacity: 0.6;
  transform: scale(0.9);
}

.demo-item.active {
  opacity: 1;
  transform: scale(1);
  animation: item-activate 0.8s ease-out;
}

.demo-item.rarity-common.active { border-color: #ffffff; }
.demo-item.rarity-rare.active { border-color: #2196f3; }
.demo-item.rarity-epic.active { border-color: #9c27b0; }

.item-glow {
  position: absolute;
  top: -2px;
  left: -2px;
  right: -2px;
  bottom: -2px;
  border-radius: 12px;
  opacity: 0;
  transition: opacity 0.5s ease;
}

.demo-item.active .item-glow {
  opacity: 1;
  animation: glow-pulse 2s ease-in-out infinite;
}

.rarity-common .item-glow { background: radial-gradient(circle, rgba(255, 255, 255, 0.3) 0%, transparent 70%); }
.rarity-rare .item-glow { background: radial-gradient(circle, rgba(33, 150, 243, 0.3) 0%, transparent 70%); }
.rarity-epic .item-glow { background: radial-gradient(circle, rgba(156, 39, 176, 0.3) 0%, transparent 70%); }

.item-name {
  font-size: 0.9rem;
  font-weight: 500;
  color: white;
  text-shadow: 0 0 10px rgba(255, 255, 255, 0.5);
}

.magic-effects {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  pointer-events: none;
}

.magic-circle {
  width: 200px;
  height: 200px;
  border: 3px solid rgba(139, 92, 246, 0.6);
  border-radius: 50%;
  animation: rotate 3s linear infinite;
  position: relative;
}

.magic-circle::before {
  content: '';
  position: absolute;
  top: -3px;
  left: -3px;
  right: -3px;
  bottom: -3px;
  border: 2px solid rgba(255, 215, 0, 0.4);
  border-radius: 50%;
  animation: rotate 2s linear infinite reverse;
}

.energy-beams {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 4px;
  height: 100px;
  background: linear-gradient(to bottom, transparent, #8b5cf6, transparent);
  animation: beam-pulse 1.5s ease-in-out infinite;
}

.energy-beams::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%) rotate(90deg);
  width: 4px;
  height: 100px;
  background: linear-gradient(to bottom, transparent, #ffd700, transparent);
  animation: beam-pulse 1.5s ease-in-out infinite 0.5s;
}

.crafted-result {
  position: relative;
  padding: 2rem;
  background: rgba(0, 0, 0, 0.6);
  border-radius: 16px;
  border: 3px solid #ff9800;
  animation: result-appear 1s ease-out;
  text-align: center;
  max-width: 300px;
}

.result-glow {
  position: absolute;
  top: -3px;
  left: -3px;
  right: -3px;
  bottom: -3px;
  background: radial-gradient(circle, rgba(255, 152, 0, 0.4) 0%, transparent 70%);
  border-radius: 16px;
  animation: legendary-glow 2s ease-in-out infinite;
}

.result-name {
  font-size: 1.4rem;
  font-weight: 600;
  color: #ff9800;
  margin-bottom: 0.5rem;
  text-shadow: 0 0 15px rgba(255, 152, 0, 0.8);
}

.result-description {
  font-size: 0.9rem;
  color: #c9a96e;
  line-height: 1.4;
}

/* Animations */
@keyframes item-activate {
  0% { transform: scale(0.9) translateY(10px); opacity: 0.6; }
  50% { transform: scale(1.1) translateY(-5px); opacity: 1; }
  100% { transform: scale(1) translateY(0); opacity: 1; }
}

@keyframes glow-pulse {
  0%, 100% { opacity: 0.3; }
  50% { opacity: 0.8; }
}

@keyframes rotate {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

@keyframes beam-pulse {
  0%, 100% { opacity: 0; transform: translate(-50%, -50%) scaleY(0); }
  50% { opacity: 1; transform: translate(-50%, -50%) scaleY(1); }
}

@keyframes result-appear {
  0% { opacity: 0; transform: scale(0.8) translateY(20px); }
  100% { opacity: 1; transform: scale(1) translateY(0); }
}

@keyframes legendary-glow {
  0%, 100% { opacity: 0.4; }
  50% { opacity: 0.8; }
}

@media (max-width: 768px) {
  .hero {
    padding: 3rem 1rem 2rem;
    min-height: 70vh;
  }

  .content {
    padding: 0 1rem 4rem;
  }

  h1 {
    font-size: 3.5rem;
  }

  h2 {
    font-size: 2.2rem;
  }

  .tagline {
    font-size: 1.4rem;
    margin-bottom: 2rem;
  }

  .large-text {
    font-size: 1.2rem;
  }

  .features {
    grid-template-columns: 1fr;
    padding: 0 1rem;
  }

  .section {
    padding: 0 1rem;
    margin-bottom: 3rem;
  }

  .play-button {
    padding: 1rem 3rem;
    font-size: 1.3rem;
  }

  .hero-content {
    flex-direction: column;
    gap: 2rem;
  }

  .crafting-demo {
    max-width: 100%;
    order: 1;
  }

  .hero-text {
    order: 2;
  }

  .atelier-title h2 {
    font-size: 2rem;
  }

  .demo-workbench {
    width: 250px;
  }

  .workbench-container {
    padding: 1.5rem;
  }

  .crafting-ingredients {
    gap: 1rem;
  }

  .demo-item {
    padding: 0.8rem 1.2rem;
  }

  .item-name {
    font-size: 0.8rem;
  }

  .magic-circle {
    width: 150px;
    height: 150px;
  }

  .crafted-result {
    padding: 1.5rem;
    max-width: 250px;
  }

  .result-name {
    font-size: 1.2rem;
  }

  .result-description {
    font-size: 0.8rem;
  }

  .utility-buttons {
    flex-direction: column;
    gap: 0.8rem;
  }

  .source-button,
  .guide-button {
    padding: 0.7rem 1.5rem;
    font-size: 0.9rem;
  }

  .feature-icon {
    font-size: 2.5rem;
    margin-bottom: 1rem;
  }
}
</style>