'use strict';

class Calculator {
	constructor() {
		this.inputArray = [];
		this.inputElement = document.querySelector('.input');
		this.resultElement = document.querySelector('.result');
		this.btnElements = document.querySelectorAll('.btn');
		this.textviewElement = document.querySelector('.textview');
		this.clickSound = new Audio(
			'https://github.com/raychang2017/f2e-portfolio/blob/master/08%20-%20%E5%81%9A%E4%B8%80%E5%80%8B%E5%84%AA%E9%9B%85%E7%9A%84%20Vanilla%20JS%20%E8%A8%88%E7%AE%97%E6%A9%9F%EF%BC%8C%E5%8D%B3%E6%99%82%E9%A1%AF%E7%A4%BA%E8%A8%88%E7%AE%97%E7%B5%90%E6%9E%9C/audio/click.mp3?raw=true'
		); // ../audio/click.mp3
		this.events();
	}

	events() {
		this.initializeAppearance();

		// for (let i = 0; i < this.btnElements.length; i++) {
		// 	this.btnElements[i].addEventListener('click', (e) => {
		// 		this.runButtonFunctions(e);
		// 	});
		// }
		this.btnElements.forEach((el) => {
			if (document.body.clientWidth <= 1024) {
				el.addEventListener('touchstart', () => {
					this.playSound();
				}, {passive: true}); // Make event listeners passive to improve scrolling performance
			} else {
				el.addEventListener('mousedown', () => {
					this.playSound();
				});
			}

			el.addEventListener('click', (e) => {
				this.runButtonFunctions(e);
			});
		});
	}

	initializeAppearance() {
		this.inputElement.textContent = '';
		this.resultElement.textContent = '0';
		this.fontSizeAdjust();
	}

	runButtonFunctions(e) {
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
				this.inputArray.push(0);
		}

		if (e.target.textContent === 'C') return this.clearAll();
		if (e.target.textContent === '☞') return this.backOne();
		if (e.target.textContent === '=') return this.equals();

		const lastChar = this.inputArray[this.inputArray.length - 1];

		if (lastChar === ' ÷ ' || lastChar === ' X ' || lastChar === ' – ' || lastChar === ' ＋ ' || lastChar === '.') {
			if (
				e.target.textContent === '%' ||
				e.target.textContent === '÷' ||
				e.target.textContent === '✕' ||
				e.target.textContent === '–' ||
				e.target.textContent === '＋' ||
				e.target.textContent === '.'
			)
				this.inputArray.length -= 1;

			// slice() 不改變原陣列
			// this.inputArray = this.inputArray.slice(0, this.inputArray.length - 1)

			// splice() 改變原陣列
			// this.inputArray.splice(-1, 1)
		}
		// console.log(this.inputArray[this.inputArray.length - 1])

		this.showInput(e.target.textContent);

		try {
			this.showResult();
		} catch (err) {
			console.log(err + ':\n使用 eval() 計算時，當算式最後為加減乘除，報錯。');
		}

		this.fontSizeAdjust();
	}

	clearAll() {
		// inputArray = []; // 一開始就清除會讓計算結果出現 NaN，在清除動畫運行時再偷偷清空
		this.textviewElement.classList.add('allclear');

		setTimeout(() => {
			this.inputArray = [];
			this.initializeAppearance();
			this.textviewElement.classList.remove('allclear');
		}, 1000);
	}

	backOne() {
		if (this.inputArray.length === 0) {
			return;
		} else if (this.inputArray.length === 1) {
			this.inputArray = [];
			this.inputElement.textContent = '';
			this.resultElement.textContent = '0';
		} else {
			this.inputArray.length -= 1; // inputArray.splice(-1, 1)
			this.inputElement.textContent = this.inputArray.join('');
			this.showResult();
		}

		this.fontSizeAdjust();
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
			text.replace('O', '0').replace('÷', ' ÷ ').replace('✕', ' X ').replace('–', ' – ').replace('＋', ' ＋ ') // 因按下任何按鍵就 push 文字到陣列中，所以使用單次替換即可
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

		const resultNumber = Math.round(eval(calculatableString) * 1e12) / 1e12; // 小數點留到第 12 位以確保計算準確，可輸入 0.1 + 0.2 測試（不精確計算 https://zh.javascript.info/number#bu-jing-que-ji-suan）

		// const resultNumber = +eval(calculatableString).toFixed(12); // 相較於 Math.round()，toFixed() 存在精度缺失（https://zh.javascript.info/number#wei-shi-mo-6-35tofixed-1-6-3）；此外 toFixed() 會將資料轉成字串，如果不再轉為數字，將產生 .000000000000

		this.resultElement.textContent = this.thousandFormat(resultNumber);
	}

	thousandFormat(num) {
		num += '';
		if (!num.includes('.')) num += '.';
		return num
			.replace(/(\d)(?=(\d{3})+\.)/g, function($0, $1) {
				return $1 + ',';
			})
			.replace(/\.$/, '');
		// return (num).toLocaleString('en-US'); // 導致小數點後只被保留三位
	}

	fontSizeAdjust() {
		const resultLength = this.resultElement.textContent.length;

		if (resultLength > 15) {
			this.resultElement.classList.remove('mediumText');
			this.resultElement.classList.remove('smallText');
			this.resultElement.classList.add('verySmallText');
		} else if (resultLength > 11) {
			this.resultElement.classList.remove('mediumText');
			this.resultElement.classList.add('smallText');
			this.resultElement.classList.remove('verySmallText');
		} else if (resultLength > 7) {
			this.resultElement.classList.add('mediumText');
			this.resultElement.classList.remove('smallText');
			this.resultElement.classList.remove('verySmallText');
		} else {
			this.resultElement.classList.remove('mediumText');
			this.resultElement.classList.remove('smallText');
			this.resultElement.classList.remove('verySmallText');
		}
	}

	playSound() {
		this.clickSound.currentTime = 0;
		this.clickSound.play();
	}
}

let calculator = new Calculator();
