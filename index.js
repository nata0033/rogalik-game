class Game {
    constructor() {
        this.WIDTH = 40;
        this.HEIGHT = 24;

        this.map;

        // 0 - стена
        // 1 - пол
        // 2 - меч
        // 3 - зелье
        // 4 - герой
        // 5 - противник

        this.enemies = [];

        this.enemyMoveInterval = null;
        this.enemyMoveDelay = 500;

        this.directions = [
            { dx: 0, dy: -1 }, // вверх
            { dx: 0, dy: 1 },  // вниз
            { dx: -1, dy: 0 }, // влево
            { dx: 1, dy: 0 }   // вправо
        ];

        this.state = {
            hero: {
                x: 0,
                y: 0,
                health: 10,
                attackPower: 1
            },
            score: 0,
        };
    }

    init() {
        this.generateMap();
        this.initEventHandlers();
        this.renderMap();
        this.startEnemyMovement();
    }

    gameOver() {
        this.stopEnemyMovement();
        this.stopEventHandlers();
    }

    attackHero(x, y) {
        for (const dir of this.directions) {
            const checkX = x + dir.dx;
            const checkY = y + dir.dy;

            if (checkX === this.state.hero.x && checkY === this.state.hero.y) {
                this.state.hero.health -= 5;

                if (this.state.hero.health <= 0) {
                    this.state.hero.health = 0;
                    this.gameOver();
                }
                break;
            }
        }

    }

    moveEnemies() {
        for (let i = 0; i < this.enemies.length; i++) {
            const enemy = this.enemies[i];
            const possibleMoves = [];

            for (const dir of this.directions) {
                const newX = enemy.x + dir.dx;
                const newY = enemy.y + dir.dy;

                if (this.map[newY][newX] === 1) {
                    possibleMoves.push({ x: newX, y: newY });
                }
            }

            if (possibleMoves.length > 0) {
                const randomMove = possibleMoves[Math.floor(Math.random() * possibleMoves.length)];

                this.map[enemy.y][enemy.x] = 1;

                enemy.x = randomMove.x;
                enemy.y = randomMove.y;

                this.map[randomMove.y][randomMove.x] = 5;

                this.attackHero(enemy.x, enemy.y)
            }
        }
        this.renderMap();
    }

    startEnemyMovement() {
        this.enemyMoveInterval = setInterval(() => {
            this.moveEnemies();
        }, this.enemyMoveDelay);
    }

    stopEnemyMovement() {
        if (this.enemyMoveInterval) {
            clearInterval(this.enemyMoveInterval);
            this.enemyMoveInterval = null;
        }
    }

    moveHero(dx, dy) {
        const newX = this.state.hero.x + dx;
        const newY = this.state.hero.y + dy;

        const targetTile = this.map[newY][newX];

        if (targetTile === 0 || targetTile === 5) {
            return;
        }

        if (targetTile === 2) {
            this.state.hero.attackPower += 1;
        }
        if (targetTile === 3) {
            this.state.hero.health += 5
        }

        this.map[this.state.hero.y][this.state.hero.x] = 1;
        this.state.hero.x = newX;
        this.state.hero.y = newY;
        this.map[newY][newX] = 4;

        this.renderMap();
    }

    findEnemy(x, y) {
        for (let i = 0; i < this.enemies.length; i++) {
            if (this.enemies[i].x === x && this.enemies[i].y === y) {
                return i
            }
        }
        return -1;
    }

    removeEnemy(x, y) {
        const enemyIndex = this.findEnemy(x, y);
        this.enemies.splice(enemyIndex, 1);
    }

    attack() {
        //const heroTile = document.querySelector('.tileP')
        //heroTile.style.backgroundImage = 'url(./images/tile-PA.png)'

        this.directions.forEach(dir => {
            const targetX = this.state.hero.x + dir.dx;
            const targetY = this.state.hero.y + dir.dy;

            if (this.map[targetY][targetX] === 5) {
                this.map[targetY][targetX] = 1;
                this.removeEnemy(targetX, targetY);
                this.state.score += 1;
                this.renderMap()
            }
        });

        //setTimeout(() => {
        //    heroTile.style.backgroundImage = 'url(./images/tile-P.png)';
        //}, 500);

        if (this.score.enemies == 0)
            this.generateEnemies();
    }

    initEventHandlers() {
        document.addEventListener('keydown', (event) => {
            switch (event.code) {
                case 'KeyW':
                    this.moveHero(0, -1)
                    this.renderMap()
                    break;
                case 'KeyA':
                    this.moveHero(-1, 0);
                    this.renderMap()
                    break;
                case 'KeyS':
                    this.moveHero(0, 1);
                    this.renderMap()
                    break;
                case 'KeyD':
                    this.moveHero(1, 0);
                    this.renderMap()
                    break;
                case "Space":
                    event.preventDefault();
                    this.attack()
                    break;
                default:
                    break;
            }
        });
    }

    stopEventHandlers() {
        document.removeEventListener('keydown', this.boundKeyHandler);
    }

    getRandomEmptyTile() {
        const emptyTile = [];

        for (let y = 0; y < this.HEIGHT; y++) {
            for (let x = 0; x < this.WIDTH; x++) {
                if (this.map[y][x] === 1) {
                    emptyTile.push({ x, y });
                }
            }
        }

        return emptyTile.length > 0
            ? emptyTile[Math.floor(Math.random() * emptyTile.length)]
            : null;
    }

    fillWalls() {
        this.map = new Array(this.HEIGHT);
        for (let i = 0; i < this.HEIGHT; i++) {
            this.map[i] = new Array(this.WIDTH);
            for (let j = 0; j < this.WIDTH; j++) {
                this.map[i][j] = 0;
            }
        }
    }

    generateFloors() {
        const roomCount = Math.floor(Math.random() * 6) + 5;

        for (let i = 0; i < roomCount; i++) {
            const width = Math.floor(Math.random() * 6) + 3;
            const height = Math.floor(Math.random() * 6) + 3;

            const x = Math.floor(Math.random() * (this.WIDTH - width - 2)) + 1;
            const y = Math.floor(Math.random() * (this.HEIGHT - height - 2)) + 1;

            for (let dy = 0; dy < height; dy++) {
                for (let dx = 0; dx < width; dx++) {
                    this.map[y + dy][x + dx] = 1;
                }
            }
        }
    }

    generateWays() {
        const horizontalPassages = Math.floor(Math.random() * 3) + 3;
        for (let i = 0; i < horizontalPassages; i++) {
            const y = Math.floor(Math.random() * (this.HEIGHT - 2)) + 1;

            for (let x = 1; x < this.WIDTH - 1; x++) {
                if (this.map[y][x] !== 1) {
                    this.map[y][x] = 1;
                }
            }
        }

        const verticalPassages = Math.floor(Math.random() * 3) + 3;
        for (let i = 0; i < verticalPassages; i++) {
            const x = Math.floor(Math.random() * (this.WIDTH - 2)) + 1;

            for (let y = 1; y < this.HEIGHT - 1; y++) {
                if (this.map[y][x] !== 1) {
                    this.map[y][x] = 1;
                }
            }
        }
    }

    generateSwords() {
        const count = 2;
        for (let i = 0; i < count; i++) {
            const position = this.getRandomEmptyTile();
            if (position) {
                this.map[position.y][position.x] = 2;
            }
        }
    }

    generatePotions() {
        const count = 10;
        for (let i = 0; i < count; i++) {
            const position = this.getRandomEmptyTile();
            if (position) {
                this.map[position.y][position.x] = 3;
            }
        }
    }

    generateHero() {
        const position = this.getRandomEmptyTile();
        if (position) {
            this.map[position.y][position.x] = 4;
            this.state.hero.x = position.x;
            this.state.hero.y = position.y;
        }
    }

    generateEnemies() {
        const count = 10;
        for (let i = 0; i < count; i++) {
            const position = this.getRandomEmptyTile();
            if (position) {
                this.map[position.y][position.x] = 5;
                this.enemies.push({ x: position.x, y: position.y });
            }
        }
    }

    generateMap() {
        this.fillWalls();
        this.generateFloors();
        this.generateWays();
        this.generateSwords();
        this.generatePotions();
        this.generateHero();
        this.generateEnemies();
    }

    renderMap() {
        const field = document.querySelector('.field');
        field.innerHTML = '';

        const tileSize = 25;

        for (let y = 0; y < this.HEIGHT; y++) {
            for (let x = 0; x < this.WIDTH; x++) {
                const tileValue = this.map[y][x];
                const tile = document.createElement('div');
                tile.classList.add('tile')

                tile.style.top = y * tileSize + 'px'
                tile.style.left = x * tileSize + 'px'

                const health = document.createElement('div');
                health.classList.add('health')
                health.width = 25 + 'px'

                switch (tileValue) {
                    case 0:
                        tile.classList.add('tileW');
                        break;
                    case 1:
                        break;
                    case 2:
                        tile.classList.add('tileSW');
                        break;
                    case 3:
                        tile.classList.add('tileHP');
                        break;
                    case 4:
                        tile.classList.add('tileP');
                        tile.appendChild(health);
                        break;
                    case 5:
                        tile.classList.add('tileE');
                        tile.appendChild(health);
                        break;
                }

                field.appendChild(tile)
            }
        }
    }
}