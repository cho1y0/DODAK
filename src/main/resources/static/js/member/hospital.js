/**
 * hospital.js - 병원 검색/등록/수정 모달 관련 JavaScript
 * 기능: 병원 검색, 병원 등록, 병원 수정, 병원 선택
 */

// DOM 요소 캐시
let hospitalModal, newHospitalForm, hospitalSearchResults;
let newHospitalId, newHospitalName, newHospitalTel;
let newHospitalZipCode, newHospitalAddr1, newHospitalAddr2;
let hospitalNameInput, hospitalIdInput;

// 병원 검색 API 호출
function searchHospitals() {
    const searchKeyword = document.getElementById('hospitalSearchInput');
    const keyword = searchKeyword ? searchKeyword.value.trim() : '';

    $.ajax({
        url: '/api/hospitals/search',
        method: 'GET',
        data: { name: keyword },
        success: function(hospitals) {
            renderHospitalResults(hospitals);
        },
        error: function(xhr, status, error) {
            console.error('병원 검색 오류:', error);
            alert('병원 검색 중 오류가 발생했습니다.');
        }
    });
}

// 병원 검색 결과 렌더링
function renderHospitalResults(hospitals) {
    const resultsDiv = $('#hospitalSearchResults');
    resultsDiv.empty();

    if (hospitals.length === 0) {
        resultsDiv.html('<p class="text-muted text-center py-3">검색 결과가 없습니다.</p>');
        return;
    }

    hospitals.forEach(hospital => {
        const item = `
            <div class="hospital-item p-3 mb-2 border rounded">
                <div class="d-flex justify-content-between align-items-center">
                    <div>
                        <h6 class="hospital-name mb-1 fw-bold">${hospital.hospName}</h6>
                        <p class="mb-0 text-muted small">${hospital.addr1 || ''} ${hospital.addr2 || ''}</p>
                        <p class="mb-0 text-muted small">Tel: ${hospital.tel || '-'}</p>
                    </div>
                    <div>
                        <button class="btn btn-success btn-sm select-hospital-btn me-1"
                                data-hospital-id="${hospital.hospIdx}"
                                data-hospital-name="${hospital.hospName.replace(/'/g, "\\'")}">선택</button>
                        <button class="btn btn-info btn-sm edit-hospital-btn"
                                data-hospital-id="${hospital.hospIdx}">수정</button>
                    </div>
                </div>
            </div>
        `;
        resultsDiv.append(item);
    });
}

// 병원 저장 (등록/수정)
function saveHospital() {
    const hospitalData = {
        hostIdx: newHospitalId ? newHospitalId.value : '',
        hospName: newHospitalName ? newHospitalName.value : '',
        zipCode: newHospitalZipCode ? newHospitalZipCode.value : '',
        addr1: newHospitalAddr1 ? newHospitalAddr1.value : '',
        addr2: newHospitalAddr2 ? newHospitalAddr2.value : '',
        tel: newHospitalTel ? newHospitalTel.value : ''
    };

    // 필수 필드 검사
    if (!hospitalData.hospName || !hospitalData.tel || !hospitalData.zipCode || !hospitalData.addr1) {
        alert('필수 정보를 모두 입력해주세요.');
        return;
    }

    const isNewHospital = !hospitalData.hostIdx || hospitalData.hostIdx === '0';
    const url = isNewHospital ? '/api/hospitals/save' : `/api/hospitals/${hospitalData.hostIdx}`;
    const method = isNewHospital ? 'POST' : 'PUT';

    fetch(url, {
        method: method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(hospitalData)
    })
    .then(response => {
        if (!response.ok) {
            return response.json().then(err => {
                throw new Error(err.message || (isNewHospital ? '병원 등록 실패' : '병원 수정 실패'));
            });
        }
        return response.json();
    })
    .then(newHospital => {
        const actionText = isNewHospital ? '등록' : '수정';
        alert(`'${newHospital.hospName}' 병원이 성공적으로 ${actionText}되었습니다.`);
        searchHospitals();
        if (newHospitalForm) {
            newHospitalForm.style.display = 'none';
        }
    })
    .catch(error => {
        const actionText = isNewHospital ? '등록' : '수정';
        console.error(`병원 ${actionText} 중 오류 발생:`, error);
        alert(`병원 ${actionText} 중 오류가 발생했습니다: ${error.message}`);
    });
}

// 병원 상세 정보 로드 (수정용)
function loadHospitalDetail(hospitalId) {
    $.ajax({
        url: `/api/hospitals/${hospitalId}`,
        method: 'GET',
        contentType: 'application/json',
        dataType: 'json',
        success: function(hospitalData) {
            if (newHospitalId) newHospitalId.value = hospitalData.hospIdx || '';
            if (newHospitalName) newHospitalName.value = hospitalData.hospName || '';
            if (newHospitalTel) newHospitalTel.value = hospitalData.tel || '';
            if (newHospitalZipCode) newHospitalZipCode.value = hospitalData.zipCode || '';
            if (newHospitalAddr1) newHospitalAddr1.value = hospitalData.addr1 || '';
            if (newHospitalAddr2) newHospitalAddr2.value = hospitalData.addr2 || '';

            if (newHospitalForm) {
                newHospitalForm.style.display = 'block';
            }
            if (hospitalModal) {
                hospitalModal.style.display = 'flex';
            }
        },
        error: function(xhr, status, error) {
            console.error('병원 조회 중 오류 발생:', status, error);
            let errorMessage = '병원 조회 중 오류가 발생했습니다.';
            if (xhr.responseJSON && xhr.responseJSON.message) {
                errorMessage = xhr.responseJSON.message;
            }
            alert(errorMessage);
        }
    });
}

