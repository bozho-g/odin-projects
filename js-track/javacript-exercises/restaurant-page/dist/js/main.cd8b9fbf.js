/*
 * ATTENTION: An "eval-source-map" devtool has been used.
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file with attached SourceMaps in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "./src/assets/img/background.jpg":
/*!***************************************!*\
  !*** ./src/assets/img/background.jpg ***!
  \***************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

module.exports = __webpack_require__.p + "assets/img/background.150ad9dd.jpg";

/***/ }),

/***/ "./src/index.js":
/*!**********************!*\
  !*** ./src/index.js ***!
  \**********************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("{__webpack_require__.r(__webpack_exports__);\n/* harmony import */ var _tabs_home_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./tabs/home.js */ \"./src/tabs/home.js\");\n/* harmony import */ var _tabs_menu_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./tabs/menu.js */ \"./src/tabs/menu.js\");\n/* harmony import */ var _tabs_contact_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./tabs/contact.js */ \"./src/tabs/contact.js\");\n\r\n\r\n\r\n\r\nconst tabFactories = {\r\n    home: _tabs_home_js__WEBPACK_IMPORTED_MODULE_0__[\"default\"],\r\n    menu: _tabs_menu_js__WEBPACK_IMPORTED_MODULE_1__[\"default\"],\r\n    contact: _tabs_contact_js__WEBPACK_IMPORTED_MODULE_2__[\"default\"],\r\n};\r\n\r\nconst content = document.getElementById('content');\r\nconst nav = document.querySelector('nav');\r\n\r\nfunction clearContent() {\r\n    content.innerHTML = '';\r\n}\r\n\r\nfunction setActiveButton(name) {\r\n    [...nav.querySelectorAll('button')].forEach(btn => {\r\n        btn.classList.toggle('active', btn.dataset.tab === name);\r\n    });\r\n}\r\n\r\nfunction loadTab(name) {\r\n    const factory = tabFactories[name];\r\n    if (!factory) return;\r\n    clearContent();\r\n    content.appendChild(factory());\r\n    setActiveButton(name);\r\n}\r\n\r\nnav.addEventListener('click', e => {\r\n    if (e.target.matches('button[data-tab]')) {\r\n        loadTab(e.target.dataset.tab);\r\n    }\r\n});\r\n\r\nloadTab('home');\r\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiLi9zcmMvaW5kZXguanMiLCJtYXBwaW5ncyI6Ijs7OztBQUF3QztBQUNBO0FBQ007QUFDOUM7QUFDQTtBQUNBLFVBQVUscURBQVU7QUFDcEIsVUFBVSxxREFBVTtBQUNwQixhQUFhLHdEQUFhO0FBQzFCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsQ0FBQztBQUNEO0FBQ0EiLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly9yZXN0YXVyYW50LXBhZ2UvLi9zcmMvaW5kZXguanM/YjYzNSJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgY3JlYXRlSG9tZSBmcm9tICcuL3RhYnMvaG9tZS5qcyc7XHJcbmltcG9ydCBjcmVhdGVNZW51IGZyb20gJy4vdGFicy9tZW51LmpzJztcclxuaW1wb3J0IGNyZWF0ZUNvbnRhY3QgZnJvbSAnLi90YWJzL2NvbnRhY3QuanMnO1xyXG5cclxuY29uc3QgdGFiRmFjdG9yaWVzID0ge1xyXG4gICAgaG9tZTogY3JlYXRlSG9tZSxcclxuICAgIG1lbnU6IGNyZWF0ZU1lbnUsXHJcbiAgICBjb250YWN0OiBjcmVhdGVDb250YWN0LFxyXG59O1xyXG5cclxuY29uc3QgY29udGVudCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdjb250ZW50Jyk7XHJcbmNvbnN0IG5hdiA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJ25hdicpO1xyXG5cclxuZnVuY3Rpb24gY2xlYXJDb250ZW50KCkge1xyXG4gICAgY29udGVudC5pbm5lckhUTUwgPSAnJztcclxufVxyXG5cclxuZnVuY3Rpb24gc2V0QWN0aXZlQnV0dG9uKG5hbWUpIHtcclxuICAgIFsuLi5uYXYucXVlcnlTZWxlY3RvckFsbCgnYnV0dG9uJyldLmZvckVhY2goYnRuID0+IHtcclxuICAgICAgICBidG4uY2xhc3NMaXN0LnRvZ2dsZSgnYWN0aXZlJywgYnRuLmRhdGFzZXQudGFiID09PSBuYW1lKTtcclxuICAgIH0pO1xyXG59XHJcblxyXG5mdW5jdGlvbiBsb2FkVGFiKG5hbWUpIHtcclxuICAgIGNvbnN0IGZhY3RvcnkgPSB0YWJGYWN0b3JpZXNbbmFtZV07XHJcbiAgICBpZiAoIWZhY3RvcnkpIHJldHVybjtcclxuICAgIGNsZWFyQ29udGVudCgpO1xyXG4gICAgY29udGVudC5hcHBlbmRDaGlsZChmYWN0b3J5KCkpO1xyXG4gICAgc2V0QWN0aXZlQnV0dG9uKG5hbWUpO1xyXG59XHJcblxyXG5uYXYuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBlID0+IHtcclxuICAgIGlmIChlLnRhcmdldC5tYXRjaGVzKCdidXR0b25bZGF0YS10YWJdJykpIHtcclxuICAgICAgICBsb2FkVGFiKGUudGFyZ2V0LmRhdGFzZXQudGFiKTtcclxuICAgIH1cclxufSk7XHJcblxyXG5sb2FkVGFiKCdob21lJyk7XHJcbiJdLCJuYW1lcyI6W10sInNvdXJjZVJvb3QiOiIifQ==\n//# sourceURL=webpack-internal:///./src/index.js\n\n}");

