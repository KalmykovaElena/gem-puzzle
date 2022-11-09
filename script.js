const wrapper = document.createElement('div')
const board = document.createElement('div')
wrapper.classList.add('wrapper')
board.classList.add('board')
let size = 4
let numbers
let randomNumbers
let time = '00:00'

const controlButtons = document.createElement('div')
//________________Control Buttons_______________________________________________________________
controlButtons.classList.add('conrolButtons')
const restartButton = document.createElement('button')
restartButton.textContent = 'Restart'
controlButtons.append(restartButton)
const infoButton = document.createElement('button')
infoButton.textContent = 'Info'
controlButtons.append(infoButton)
const resultsButton = document.createElement('button')
resultsButton.textContent = 'Results'
controlButtons.append(resultsButton)
//______________________________________________________________________________________________
let isSoundPlay = true
let soundImg = "./assets/sound-off.png"

const score = document.createElement('div')
score.classList.add('score')
score.innerHTML = `
    <div class="moves">Moves: <span class="moves-count">0</span> </div>
    <div class="time">Time: <span class="time-count">00:00</span></div>
    <img class="playSound" src=${soundImg} }' alt="#">
`
const sizeButtons = document.createElement('div')
sizeButtons.classList.add('size-buttons')
sizeButtons.innerHTML = `
<div class="size-buttons">
    <div class="frame-size">Frame size <span class="countSize">4x4</span></div>
    <div class="choose-size" >Other sizes
        <ul class="size-items">
            <li ><a class="item-size" href="#">3x3</a></li>
            <li ><a class="item-size" href="#">4x4</a></li>
            <li ><a class="item-size" href="#">5x5</a></li>
            <li ><a class="item-size" href="#">6x6</a></li>
            <li ><a class="item-size" href="#">7x7</a></li>
            <li ><a class="item-size" href="#">8x8</a></li>
        </ul>
    </div>
</div>
`
document.body.append(wrapper)
wrapper.append(controlButtons)
wrapper.append(score)
wrapper.append(board)
wrapper.append(sizeButtons)
document.querySelector('.playSound').addEventListener('click', (e) => {
    isSoundPlay = !isSoundPlay
    localStorage.setItem('isSoundPlay', isSoundPlay)
    checkImageSound(e.target)
})
let emptyButtonPosition
let movesCount = document.querySelector('.moves-count')
let moves = 0
let buttonClassName = 0
let bestResults = {}
let timer = document.querySelector('.time-count')
let drops

//_______________Модальное окно__________________________________________________________________________
let overlay = document.createElement('div')
overlay.classList.add('overlay')
document.body.prepend(overlay)
let modal = document.createElement('div')
modal.classList.add('modal')
document.body.append(modal)

//____________Генерация правильных позиций_______________________________________________________________
let wrapperInfo = document.createElement('div')
wrapperInfo.classList.add('wrapperInfo')
let createRightPositions = document.createElement('button')
createRightPositions.classList.add('checkButton')
createRightPositions.textContent = "Auto Win"
wrapperInfo.prepend(createRightPositions)
document.body.prepend(wrapperInfo)

createRightPositions.addEventListener('click', () => {
    randomNumbers = numbers
    createGamePosition(numbers)
})

//_________Results__________________________________________________________________________
let resultsList = document.createElement('div')
resultsList.classList.add('resultsTable')


function checkImageSound(e) {
    if (isSoundPlay) {
        e.src = "./assets/sound-off.png"
    } else {
        e.src = "./assets/sound-on.png"
    }
}

function checkCorrectPosition(arr) {
    let sum = 0
    for (let i = 0; i < arr.length - 1; i++) {
        for (let j = i + 1; j < arr.length - 1; j++)
            if (arr[i] > arr[j]) sum++
    }
    return sum
}


function shuffle(array) {
    let newArr = [...array]
    for (let i = newArr.length - 2; i > 0; i--) {
        let j = Math.floor(Math.random() * (i + 1));
        [newArr[i], newArr[j]] = [newArr[j], newArr[i]];
    }
    if (checkCorrectPosition(newArr) % 2 !== 0) newArr = shuffle(newArr)
    return newArr
}


