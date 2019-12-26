const hole = 100;
const bossPoint = 50;

document.onkeydown = function(e) {
    e = e || window.event;
    var charCode = e.keyCode || e.which;
    if (charCode === 32 || charCode === 38 || charCode === 40) {
        e.preventDefault();
        return false;
    }
}

let cnv = document.getElementById('canvas');
let playBtn = document.getElementById('playBtn');
let settings = document.getElementById('settings');
let closeSettingsBtn = document.getElementById('close-settings');
let ctx = cnv.getContext('2d');
ctx.fillStyle = '#fff';
ctx.font = 'bold 50px flappyBird';
playBtn.onclick=function(){
    document.getElementById('menu').style.display='none';
    document.getElementById('canvas').style.display='block';
    startGame();
};
settings.onclick=openSettings;
closeSettingsBtn.onclick=closeSettings;

let bg = createImage('img/bird-bg.png');
let bird = createImage('img/bird.png');
let pipeTop = createImage('img/pipe-top.png');
let pipeBottom =createImage('img/pipe-bottom.png');
let fg = createImage('img/fg.png');
let coin = createImage('img/coin.png');
let boss = createImage('img/boss.png');
let ball = createImage('img/ball.png');
let bossBall = createImage('img/bossBall.png');
let R = createImage('img/R.png');
let re = createImage('img/re1.png');

let fly = new Audio();
fly.src = 'audio/fly.mp3';

let score = new Audio();
score.src = 'audio/score.mp3';

let record = getCookie("max") || 0;

function getRandomFloat(min, max) {
    return Math.random() * (max - min) + min;
}

function createImage(src) {
    let img = new Image();
    img.src = src;
    return img;
}

function getPipeY() {
    return 0-pipeTop.height+50+getRandomFloat(0,pipeTop.height-50);
}

function getRandomInteger(min, max) {
    let rand = min + Math.random() * (max - min);
    return Math.round(rand);
}

let attackManager=1;
let flyScore = 0;
let run = true;
let win = false;
let balls=[];
let bossBalls=[];
let targetLevel = -10;

function attackOne(bossCh){
    if (attackManager===1) {
        if (bossCh.y > targetLevel) {
            bossCh.y-=2;
        } else {
            targetLevel = 370;
            if (bossCh.y < targetLevel) {
                bossCh.y++;
                if (bossCh.y % 40 === 0) {
                    bossBalls.push({
                        x: bossCh.x + boss.width / 2,
                        y: bossCh.y + boss.height / 2 - ball.height / 2
                    })
                }
            } else {
                attackManager=2;
            }
        }
    }
}

function attackTwo(bossCh) {
    if (attackManager===2) {
        targetLevel=50;
        if (bossCh.y > targetLevel) {
            bossCh.y--;
        } else {
            attackManager = 1;
        }
        if (bossCh.y % 50 === 0) {
            for (let i = 0; i < 10; i++) {
                bossBalls.push({
                    x: bossCh.x + boss.width / 2,
                    y: bossCh.y + boss.height / 2 - ball.height / 2 + bossBall.height * 4 - i * bossBall.height
                })
            }
        }
    }
}

