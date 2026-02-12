export class GameUI {
  constructor(root, onSelectCar) {
    this.root = root;
    this.onSelectCar = onSelectCar;
    this.build();
  }

  build() {
    this.root.innerHTML = `
      <div class="select-panel panel">
        <h1>BMW Duel Racing</h1>
        <button class="car-btn" data-car="m340i">BMW M340i — lighter, sharper, faster top-end</button>
        <button class="car-btn" data-car="x5">BMW X5 — heavier, more stable traction</button>
        <p>Controls: WASD / Arrow keys. Space = handbrake.</p>
      </div>
      <div class="hud panel">
        <div><strong id="car-name">No car selected</strong></div>
        <div class="meter">Speed: <span id="speed">0</span> km/h</div>
        <div class="meter">RPM: <span id="rpm-text">0</span></div>
        <div class="meter-bar"><div id="rpm-fill" class="meter-fill"></div></div>
      </div>
      <div class="status panel">
        <div>Lap: <span id="lap">1</span>/3</div>
        <div>Position: <span id="position">1</span>/2</div>
      </div>
    `;

    this.selectPanel = this.root.querySelector('.select-panel');
    this.carNameEl = this.root.querySelector('#car-name');
    this.speedEl = this.root.querySelector('#speed');
    this.rpmEl = this.root.querySelector('#rpm-text');
    this.rpmFillEl = this.root.querySelector('#rpm-fill');
    this.lapEl = this.root.querySelector('#lap');
    this.positionEl = this.root.querySelector('#position');

    this.root.querySelectorAll('.car-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        this.selectPanel.style.display = 'none';
        this.onSelectCar(btn.dataset.car);
      });
    });
  }

  update(playerCar, aiCar) {
    this.carNameEl.textContent = playerCar.config.name;
    this.speedEl.textContent = playerCar.speedKmh.toFixed(1);
    this.rpmEl.textContent = `${Math.round(playerCar.engineRpm)} / ${playerCar.config.redlineRpm}`;
    this.rpmFillEl.style.width = `${(playerCar.engineRpm / playerCar.config.redlineRpm) * 100}%`;
    this.lapEl.textContent = playerCar.lap;
    this.positionEl.textContent = playerCar.distanceTravelled >= aiCar.distanceTravelled ? '1' : '2';
  }
}