function createGamePosition(numbers) {
    board.replaceChildren()
    let k = 0
    for (let i = 0; i < size; i++) {
        for (let j = 0; j < size; j++) {
            let button = document.createElement('button')
            button.innerHTML = randomNumbers[k]
            button.dataset.numberButton = k
            // if (buttonClassName) button.classList.add(buttonClassName)//??????
            if (checkDraggublePosition(randomNumbers, k, size)) {
                button.draggable = true
                button.classList.add('drop')
            }
            board.append(button)
            button.classList.add('button')
            let sizeButton = board.getBoundingClientRect().width / (size + 1)//px
            button.style.width = button.style.height = (sizeButton / (board.getBoundingClientRect().width / 100)) + '%'
            if(size<6) {
                button.classList.add('small-button')
            }
            // button.style.fontSize=+button.style.width.slice(0,1)/100 +'%'

            if (button.innerHTML == 0) {
                button.classList.add('empty-button')
                emptyButtonPosition = k
            }
            k++
        }
    }
    let btn = document.querySelector('.empty-button')
    btn.addEventListener('dragover', function (event) {
        event.preventDefault();
    })
    drops = document.querySelectorAll('.drop')
    let startCursorX;
    let startCursorY;
    let startX;
    let startY;

    drops.forEach(el => {
        el.addEventListener('dragstart', function (event) {
            startCursorX = event.pageX;//Начальная позиция курсора по оси X
            startCursorY = event.pageY;//Начальная позиция курсора по оси Y
            startX = el.style.marginLeft.replace('px', '') * 1; // Нам нужны только цыфры без PX
            startY = el.style.marginTop.replace('px', '') * 1;
        });
        el.addEventListener('dragend', function (event) {
            playSound('./audio/drop.mp3')
            let pos = +el.dataset.numberButton
            move(pos, 0)
            setTimeout(() => {
                el.style.position = 'relative';//CSS теперь элемент "Блуждающий" :)
                el.style.marginLeft = startX + event.pageX - startCursorX + 'px'; //позиция элемента + позиция курсора - позиция курсоа в начале перетаскивания
                el.style.marginTop = startY + event.pageY - startCursorY + 'px'; // Так же как и в предыдущем случае, только по другой оси
            }, 0)

        });
    })

    if (checkCorrectPosition(randomNumbers) == 0) {
        bestResults[moves] = time
        if(localStorage.getItem('bestResults')){
            let existResults=JSON.parse(localStorage.getItem('bestResults'))
            localStorage.setItem('bestResults', JSON.stringify({...existResults, ...bestResults}))
        }else {
            localStorage.setItem('bestResults', JSON.stringify(bestResults))
        }
        let modalInner =
            `
<div>
<div>Ура! Вы решили головоломку</div>
 <div>за ${time} и ${moves} ходов!</div>
 </div>
`
        showModal(modalInner)
        clearCountingTime()
        // wrapper.classList.add('hide')
    }

}

function checkDraggublePosition(arr, pos, size) {
    if (arr[pos + size] == 0 || arr[pos - size] == 0 ||
        arr[pos + 1] == 0 && ((pos + 1) % size !== 0) ||
        arr[pos - 1] == 0 && (pos % size !== 0)) {
        return true
    } else {
        return false
    }
}

window.addEventListener('load', () => {

    if (localStorage.getItem('isSoundPlay')) {
        isSoundPlay = localStorage.getItem('isSoundPlay') == 'true' ? true : false
        let e = document.querySelector('.playSound')
        checkImageSound(e)
    }
    if (localStorage.getItem('moves')) {
        moves = +localStorage.getItem('moves')
        movesCount.innerHTML = moves
    }
    if (localStorage.getItem('sec')) {
        let min = Number(localStorage.getItem('min'))
        let sec = Number(localStorage.getItem('sec'))
        clearCountingTime()
        countingTime(min, sec)
    }
    if (localStorage.getItem('size')) {
        size = +localStorage.getItem('size')
        startGame(size)
        console.log(size)
    }
    if (localStorage.getItem('numbersPosition')) {
        randomNumbers = localStorage.getItem('numbersPosition').split(',')
        createGamePosition(numbers)
    }else {
        startGame(size)
    }
})

function startGame(size) {
    numbers = new Array(size ** 2).fill(null).map((el, ind) => ind == size ** 2 - 1 ? el = 0 : el = ind + 1)
    randomNumbers = shuffle(numbers)
    createGamePosition(numbers)
    document.querySelector('.countSize').innerHTML = size + 'x' + size
}

sizeButtons.addEventListener('click', (e) => {
    if (e.target.classList.contains('item-size')) {
        clearCountingTime()
        timer.innerHTML = '00:00'
        size = Number(e.target.textContent.split('')[0])
        localStorage.setItem('size', size)
        delete localStorage.positionsOnBoard
        delete localStorage.moves
        delete localStorage.numbersPosition
        moves = 0
        movesCount.innerHTML = moves
        startGame(size)
    }
})