function startGame() {
    let select = document.getElementById('difficult');
    let level = parseInt(select.options[select.selectedIndex].value);
    let points = '0';
    let showText=true;

    let birdCh = {
        img: bird,
        x: cnv.width / 2 - bird.width / 2,
        y: (cnv.height - fg.height) / 2 - bird.height / 2
    };
    let bossCh={
        img: boss,
        x: cnv.width,
        y: (cnv.height-fg.height)/2-boss.height,
        hp: 100
    };
    run = true;
    let pipes = [{
        x:cnv.width,
        y:getPipeY()
    },{
        x:cnv.width + 200,
        y:getPipeY()
    }];
    let coins = [{
        x: pipes[0].x + pipeTop.width / 2 - coin.width / 2,
        y: pipes[0].y + pipeTop.height + hole / 2 - coin.height / 2
    },{
        x: pipes[1].x + pipeTop.width / 2 - coin.width / 2,
        y: pipes[1].y + pipeTop.height + hole / 2 - coin.height / 2
    }];

    function draw() {
        ctx.drawImage(bg, 0, 0);
        for (let i=0;i<balls.length;i++){
            if(balls[i].x>bossCh.x && balls[i].x<bossCh.x+boss.width && balls[i].y+ball.height>bossCh.y && balls[i].y<bossCh.y+boss.height){
                balls.splice(i, 1);
                i--;
                bossCh.hp-=12/level;
                if (bossCh.hp<=0){
                    bossCh.hp=0;
                    run=false;
                    win=true;
                }
            }
        }
        if (points===bossPoint){

            if (pipes[0].x <= 0 - pipeTop.width && points + 1 && birdCh.x >= 25) {
                birdCh.x--;
            }
            if(birdCh.x<=25){
                showText=false;
                ctx.drawImage(bossCh.img,bossCh.x,bossCh.y);
                ctx.fillStyle="#FF0000";
                ctx.strokeRect(44,25,cnv.width-88,10);
                ctx.fillRect(44,25,cnv.width-88 + bossCh.hp*2 - 200 ,10);
                if(bossCh.x>=cnv.width-boss.width-25){
                    bossCh.x--;
                }else {
                    attackOne(bossCh);
                    attackTwo(bossCh);
                }
            }
        }
        if (birdCh.y < 0) {
            birdCh.y = 0;
        }
        if (birdCh.y >= cnv.height - fg.height - bird.height) {
            birdCh.y -= 10
        } else {
            birdCh.y += level;
            if(flyScore > 0) {
                let nm = 5 * level;
                flyScore-= nm;
                birdCh.y -= nm;
            }
        }
        ctx.drawImage(birdCh.img, birdCh.x, birdCh.y);

        if(balls.length > 0 && balls[0].x > cnv.width) {
            balls.shift();
        }
        for (let i = 0; i<balls.length; i++){
            ctx.drawImage(ball,balls[i].x,balls[i].y);
            balls[i].x++;
        }

        for (let i = 0; i<bossBalls.length; i++){
            ctx.drawImage(bossBall,bossBalls[i].x,bossBalls[i].y);
            bossBalls[i].x-=2;
            if (bossBalls[i].x-bossBall.width>birdCh.x && bossBalls[i].x<birdCh.x+bird.width && bossBalls[i].y+bossBall.height>birdCh.y && bossBalls[i].y<birdCh.y+bird.height){
                run=false;
            }
        }
        if(bossBalls.length > 0 && bossBalls[0].x < 0) {
            bossBalls.shift();
        }

        for (let i = 0; i < pipes.length; i++) {
            if(points === bossPoint && i < bossPoint) {
                ctx.drawImage(pipeTop, pipes[i].x, pipes[i].y);
                ctx.drawImage(pipeBottom, pipes[i].x, pipes[i].y + hole + pipeTop.height);
                pipes[i].x -= level;
            } else {
                if (points < bossPoint) {
                    ctx.drawImage(pipeTop, pipes[i].x, pipes[i].y);
                    ctx.drawImage(pipeBottom, pipes[i].x, pipes[i].y + hole + pipeTop.height);
                    pipes[i].x -= level;
                }
            }

            if (points < bossPoint) {
                ctx.drawImage(coin, coins[i].x, coins[i].y);
                coins[i].x -= level;
                if (pipes[i].x <= 0 - pipeTop.width && points + 1) {
                    pipes[i].x += 400;
                    pipes[i].y = getPipeY();
                    coins[i].y = pipes[i].y + pipeTop.height + hole / 2 - coin.height / 2;
                }
                if (birdCh.x + bird.width >= pipes[i].x && birdCh.x <= pipes[i].x + pipeTop.width) {
                    if (birdCh.y <= pipes[i].y + pipeTop.height || birdCh.y + bird.height >= pipes[i].y + pipeTop.height + hole) {
                        run = false;
                    }
                }
                if (birdCh.x + bird.width >= coins[i].x) {
                    score.play();
                    coins[i].x += 400;
                    points++;
                }
            }
        }

        ctx.drawImage(fg, 0, cnv.height - fg.height);
        if(showText) {
            ctx.fillText(points, cnv.width / 2 - 10, 75);
            ctx.strokeText(points, cnv.width / 2 - 10, 75);
        }
        if(run) {
            requestAnimationFrame(draw);
        }else{
            if(win) {
                ctx.fillStyle="#28ff28";
                ctx.fillText('YOU WIN!', 20, cnv.height-fg.height/2+20);
                ctx.strokeText('YOU WIN!', 20, cnv.height-fg.height/2+20);
            } else {
                if (points > record) {
                    record = points;
                    document.cookie = encodeURIComponent("max") + "=" + encodeURIComponent(record);
                }
                ctx.drawImage(R,50,(cnv.height-fg.height)/2-R.height/2);
                ctx.drawImage(re,R.width+75,(cnv.height-fg.height)/2-re.height/2);
                ctx.fillText('max ' + record, cnv.width / 2 - 75, cnv.height - fg.height / 2 + 25);
                ctx.strokeText('max ' + record, cnv.width / 2 - 75, cnv.height - fg.height / 2 + 25);
            }

        }
    }

    function restart(){
        targetLevel=-10;
        attackManager=1;

        ctx.fillStyle = '#fff';
        bossBalls=[];
        balls=[];
        select = document.getElementById('difficult');
        level = parseInt(select.options[select.selectedIndex].value);
        points = '0';
        showText=true;

        birdCh = {
            img: bird,
            x: cnv.width / 2 - bird.width / 2,
            y: (cnv.height - fg.height) / 2 - bird.height / 2
        };
        bossCh={
            img: boss,
            x: cnv.width,
            y: (cnv.height-fg.height)/2-boss.height,
            hp: 100
        };
        run = true;
        pipes = [{
            x:cnv.width,
            y:getPipeY()
        },{
            x:cnv.width + 200,
            y:getPipeY()
        }];
        coins = [{
            x: pipes[0].x + pipeTop.width / 2 - coin.width / 2,
            y: pipes[0].y + pipeTop.height + hole / 2 - coin.height / 2
        },{
            x: pipes[1].x + pipeTop.width / 2 - coin.width / 2,
            y: pipes[1].y + pipeTop.height + hole / 2 - coin.height / 2
        }];
        draw();
    }

    document.addEventListener("keydown", function (event) {
        if (event.code==='KeyR' && !run){
            restart();
        }
        if (points===bossPoint){
            if (event.code==='ArrowDown'){
                birdCh.y+=20;
            }
            if (event.code==='ArrowUp'){
                flyScore = 20;
            }
        }else{
            if (event.code==='Space' || event.code==='ArrowUp') {
                flyScore = 20;
                fly.play();
            }}
    });

    document.addEventListener("keyup", function (event) {
        if (points===bossPoint){
            if (event.code==='Space') {
                if(balls.length===0 || balls[balls.length-1].x>birdCh.x+bird.width/2+10){
                    balls.push({
                        x: birdCh.x+bird.width/2,
                        y: birdCh.y+bird.height/2-ball.height/2
                    })}
            }
        }
    });

    document.addEventListener("touchstart", function (event) {
        flyScore = 20;
        fly.play();
        if (points===bossPoint){
            if(balls.length===0 || balls[balls.length-1].x>birdCh.x+bird.width/2+10){
                balls.push({
                    x: birdCh.x+bird.width/2,
                    y: birdCh.y+bird.height/2-ball.height/2
                })}
        }
        if (!run){
            restart();
        }
    });

    draw();
}

function getCookie(name) {
    let matches = document.cookie.match(new RegExp(
        "(?:^|; )" + name.replace(/([\.$?*|{}\(\)\[\]\\\/\+^])/g, '\\$1') + "=([^;]*)"
    ));
    return matches ? decodeURIComponent(matches[1]) : undefined;
}

function openSettings(){
    document.getElementById('playBtn').style.display='none';
    document.getElementById('difficult').style.display='block';
    document.getElementById('settings').style.display='none';
    document.getElementById('close-settings').style.display='block'
}

function closeSettings(){
    document.getElementById('playBtn').style.display='block';
    document.getElementById('difficult').style.display='none';
    document.getElementById('settings').style.display='block';
    document.getElementById('close-settings').style.display='none'
}