/***/ }),

/***/ "./src/tabs/contact.js":
/*!*****************************!*\
  !*** ./src/tabs/contact.js ***!
  \*****************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("{__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   \"default\": () => (/* binding */ createContact)\n/* harmony export */ });\nfunction createContact() {\r\n    const wrapper = document.createElement('div');\r\n    wrapper.className = 'tab contact-tab';\r\n\r\n    const heading = document.createElement('h2');\r\n    heading.textContent = 'Contact';\r\n\r\n    const phone = document.createElement('p');\r\n    phone.textContent = 'Phone: (555) 123-9876';\r\n\r\n    const addr = document.createElement('p');\r\n    addr.textContent = '123 Flavor Street, Taste City';\r\n\r\n    const hours = document.createElement('p');\r\n    hours.textContent = 'Open Daily: 8am - 10pm';\r\n\r\n    wrapper.append(heading, phone, addr, hours);\r\n    return wrapper;\r\n}\r\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiLi9zcmMvdGFicy9jb250YWN0LmpzIiwibWFwcGluZ3MiOiI7Ozs7QUFBZTtBQUNmO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsInNvdXJjZXMiOlsid2VicGFjazovL3Jlc3RhdXJhbnQtcGFnZS8uL3NyYy90YWJzL2NvbnRhY3QuanM/Zjg2NSJdLCJzb3VyY2VzQ29udGVudCI6WyJleHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBjcmVhdGVDb250YWN0KCkge1xyXG4gICAgY29uc3Qgd3JhcHBlciA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xyXG4gICAgd3JhcHBlci5jbGFzc05hbWUgPSAndGFiIGNvbnRhY3QtdGFiJztcclxuXHJcbiAgICBjb25zdCBoZWFkaW5nID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnaDInKTtcclxuICAgIGhlYWRpbmcudGV4dENvbnRlbnQgPSAnQ29udGFjdCc7XHJcblxyXG4gICAgY29uc3QgcGhvbmUgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdwJyk7XHJcbiAgICBwaG9uZS50ZXh0Q29udGVudCA9ICdQaG9uZTogKDU1NSkgMTIzLTk4NzYnO1xyXG5cclxuICAgIGNvbnN0IGFkZHIgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdwJyk7XHJcbiAgICBhZGRyLnRleHRDb250ZW50ID0gJzEyMyBGbGF2b3IgU3RyZWV0LCBUYXN0ZSBDaXR5JztcclxuXHJcbiAgICBjb25zdCBob3VycyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3AnKTtcclxuICAgIGhvdXJzLnRleHRDb250ZW50ID0gJ09wZW4gRGFpbHk6IDhhbSAtIDEwcG0nO1xyXG5cclxuICAgIHdyYXBwZXIuYXBwZW5kKGhlYWRpbmcsIHBob25lLCBhZGRyLCBob3Vycyk7XHJcbiAgICByZXR1cm4gd3JhcHBlcjtcclxufVxyXG4iXSwibmFtZXMiOltdLCJzb3VyY2VSb290IjoiIn0=\n//# sourceURL=webpack-internal:///./src/tabs/contact.js\n\n}");