board.addEventListener('click', e => {

    let pos = +e.target.dataset.numberButton
    if (pos + size === emptyButtonPosition) {
        playSound('./audio/eedd6c993df467a.mp3')
        move(pos, 500)
        e.target.classList.add('replace-down')
    } else if (pos - size === emptyButtonPosition) {
        playSound('./audio/eedd6c993df467a.mp3')
        move(pos, 500)
        e.target.classList.add('replace-up')
    } else if (pos + 1 === emptyButtonPosition && (+e.target.dataset.numberButton + 1) % size !== 0) {
        playSound('./audio/eedd6c993df467a.mp3')
        move(pos, 500)
        e.target.classList.add('replace-right')
    } else if (pos - 1 === emptyButtonPosition && (+e.target.dataset.numberButton) % size !== 0) {
        playSound('./audio/eedd6c993df467a.mp3')
        move(pos, 500)
        e.target.classList.add('replace-left')
    }
})

function move(pos, time) {
    moves++
    movesCount.innerHTML = moves
    localStorage.setItem('moves', moves)
    if (moves == 1) {
        clearCountingTime()
        countingTime(0, 0)
    }
    setTimeout(() => {
        [randomNumbers[pos], randomNumbers[emptyButtonPosition]] = [randomNumbers[emptyButtonPosition], randomNumbers[pos]]
        localStorage.setItem('numbersPosition', randomNumbers)
        createGamePosition(numbers)

    }, time)
}

let timerId;

function countingTime(min, sec) {

    function go() {
        sec++;
        if (sec >= 60) {
            sec = 0;
            min++;
        }
        localStorage.setItem('min', min)
        localStorage.setItem('sec', sec)
        time = (min > 9 ? min : '0' + min) + ':' + (sec > 9 ? sec : '0' + sec)
        timer.innerHTML = time
    }

    go()
    timerId = setInterval(go, 1000);

}

function clearCountingTime() {
    clearInterval(timerId)
    delete localStorage.min
    delete localStorage.sec
}

function showModal(modalInner) {
    wrapper.classList.add('hide')
    modal.innerHTML = modalInner
    let modalButton =document.createElement('div')
    modalButton.classList.add('modal-button')
    modalButton.classList.add('restart')
    modalButton.innerHTML='Начать новую игру'
    modal.append(modalButton)
    modalButton.addEventListener('click', () => {
        modal.classList.remove('show')
        overlay.classList.remove('show')
        clearCountingTime()
        timer.innerHTML = '00:00'
        delete localStorage.positionsOnBoard
        delete localStorage.moves
        moves = 0
        movesCount.innerHTML = moves
        wrapper.classList.remove('hide')
        startGame(size)
    })

    modal.classList.add('show')
    overlay.classList.add('show')
}

restartButton.addEventListener('click', () => {
    restartGame()
})

function restartGame() {
    clearCountingTime()
    timer.innerHTML = '00:00'
    delete localStorage.positionsOnBoard
    delete localStorage.moves
    moves = 0
    movesCount.innerHTML = moves

    startGame(size)
}

resultsButton.addEventListener('click', () => {
    let min = Number(localStorage.getItem('min'))
    let sec = Number(localStorage.getItem('sec'))
    let modalInner
    clearCountingTime()
    if(!localStorage.getItem('bestResults')){
       modalInner=`
     <div>No results</div>
    
     <div class="modal-button continue">Продолжить</div>
    `
    }else{
        let objOfResults = JSON.parse(localStorage.getItem('bestResults'))
        let arrayOfMoves = Object.keys(objOfResults)
        let results = arrayOfMoves.map((e, i) => {
            return e = `
        <div class="resultsItem">
        <div>moves: ${e}</div>
        <div>time : ${objOfResults[e]}
        </div>
        </div>
        `
        }).slice(0, 10).join('')
      modalInner=`
     <div>Best results</div>
     ${results}
     <div class="modal-button continue">Продолжить</div>
    `

    }

    showModal(modalInner)
    continueGame(min,sec)
})
infoButton.addEventListener('click', () => {
    let min=0
    let sec=0
    if(localStorage.getItem('sec')){
        min = Number(localStorage.getItem('min'))
        sec = Number(localStorage.getItem('sec'))
    }
    clearCountingTime()
    let modalInner=`
     <div>Информация</div>
     <div class="modal-description">Цель игры - собрать все цифры по возрастанию начиная с верхнего левого угла</div>
     <div class="modal-description">Для передвижения фишек Вы можете кликнуть мышкой по фишке рядом с пустой ячейкой, либо перетянуть мышкой доступную фишку на свободное место</div>
     <div class="modal-description">Для запуска таймера должен быть сделан хотябы один ход</div>
     <div class="modal-button continue">Продолжить</div>
    `



    showModal(modalInner)
    continueGame(min,sec)
})
function continueGame(min,sec){
    let continueButton=modal.querySelector('.continue')
    continueButton.addEventListener('click',()=>{
        modal.classList.remove('show')
        overlay.classList.remove('show')
        wrapper.classList.remove('hide')
        countingTime(min, sec)

    })
}
function playSound(soundObj) {
    let sound = new Audio(soundObj)
    if (isSoundPlay) {
        sound.play();
    }

}