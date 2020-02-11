'use strict';

class Calculator {
	constructor() {
		this.inputArray = [];
		this.events();
	}

	events() {
		this.initializeAppearance();
		this.runButtonFunctions();
	}

	initializeAppearance() {
		$('.input').text('');
		$('.result').text('0');
		this.fontSizeAdjust();
	}

	runButtonFunctions() {
		const self = this; // 造把梯子通向閉包的深淵

		$('.btn').mousedown(function() {
			if (self.inputArray.length === 0) {
				if (
					$(this).text() === 'C' ||
					$(this).text() === '☞' ||
					$(this).text() === '=' ||
					$(this).text() === 'O'
				)
					return;

				if (
					$(this).text() === '%' ||
					$(this).text() === '÷' ||
					$(this).text() === '✕' ||
					$(this).text() === '–' ||
					$(this).text() === '＋' ||
					$(this).text() === '.'
				)
					self.inputArray.push(0);
			}

			if ($(this).text() === 'C') return self.clearAll();
			if ($(this).text() === '☞') return self.backOne();
			if ($(this).text() === '=') return self.equals();

			const lastChar = self.inputArray[self.inputArray.length - 1];

			if (
				lastChar === ' ÷ ' ||
				lastChar === ' X ' ||
				lastChar === ' – ' ||
				lastChar === ' ＋ ' ||
				lastChar === '.'
			) {
				if (
					$(this).text() === '%' ||
					$(this).text() === '÷' ||
					$(this).text() === '✕' ||
					$(this).text() === '–' ||
					$(this).text() === '＋' ||
					$(this).text() === '.'
				)
					self.inputArray.length -= 1;

					// slice() 不改變原陣列
					// self.inputArray = self.inputArray.slice(0, self.inputArray.length - 1)

					// splice() 改變原陣列
					// self.inputArray.splice(-1, 1)
			}
			// console.log(self.inputArray[self.inputArray.length - 1])

			self.showInput($(this));

			try {
				self.showResult();
			}
			catch(err) {
				console.log(err + ':\n使用 eval() 計算時，當算式最後為加減乘除，報錯。');
			}

			self.fontSizeAdjust();
		});
	}

	clearAll() {
		const self = this;
		// inputArray = []; // 一開始就清除會讓計算結果出現 NaN，在清除動畫運行時再偷偷清空
		$('.textview').addClass('allclear');

		setTimeout(function() {
			self.inputArray = [];
			self.initializeAppearance();
			$('.textview').removeClass('allclear');
		}, 1000);
	}

	backOne() {
		if (this.inputArray.length === 0) {
			return;
		} else if (this.inputArray.length === 1) {
			this.inputArray = [];
			$('.input').text('');
			$('.result').text('0');
		} else {
			this.inputArray.length -= 1; // inputArray.splice(-1, 1)
			$('.input').text(this.inputArray.join(''));
			this.showResult();
		}

		this.fontSizeAdjust();
	}

	equals() {
		$('.input').text('');

		if ($('.result').text() === '0') {
			this.inputArray = [];
		} else {
			// 將計算結果拆掉千分位並只保留三位小數點，再更新 inputArray 輸出結果
			const numWithThreeFloat = Math.round($('.result').text().replace(/,/g, '') * 1e3) / 1e3;

			this.inputArray = numWithThreeFloat.toString().split(''); // String.split('') => Array
			this.showResult();
			this.fontSizeAdjust();
		}
	}

	showInput(div) {
		this.inputArray.push(
			div.text()
			.replace('O', '0')
			.replace('÷', ' ÷ ')
			.replace('✕', ' X ')
			.replace('–', ' – ')
			.replace('＋', ' ＋ ') // 因按下任何按鍵就 push 文字到陣列中，所以使用單次替換即可
		);

		$('.input').text(this.inputArray.join(''));
	}

	showResult() {
		const calculatableString = this.inputArray.join('')
			.replace(/÷/g, '/')
			.replace(/X/g, '*')
			.replace(/–/g, '-')
			.replace(/＋/g, '+')
			.replace(/%/g, '* 0.01')
			.replace(/[^-()\d/*+.]/g, ''); // 無視加減乘除符號才能讓 eval 函數計算字串（全局替換 http://www.w3school.com.cn/jsref/jsref_replace.asp）

		const resultNumber = Math.round(eval(calculatableString) * 1e12) / 1e12; // 小數點留到第 12 位以確保計算準確，可輸入 0.1 + 0.2 測試（不精確計算 https://zh.javascript.info/number#bu-jing-que-ji-suan）
		
		// const resultNumber = +eval(calculatableString).toFixed(12); // 相較於 Math.round()，toFixed() 存在精度缺失（https://zh.javascript.info/number#wei-shi-mo-6-35tofixed-1-6-3）；此外 toFixed() 會將資料轉成字串，如果不再轉為數字，將產生 .000000000000
		
		$('.result').text(this.thousandFormat(resultNumber));
	}

	// 保持小數點的千分位顯示
	thousandFormat(num) {
		num += '';
		if (!num.includes('.')) num += '.';
		return num
			.replace(/(\d)(?=(\d{3})+\.)/g, function($0, $1) {
				return $1 + ',';
			})
			.replace(/\.$/, '');
	}

	fontSizeAdjust() {
		const resultLength = $('.result').text().length;

		if (resultLength > 15) {
			$('.result').removeClass('mediumText').removeClass('smallText').addClass('verySmallText');
		} else if (resultLength > 11) {
			$('.result').removeClass('mediumText').addClass('smallText').removeClass('verySmallText');
		} else if (resultLength > 7) {
			$('.result').addClass('mediumText').removeClass('smallText').removeClass('verySmallText');
		} else {
			$('.result').removeClass('mediumText').removeClass('smallText').removeClass('verySmallText');
		}
	}
}

let calculator = new Calculator();