/***/ }),

/***/ "./src/tabs/home.js":
/*!**************************!*\
  !*** ./src/tabs/home.js ***!
  \**************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("{__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   \"default\": () => (/* binding */ createHome)\n/* harmony export */ });\n/* harmony import */ var _assets_img_background_jpg__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../assets/img/background.jpg */ \"./src/assets/img/background.jpg\");\n\r\n\r\nfunction createHome() {\r\n    const wrapper = document.createElement('div');\r\n    wrapper.className = 'tab home-tab';\r\n\r\n    const heading = document.createElement('h1');\r\n    heading.textContent = 'My Restaurant';\r\n    const tagline = document.createElement('p');\r\n    tagline.textContent = 'Serving vibes, flavor, and dangerously good coffee.';\r\n    const img = document.createElement('img');\r\n    img.src = _assets_img_background_jpg__WEBPACK_IMPORTED_MODULE_0__; // processed by Webpack asset modules\r\n    img.alt = 'Restaurant interior';\r\n\r\n    wrapper.append(heading, tagline, img);\r\n    return wrapper;\r\n}\r\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiLi9zcmMvdGFicy9ob21lLmpzIiwibWFwcGluZ3MiOiI7Ozs7O0FBQXlEO0FBQ3pEO0FBQ2U7QUFDZjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsY0FBYyx1REFBYSxFQUFFO0FBQzdCO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly9yZXN0YXVyYW50LXBhZ2UvLi9zcmMvdGFicy9ob21lLmpzP2YxNDciXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IGJhY2tncm91bmRJbWcgZnJvbSAnLi4vYXNzZXRzL2ltZy9iYWNrZ3JvdW5kLmpwZyc7XHJcblxyXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBjcmVhdGVIb21lKCkge1xyXG4gICAgY29uc3Qgd3JhcHBlciA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xyXG4gICAgd3JhcHBlci5jbGFzc05hbWUgPSAndGFiIGhvbWUtdGFiJztcclxuXHJcbiAgICBjb25zdCBoZWFkaW5nID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnaDEnKTtcclxuICAgIGhlYWRpbmcudGV4dENvbnRlbnQgPSAnTXkgUmVzdGF1cmFudCc7XHJcbiAgICBjb25zdCB0YWdsaW5lID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgncCcpO1xyXG4gICAgdGFnbGluZS50ZXh0Q29udGVudCA9ICdTZXJ2aW5nIHZpYmVzLCBmbGF2b3IsIGFuZCBkYW5nZXJvdXNseSBnb29kIGNvZmZlZS4nO1xyXG4gICAgY29uc3QgaW1nID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnaW1nJyk7XHJcbiAgICBpbWcuc3JjID0gYmFja2dyb3VuZEltZzsgLy8gcHJvY2Vzc2VkIGJ5IFdlYnBhY2sgYXNzZXQgbW9kdWxlc1xyXG4gICAgaW1nLmFsdCA9ICdSZXN0YXVyYW50IGludGVyaW9yJztcclxuXHJcbiAgICB3cmFwcGVyLmFwcGVuZChoZWFkaW5nLCB0YWdsaW5lLCBpbWcpO1xyXG4gICAgcmV0dXJuIHdyYXBwZXI7XHJcbn1cclxuIl0sIm5hbWVzIjpbXSwic291cmNlUm9vdCI6IiJ9\n//# sourceURL=webpack-internal:///./src/tabs/home.js\n\n}");

