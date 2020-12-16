'use strict';

document.onselectstart = () => {
  return false;
};
document.ondragstart = () => {
  return false;
};
document.oncontextmenu = () => {
  return false;
};

class Calculator {
  constructor() {
    this.inputArray = [];
    this.tempOperator = '';
    this.inputElement = document.querySelector('.input');
    this.resultElement = document.querySelector('.result');
    this.btnElements = document.querySelectorAll('.btn');
    this.textviewElement = document.querySelector('.textview');
    this.clickSound = new Audio('https://raw.githubusercontent.com/rayc2045/vanilla-calculator/master/audio/click.mp3');
    this.events();
  }

  events() {
    this.initializeAppearance();

    this.btnElements.forEach((el) => {
      el.addEventListener('click', (e) => this.runButtonFunctions(e));

      document.body.clientWidth <= 1024
        ? el.addEventListener('touchstart', () => this.playSound())
        : el.addEventListener('mousedown', () => this.playSound());
    });
  }

  initializeAppearance() {
    this.inputElement.textContent = '';
    this.resultElement.textContent = '0';
    this.fontSizeAdjust();
  }

  runButtonFunctions(e) {
    if (this.textviewElement.classList.contains('allclear')) return;

    // console.log(e.target.textContent);
    if (this.inputArray.length === 0) {
      if (
        e.target.textContent === 'C' ||
        e.target.textContent === '☞' ||
        e.target.textContent === '=' ||
        e.target.textContent === 'O'
      )
        return;

      if (
        e.target.textContent === '%' ||
        e.target.textContent === '÷' ||
        e.target.textContent === '✕' ||
        e.target.textContent === '–' ||
        e.target.textContent === '＋' ||
        e.target.textContent === '.'
      )
        this.inputArray.push('0');
    }

    if (e.target.textContent === 'C') return this.clearAll();
    if (e.target.textContent === '☞') return this.clearOne();
    if (e.target.textContent === '=') return this.equals();

    this.replacePreviousOperator(e);
    this.preventNumberStartWithZero(e);
    this.showInput(e.target.textContent);
    try {
      this.showResult(); // 使用 eval() 計算時，算式最後為加減乘除會報錯。
    } catch (error) {}
    this.fontSizeAdjust();
  }

  replacePreviousOperator(e) {
    const lastItem = this.inputArray[this.inputArray.length - 1];

    if (
      e.target.textContent === '%' ||
      e.target.textContent === '÷' ||
      e.target.textContent === '✕' ||
      e.target.textContent === '–' ||
      e.target.textContent === '＋' ||
      e.target.textContent === '.'
    ) {
      if (
        lastItem === ' ÷ ' ||
        lastItem === ' X ' ||
        lastItem === ' – ' ||
        lastItem === ' ＋ ' ||
        lastItem === '.'
      )
        this.inputArray.length--;
    }
    // slice() 不改變原陣列
    // this.inputArray = this.inputArray.slice(0, this.inputArray.length - 1)
    // splice() 改變原陣列
    // this.inputArray.splice(-1, 1)
  }

  preventNumberStartWithZero(e) {
    const lastItem = this.inputArray[this.inputArray.length - 1];
    const lastSecondItem = this.inputArray[this.inputArray.length - 2];

    // Example: 9 X 0(2)
    if (
      e.target.textContent === 'O' ||
      e.target.textContent === '1' ||
      e.target.textContent === '2' ||
      e.target.textContent === '3' ||
      e.target.textContent === '4' ||
      e.target.textContent === '5' ||
      e.target.textContent === '6' ||
      e.target.textContent === '7' ||
      e.target.textContent === '8' ||
      e.target.textContent === '9'
    ) {
      if (
        (lastItem === '0' && lastSecondItem === ' ÷ ') ||
        (lastItem === '0' && lastSecondItem === ' X ') ||
        (lastItem === '0' && lastSecondItem === ' – ') ||
        (lastItem === '0' && lastSecondItem === ' ＋ ') ||
        (lastItem === '0' && lastSecondItem === '%')
      )
        this.inputArray.length--;
    }
  }

  clearAll() {
    // inputArray = []; // 一開始就清除會讓計算結果出現 NaN，在清除動畫運行時再偷偷清空
    this.textviewElement.classList.add('allclear');

    setTimeout(() => {
      this.inputArray = [];
      this.initializeAppearance();
      this.textviewElement.classList.remove('allclear');
    }, 700);
  }