// 병원 선택 처리
function selectHospital(hospitalId, hospitalName) {
    if (hospitalNameInput) hospitalNameInput.value = hospitalName;
    if (hospitalIdInput) hospitalIdInput.value = hospitalId;

    if (hospitalModal) hospitalModal.style.display = 'none';
    if (newHospitalForm) newHospitalForm.style.display = 'none';
}

// 병원 폼 초기화
function clearHospitalForm() {
    if (newHospitalId) newHospitalId.value = '';
    if (newHospitalName) newHospitalName.value = '';
    if (newHospitalTel) newHospitalTel.value = '';
    if (newHospitalZipCode) newHospitalZipCode.value = '';
    if (newHospitalAddr1) newHospitalAddr1.value = '';
    if (newHospitalAddr2) newHospitalAddr2.value = '';
}

// 주소 검색 (다음 우편번호 API)
function searchHospitalAddress() {
    new daum.Postcode({
        oncomplete: function(data) {
            if (newHospitalZipCode) newHospitalZipCode.value = data.zonecode;
            if (newHospitalAddr1) newHospitalAddr1.value = data.roadAddress;
            if (newHospitalAddr2) newHospitalAddr2.focus();
        }
    }).open();
}

// 이벤트 리스너 초기화
function initializeHospitalEvents() {
    // 병원 검색 모달 열기
    const openHospitalModalBtn = document.getElementById('openHospitalModalBtn');
    if (openHospitalModalBtn) {
        openHospitalModalBtn.addEventListener('click', () => {
            if (newHospitalId) newHospitalId.value = '0';
            if (hospitalModal) hospitalModal.style.display = 'flex';
        });
    }

    // 모달 닫기 버튼들
    const closeHospitalModalBtns = document.querySelectorAll('#hospitalModal .close-button, #closeHospitalModalBtn');
    closeHospitalModalBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            if (hospitalModal) hospitalModal.style.display = 'none';
            if (newHospitalForm) newHospitalForm.style.display = 'none';
        });
    });

    // 모달 외부 클릭 시 닫기
    window.addEventListener('click', (event) => {
        if (event.target === hospitalModal) {
            hospitalModal.style.display = 'none';
            if (newHospitalForm) newHospitalForm.style.display = 'none';
        }
    });

    // 병원 검색 버튼
    const searchHospitalBtn = document.getElementById('searchHospitalBtn');
    if (searchHospitalBtn) {
        searchHospitalBtn.addEventListener('click', function() {
            searchHospitals();
            if (hospitalSearchResults) hospitalSearchResults.style.display = 'block';
        });
    }

    // 새 병원 등록 폼 열기
    const openAddHospitalFormBtn = document.getElementById('openAddHospitalFormBtn');
    if (openAddHospitalFormBtn) {
        openAddHospitalFormBtn.addEventListener('click', () => {
            clearHospitalForm();
            if (newHospitalForm) newHospitalForm.style.display = 'block';
        });
    }

    // 새 병원 등록 취소
    const cancelAddHospitalBtn = document.getElementById('cancelAddHospitalBtn');
    if (cancelAddHospitalBtn) {
        cancelAddHospitalBtn.addEventListener('click', () => {
            if (newHospitalForm) newHospitalForm.style.display = 'none';
        });
    }

    // 병원 저장 버튼
    const saveNewHospitalBtn = document.getElementById('saveNewHospitalBtn');
    if (saveNewHospitalBtn) {
        saveNewHospitalBtn.addEventListener('click', function(e) {
            e.preventDefault();
            saveHospital();
        });
    }

    // 병원 주소 검색 버튼
    const searchNewHospitalZipCodeBtn = document.getElementById('searchNewHospitalZipCodeBtn');
    if (searchNewHospitalZipCodeBtn) {
        searchNewHospitalZipCodeBtn.addEventListener('click', function(e) {
            e.preventDefault();
            searchHospitalAddress();
        });
    }

    // 병원 선택/수정 버튼 이벤트 위임
    if (hospitalSearchResults) {
        hospitalSearchResults.addEventListener('click', function(event) {
            if (event.target.classList.contains('select-hospital-btn')) {
                const hospitalItem = event.target.closest('.hospital-item');
                const selectedHospitalName = hospitalItem.querySelector('.hospital-name').textContent;
                const selectedHospitalId = event.target.dataset.hospitalId;
                selectHospital(selectedHospitalId, selectedHospitalName);
            } else if (event.target.classList.contains('edit-hospital-btn')) {
                const hospitalIdToEdit = event.target.dataset.hospitalId;
                loadHospitalDetail(hospitalIdToEdit);
            }
        });
    }
}

// 병원 모듈 초기화
function initializeHospital() {
    // DOM 요소 캐싱
    hospitalModal = document.getElementById('hospitalModal');
    newHospitalForm = document.getElementById('newHospitalForm');
    hospitalSearchResults = document.getElementById('hospitalSearchResults');

    newHospitalId = document.getElementById('newHospitalId');
    newHospitalName = document.getElementById('newHospitalName');
    newHospitalTel = document.getElementById('newHospitalTel');
    newHospitalZipCode = document.getElementById('newHospitalZipCode');
    newHospitalAddr1 = document.getElementById('newHospitalAddr1');
    newHospitalAddr2 = document.getElementById('newHospitalAddr2');

    hospitalNameInput = document.getElementById('hospNameDisplay');
    hospitalIdInput = document.getElementById('hospIdx');

    // 초기 모달 숨김
    if (hospitalModal) hospitalModal.style.display = 'none';

    initializeHospitalEvents();
}

// DOM 로드 완료 시 초기화
document.addEventListener('DOMContentLoaded', initializeHospital);