/***/ }),

/***/ "./src/tabs/menu.js":
/*!**************************!*\
  !*** ./src/tabs/menu.js ***!
  \**************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("{__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   \"default\": () => (/* binding */ createMenu)\n/* harmony export */ });\nfunction createMenu() {\r\n    const wrapper = document.createElement('div');\r\n    wrapper.className = 'tab menu-tab';\r\n\r\n    const heading = document.createElement('h2');\r\n    heading.textContent = 'Menu';\r\n\r\n    const list = document.createElement('ul');\r\n    const items = [\r\n        { name: 'Espresso', info: 'Rich and bold', price: '$3' },\r\n        { name: 'Avocado Toast', info: 'Sourdough + lime chili', price: '$7' },\r\n        { name: 'House Ramen', info: 'Slow broth, fresh noodles', price: '$12' },\r\n    ];\r\n\r\n    items.forEach(i => {\r\n        const li = document.createElement('li');\r\n        li.innerHTML = `<strong>${i.name}</strong> - ${i.info} <span class=\"price\">${i.price}</span>`;\r\n        list.appendChild(li);\r\n    });\r\n\r\n    wrapper.append(heading, list);\r\n    return wrapper;\r\n}\r\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiLi9zcmMvdGFicy9tZW51LmpzIiwibWFwcGluZ3MiOiI7Ozs7QUFBZTtBQUNmO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxVQUFVLHNEQUFzRDtBQUNoRSxVQUFVLG9FQUFvRTtBQUM5RSxVQUFVLHNFQUFzRTtBQUNoRjtBQUNBO0FBQ0E7QUFDQTtBQUNBLGtDQUFrQyxPQUFPLGNBQWMsUUFBUSxzQkFBc0IsUUFBUTtBQUM3RjtBQUNBLEtBQUs7QUFDTDtBQUNBO0FBQ0E7QUFDQSIsInNvdXJjZXMiOlsid2VicGFjazovL3Jlc3RhdXJhbnQtcGFnZS8uL3NyYy90YWJzL21lbnUuanM/ZGEyMCJdLCJzb3VyY2VzQ29udGVudCI6WyJleHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBjcmVhdGVNZW51KCkge1xyXG4gICAgY29uc3Qgd3JhcHBlciA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xyXG4gICAgd3JhcHBlci5jbGFzc05hbWUgPSAndGFiIG1lbnUtdGFiJztcclxuXHJcbiAgICBjb25zdCBoZWFkaW5nID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnaDInKTtcclxuICAgIGhlYWRpbmcudGV4dENvbnRlbnQgPSAnTWVudSc7XHJcblxyXG4gICAgY29uc3QgbGlzdCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3VsJyk7XHJcbiAgICBjb25zdCBpdGVtcyA9IFtcclxuICAgICAgICB7IG5hbWU6ICdFc3ByZXNzbycsIGluZm86ICdSaWNoIGFuZCBib2xkJywgcHJpY2U6ICckMycgfSxcclxuICAgICAgICB7IG5hbWU6ICdBdm9jYWRvIFRvYXN0JywgaW5mbzogJ1NvdXJkb3VnaCArIGxpbWUgY2hpbGknLCBwcmljZTogJyQ3JyB9LFxyXG4gICAgICAgIHsgbmFtZTogJ0hvdXNlIFJhbWVuJywgaW5mbzogJ1Nsb3cgYnJvdGgsIGZyZXNoIG5vb2RsZXMnLCBwcmljZTogJyQxMicgfSxcclxuICAgIF07XHJcblxyXG4gICAgaXRlbXMuZm9yRWFjaChpID0+IHtcclxuICAgICAgICBjb25zdCBsaSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2xpJyk7XHJcbiAgICAgICAgbGkuaW5uZXJIVE1MID0gYDxzdHJvbmc+JHtpLm5hbWV9PC9zdHJvbmc+IC0gJHtpLmluZm99IDxzcGFuIGNsYXNzPVwicHJpY2VcIj4ke2kucHJpY2V9PC9zcGFuPmA7XHJcbiAgICAgICAgbGlzdC5hcHBlbmRDaGlsZChsaSk7XHJcbiAgICB9KTtcclxuXHJcbiAgICB3cmFwcGVyLmFwcGVuZChoZWFkaW5nLCBsaXN0KTtcclxuICAgIHJldHVybiB3cmFwcGVyO1xyXG59XHJcbiJdLCJuYW1lcyI6W10sInNvdXJjZVJvb3QiOiIifQ==\n//# sourceURL=webpack-internal:///./src/tabs/menu.js\n\n}");

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/define property getters */
/******/ 	(() => {
/******/ 		// define getter functions for harmony exports
/******/ 		__webpack_require__.d = (exports, definition) => {
/******/ 			for(var key in definition) {
/******/ 				if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/global */
/******/ 	(() => {
/******/ 		__webpack_require__.g = (function() {
/******/ 			if (typeof globalThis === 'object') return globalThis;
/******/ 			try {
/******/ 				return this || new Function('return this')();
/******/ 			} catch (e) {
/******/ 				if (typeof window === 'object') return window;
/******/ 			}
/******/ 		})();
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	(() => {
/******/ 		__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	(() => {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = (exports) => {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/publicPath */
/******/ 	(() => {
/******/ 		var scriptUrl;
/******/ 		if (__webpack_require__.g.importScripts) scriptUrl = __webpack_require__.g.location + "";
/******/ 		var document = __webpack_require__.g.document;
/******/ 		if (!scriptUrl && document) {
/******/ 			if (document.currentScript && document.currentScript.tagName.toUpperCase() === 'SCRIPT')
/******/ 				scriptUrl = document.currentScript.src;
/******/ 			if (!scriptUrl) {
/******/ 				var scripts = document.getElementsByTagName("script");
/******/ 				if(scripts.length) {
/******/ 					var i = scripts.length - 1;
/******/ 					while (i > -1 && (!scriptUrl || !/^http(s?):/.test(scriptUrl))) scriptUrl = scripts[i--].src;
/******/ 				}
/******/ 			}
/******/ 		}
/******/ 		// When supporting browsers where an automatic publicPath is not supported you must specify an output.publicPath manually via configuration
/******/ 		// or pass an empty string ("") and set the __webpack_public_path__ variable from your code to use your own logic.
/******/ 		if (!scriptUrl) throw new Error("Automatic publicPath is not supported in this browser");
/******/ 		scriptUrl = scriptUrl.replace(/^blob:/, "").replace(/#.*$/, "").replace(/\?.*$/, "").replace(/\/[^\/]+$/, "/");
/******/ 		__webpack_require__.p = scriptUrl + "../";
/******/ 	})();
/******/ 	
/************************************************************************/
/******/ 	
/******/ 	// startup
/******/ 	// Load entry module and return exports
/******/ 	// This entry module can't be inlined because the eval-source-map devtool is used.
/******/ 	var __webpack_exports__ = __webpack_require__("./src/index.js");
/******/ 	
/******/ })()
;