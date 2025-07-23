class Game {
    constructor() {
        this.WIDTH = 40;
        this.HEIGHT = 24;
        this.TILESIZE = 25;

        this.DIRECTIONS = [
            { dx: 0, dy: -1 }, // вверх
            { dx: 0, dy: 1 },  // вниз
            { dx: -1, dy: 0 }, // влево
            { dx: 1, dy: 0 }   // вправо
        ];

        //здоровье
        this.MAXENEMYHEALTH = 3;
        this.MAXHEROHEALTH = 3;

        //сила атаки
        this.MINHEROATTACKPOWER = 1;
        this.ENEMIESATTACKPOWER = 1

        //количество предметов
        this.POTIONSCOUNT = 10
        this.ENEMIESCOUNT = 10
        this.SWORDSCOUNT = 2

        //сила действия ,fajd
        this.INCREASEATTACKPOWER = 1
        this.INCREASEHEALTH = 1

        this.enemyMoveInterval = null;
        this.enemyMoveDelay = 500;

        // 0 - стена
        // 1 - пол
        // 2 - меч
        // 3 - зелье
        // 4 - герой
        // 5 - противник

        this.map;

        this.state = {
            hero: {
                x: 0,
                y: 0,
                health: this.MAXHEROHEALTH,
                attackPower: this.MINHEROATTACKPOWER
            },
            score: 0,
            enemies: []
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
        for (const dir of this.DIRECTIONS) {
            const checkX = x + dir.dx;
            const checkY = y + dir.dy;

            if (checkX === this.state.hero.x && checkY === this.state.hero.y) {
                this.state.hero.health -= this.ENEMIESATTACKPOWER;

                if (this.state.hero.health <= 0) {
                    this.gameOver();
                }
                this.renderMap();
                break;
            }
        }

    }

    moveEnemies() {
        for (let i = 0; i < this.state.enemies.length; i++) {
            const enemy = this.state.enemies[i];
            const possibleMoves = [];

            for (const dir of this.DIRECTIONS) {
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
            this.state.hero.attackPower += this.INCREASEATTACKPOWER;

            const powerValueInfo = document.querySelector('.power-value')
            powerValueInfo.innerHTML = this.state.hero.attackPower + ''
        }
        if (targetTile === 3) {
            this.state.hero.health += this.INCREASEHEALTH
        }

        this.map[this.state.hero.y][this.state.hero.x] = 1;
        this.state.hero.x = newX;
        this.state.hero.y = newY;
        this.map[newY][newX] = 4;

        this.renderMap();
    }

    findEnemy(x, y) {
        for (let i = 0; i < this.state.enemies.length; i++) {
            if (this.state.enemies[i].x === x && this.state.enemies[i].y === y) {
                return i
            }
        }
        return -1;
    }

    removeEnemy(x, y) {
        const enemyIndex = this.findEnemy(x, y);
        this.state.enemies.splice(enemyIndex, 1);
    }

    attack() {
        this.DIRECTIONS.forEach(dir => {
            const targetX = this.state.hero.x + dir.dx;
            const targetY = this.state.hero.y + dir.dy;

            const targetEnemyIndex = this.findEnemy(targetX, targetY);

            if (targetEnemyIndex !== -1) {
                let enemy = this.state.enemies[targetEnemyIndex]
                if (enemy.health - this.state.hero.attackPower <= 0) {
                    this.map[targetY][targetX] = 1;
                    this.removeEnemy(targetX, targetY);
                    this.state.score += 1;

                    const scoreValueInfo = document.querySelector('.score-value')
                    scoreValueInfo.innerHTML = this.state.score + ''
                }
                else {
                    enemy.health -= this.state.hero.attackPower
                }
                this.renderMap()
            }
        });

        if (this.state.enemies.length === 0)
            this.init();
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
        for (let i = 0; i < this.SWORDSCOUNT; i++) {
            const position = this.getRandomEmptyTile();
            if (position) {
                this.map[position.y][position.x] = 2;
            }
        }
    }

    generatePotions() {
        for (let i = 0; i < this.POTIONSCOUNT; i++) {
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
        for (let i = this.state.enemies.length; i < this.ENEMIESCOUNT; i++) {
            const position = this.getRandomEmptyTile();
            if (position) {
                this.map[position.y][position.x] = 5;
                this.state.enemies.push({ x: position.x, y: position.y, health: this.MAXENEMYHEALTH });
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

        for (let y = 0; y < this.HEIGHT; y++) {
            for (let x = 0; x < this.WIDTH; x++) {
                const tileValue = this.map[y][x];
                const tile = document.createElement('div');
                tile.classList.add('tile')

                tile.style.top = y * this.TILESIZE + 'px'
                tile.style.left = x * this.TILESIZE + 'px'

                const health = document.createElement('div');
                health.classList.add('health')

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
                        health.style.width = (this.state.hero.health / this.MAXHEROHEALTH) * 100 + '%'
                        tile.appendChild(health);
                        break;
                    case 5:
                        tile.classList.add('tileE');
                        const enemy = this.state.enemies[this.findEnemy(x, y)]

                        health.style.width = (enemy.health / this.MAXENEMYHEALTH) * 100 + '%'
                        tile.appendChild(health);
                        break;
                }

                field.appendChild(tile)
            }
        }
    }
}