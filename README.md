[![Photo](https://cdn.dribbble.com/users/3800131/screenshots/6901484/_____2019-08-02___4.01.34_4x.png)](https://dribbble.com/raychangdesign)

# Elegant Vanilla JS Calculator

> 我並非這美術設計的原創，感謝 instagram @uixperience 的作品參考，才實現了這優雅計算機的外觀。在互動的部分，我讓按鍵在按下時減少陰影，並加深按鍵背景的顏色，這樣就像是真的被按了下去一樣；另外，在顯示計算結果的部分，透過 JS 增減 CSS class 的方式隨時做出文字響應式設計；以及按 C 鍵清除數字時，讓使用者享受到俐落動畫所帶來的流暢使用體驗；另外在細節設定上，透過 JS 讓重複輸入運算符時只顯示和計算最後一位，以及按下 = 鍵結算時只保留小數到第三位，這些細節都讓操作流程變得更好。雖然這次主題一開始是懷著配合漂亮外觀的 JS 實作，不過途中加入了許多自己的 UI/UX 設計，也做了許多陣列、字串和數字之間轉換的練習，是個令我感到成就感滿滿的作品！

- 使用預處理器 Pug、Sass 撰寫 HTML、CSS
- 使用原生 JavaScript 撰寫，並著重於物件導向式開發
- 透過 JS 即時顯示計算結果，相較於傳統計算機，操作更直覺方便
- 使用增減 HTML class 的方式做出文字響應式設計（數字長度超過螢幕時的自適應）
- 使用 CSS animation 做出流暢的清除動畫
- 透過 JS 讓重複輸入的運算符只顯示並計算最後一位，減少誤按導致計算錯誤的問題
- 使用 `Math.round` 確保計算精度，並在結算時自動四捨五入到小數第三位，方便觀看計算結果
- [線上版](https://raychang2017.github.io/elegant-vanilla-js-calculator/) / [CodePen 連結](https://codepen.io/raychang2017/full/jgLppK)