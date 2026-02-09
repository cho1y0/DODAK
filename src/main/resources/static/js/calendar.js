/**
 * calendar script
 */

(function() {
	const YEAR_START = new Date().getFullYear()-1;
	const YEAR_END = new Date().getFullYear();

	const yearSearch = document.getElementById('yearSearch');
	const monthSearch = document.getElementById('monthSearch');
	const daySearch = document.getElementById('daySearch');
	const yearList = document.getElementById('yearList');
	const monthList = document.getElementById('monthList');
	const dayList = document.getElementById('dayList');
	const selectedEl = document.getElementById('selected');

	// 필수 요소가 없으면 스크립트 실행 중단
	if (!yearList || !monthList || !dayList || !yearSearch || !monthSearch || !daySearch) {
		return;
	}

	let state = { year: null, month: null, day: null };

	const years = [];
	for (let y = YEAR_END; y >= YEAR_START; y--) { years.push(y); }
	const months = Array.from({ length: 12 }, (_, i) => i + 1);

	function renderList(listEl, items, formatter = x => x) {
		listEl.innerHTML = '';
		if (items.length === 0) { listEl.innerHTML = '<div style="padding:8px;color:var(--muted)">검색 결과가 없습니다.</div>'; return; }
		items.forEach(item => {
			const btn = document.createElement('button');
			btn.type = 'button';
			btn.textContent = formatter(item);
			btn.dataset.value = String(item);
			btn.addEventListener('click', () => onSelect(listEl, item));
			listEl.appendChild(btn);
		});
	}

	function filterNumeric(list, q) {
		if (!q) return list.slice();
		q = String(q).trim();
		return list.filter(x => String(x).indexOf(q) !== -1);
	}

	function onSelect(listEl, value) {
		if (listEl === yearList) { state.year = Number(value); state.month = null; state.day = null; yearSearch.value = state.year; renderMonths(); monthSearch.focus(); }
		else if (listEl === monthList) { state.month = Number(value); state.day = null; monthSearch.value = String(state.month).padStart(2, '0'); renderDays(); daySearch.focus(); }
		else if (listEl === dayList) { state.day = Number(value); daySearch.value = String(state.day).padStart(2, '0'); }
		updateSelected();
		hideAllLists();
	}

	function updateSelected() {
		if (state.year && state.month && state.day) {
			selectedEl.textContent = `${state.year}-${String(state.month).padStart(2, '0')}-${String(state.day).padStart(2, '0')}`;
		} else if (state.year && state.month) { selectedEl.textContent = `${state.year}년 ${state.month}월`; }
		else if (state.year) { selectedEl.textContent = `${state.year}년`; }
		else selectedEl.textContent = '없음';
	}

	function renderYears(q) { renderList(yearList, filterNumeric(years, q)); }
	function renderMonths(q) { renderList(monthList, filterNumeric(months, q), m => `${String(m).padStart(2, '0')}월`); }
	function daysInMonth(y, m) { return new Date(y, m, 0).getDate(); }
	function renderDays(q) {
		if (!state.year || !state.month) { dayList.innerHTML = '<div style="padding:8px;color:var(--muted)">먼저 연도와 월을 선택하세요.</div>'; return; }
		const total = daysInMonth(state.year, state.month);
		const arr = Array.from({ length: total }, (_, i) => i + 1);
		renderList(dayList, filterNumeric(arr, q), d => `${String(d).padStart(2, '0')}일`);
	}

	function showList(listEl) { hideAllLists(); listEl.classList.add('active'); }
	function hideAllLists() { [yearList, monthList, dayList].forEach(l => l.classList.remove('active')); }

	renderYears(); renderMonths(); renderDays(); updateSelected();

	yearSearch.addEventListener('input', e => { renderYears(e.target.value); showList(yearList); });
	monthSearch.addEventListener('input', e => { renderMonths(e.target.value); showList(monthList); });
	daySearch.addEventListener('input', e => { renderDays(e.target.value); showList(dayList); });

	[yearSearch, monthSearch, daySearch].forEach(inp => {
		inp.addEventListener('focus', () => {
			if (inp === yearSearch) showList(yearList);
			if (inp === monthSearch) showList(monthList);
			if (inp === daySearch) showList(dayList);
		});
	});

	document.addEventListener('click', e => {
		const target = e.target;
		const within = target.closest('.col');
		const isScroll = target.closest('.list');
		if (!within && !isScroll) { hideAllLists(); }
	});

	;['yearList', 'monthList', 'dayList'].forEach(id => {
		const list = document.getElementById(id);
		list.addEventListener('mousedown', e => {
			e.stopPropagation(); // 리스트 내부 클릭 시 닫힘 방지
		});
		list.addEventListener('scroll', e => {
			e.stopPropagation(); // 내부 스크롤 시 닫힘 방지
		});
	});

})();