  clearOne() {
    if (this.inputArray.length === 0) {
      return;
    }

    if (this.inputArray.length === 1) {
      this.inputArray = [];
      this.inputElement.textContent = '';
      this.resultElement.textContent = '0';
      this.fontSizeAdjust();
      return;
    }

    this.inputArray.length--;
    this.evalCalculationCorrect();
    this.inputElement.textContent = this.inputArray.join('');
    this.showResult();
    this.recoveryDeletedOperator();
    this.fontSizeAdjust();
  }

  evalCalculationCorrect() {
    const lastItem = this.inputArray[this.inputArray.length - 1];

    if (
      lastItem === ' ÷ ' ||
      lastItem === ' X ' ||
      lastItem === ' – ' ||
      lastItem === ' ＋ ' ||
      lastItem === '.'
    ) {
      this.tempOperator = lastItem;
      this.inputArray.length--;
    }
  }

  recoveryDeletedOperator() {
    if (this.tempOperator.length) {
      this.inputArray.push(this.tempOperator);
      this.inputElement.textContent = this.inputArray.join('');
      this.tempOperator = '';
    }
  }

  equals() {
    this.inputElement.textContent = '';

    if (this.resultElement.textContent === '0') {
      this.inputArray = [];
    } else {
      // 將計算結果拆掉千分位並只保留三位小數點，再更新 inputArray 輸出結果
      const numWithThreeFloat = Math.round(this.resultElement.textContent.replace(/,/g, '') * 1e3) / 1e3;

      this.inputArray = numWithThreeFloat.toString().split(''); // String.split('') => Array
      this.showResult();
      this.fontSizeAdjust();
    }
  }

  showInput(text) {
    this.inputArray.push(
      text
        .replace('O', '0')
        .replace('÷', ' ÷ ')
        .replace('✕', ' X ')
        .replace('–', ' – ')
        .replace('＋', ' ＋ ') // 因按下任何按鍵就 push 文字到陣列中，所以使用單次替換即可
    );

    this.inputElement.textContent = this.inputArray.join('');
  }

  showResult() {
    const calculatableString = this.inputArray
      .join('')
      .replace(/÷/g, '/')
      .replace(/X/g, '*')
      .replace(/–/g, '-')
      .replace(/＋/g, '+')
      .replace(/%/g, '* 0.01')
      .replace(/[^-()\d/*+.]/g, ''); // 無視加減乘除符號才能讓 eval 函數計算字串（全局替換 http://www.w3school.com.cn/jsref/jsref_replace.asp）

    const resultNumber = Math.round(eval(calculatableString) * 1e12) / 1e12;
    // 小數點留到第 12 位以確保計算準確，可輸入 0.1 + 0.2 測試（不精確計算 https://zh.javascript.info/number#bu-jing-que-ji-suan）
    // const resultNumber = +eval(calculatableString).toFixed(12); // 相較於 Math.round()，toFixed() 存在精度缺失（https://zh.javascript.info/number#wei-shi-mo-6-35tofixed-1-6-3）；此外 toFixed() 會將資料轉成字串，如果不再轉為數字，將產生 .000000000000

    this.resultElement.textContent = this.thousandFormat(resultNumber);
  }

  thousandFormat(num) {
    const parts = num.toString().split('.');
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    return parts.join('.');
  }

  fontSizeAdjust() {
    const resultLength = this.resultElement.textContent.length;

    if (resultLength > 15) {
      this.resultElement.classList.remove('mediumText');
      this.resultElement.classList.remove('smallText');
      this.resultElement.classList.add('verySmallText');
      return;
    }

    if (resultLength > 11) {
      this.resultElement.classList.remove('mediumText');
      this.resultElement.classList.add('smallText');
      this.resultElement.classList.remove('verySmallText');
      return;
    }

    if (resultLength > 7) {
      this.resultElement.classList.add('mediumText');
      this.resultElement.classList.remove('smallText');
      this.resultElement.classList.remove('verySmallText');
      return;
    }

    this.resultElement.classList.remove('mediumText');
    this.resultElement.classList.remove('smallText');
    this.resultElement.classList.remove('verySmallText');
  }

  playSound() {
    this.clickSound.currentTime = 0;
    this.clickSound.play();
  }
}

new Calculator();
