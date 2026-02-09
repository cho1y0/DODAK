/**
 * navbar.js - 공통 네비게이션 바 JavaScript
 * 기능: 네비게이션 바 호버 효과, 탭 이벤트 처리, 중증 환자 알림
 */

// 네비게이션 바 호버 효과 초기화
function initializeNavbar() {
    const customNavbar = document.querySelector('.custom-navbar');
    const menucon = document.getElementById("menucon");

    if (customNavbar && menucon) {
        customNavbar.addEventListener('mouseover', function() {
            menucon.style.display = "block";
        });

        customNavbar.addEventListener('mouseout', function() {
            menucon.style.display = "none";
        });
    }
}

// 현재 페이지에 맞는 네비게이션 링크 활성화
function setActiveNavLink() {
    const currentPath = window.location.pathname;
    const navLinks = document.querySelectorAll('.custom-nav-link');

    navLinks.forEach(link => {
        const href = link.getAttribute('href') || link.getAttribute('data-href');
        if (href && currentPath.includes(href.replace('/member/', '').replace('/doctor/', ''))) {
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }
    });
}

// 중증 환자 목록 로드 (의사용)
async function loadSeverePatients() {
    const dangerAlertList = document.getElementById('dangerAlertList');
    const dangerAlertIcon = document.getElementById('dangerAlertIcon');
    const memberIdEl = document.getElementById('memberId');

    if (!dangerAlertList || !memberIdEl) return;

    const memberId = memberIdEl.value;
    if (!memberId) return;

    try {
        // 중증 환자 API 호출 (patientStatus = 2)
        const response = await fetch(`/api/members/severe/${memberId}`);

        let severePatients = [];
        if (response.ok && response.status !== 204) {
            severePatients = await response.json();
        }

        // 목록 렌더링
        if (severePatients.length === 0) {
            dangerAlertList.innerHTML = `
                <h6 class="dropdown-header text-danger">
                    <i class="bi bi-exclamation-triangle-fill me-1"></i> 심층 면담 필요 환자
                </h6>
                <li class="px-3 py-2 text-muted text-center">
                    <i class="bi bi-check-circle me-1"></i> 중증 환자가 없습니다.
                </li>
            `;
            // 아이콘 색상 변경 (초록색)
            if (dangerAlertIcon) {
                dangerAlertIcon.innerHTML = '<i class="bi bi-check-circle-fill text-success" style="font-size: 1.2em" title="중증 환자 없음"></i>';
            }
        } else {
            let listHtml = `
                <h6 class="dropdown-header text-danger">
                    <i class="bi bi-exclamation-triangle-fill me-1"></i> 심층 면담 필요 환자 (${severePatients.length}명)
                </h6>
            `;

            severePatients.forEach(patient => {
                listHtml += `
                    <li class="severe-patient-item px-3 py-2 border-bottom" style="cursor: pointer;" data-patient-id="${patient.id}">
                        <div class="d-flex justify-content-between align-items-center">
                            <span class="fw-bold">${patient.name}</span>
                            <span class="badge bg-danger">중증</span>
                        </div>
                        <small class="text-muted">${patient.userId}</small>
                    </li>
                `;
            });

            dangerAlertList.innerHTML = listHtml;

            // 아이콘에 뱃지 추가
            if (dangerAlertIcon) {
                dangerAlertIcon.innerHTML = `
                    <i class="bi bi-exclamation-triangle-fill text-danger" style="font-size: 1.2em" title="주의: 심층 면담 필요 환자 ${severePatients.length}명"></i>
                    <span class="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger" style="font-size: 0.6em;">
                        ${severePatients.length}
                    </span>
                `;
                dangerAlertIcon.style.position = 'relative';
            }

            // 환자 클릭 시 환자 통계 페이지로 이동
            dangerAlertList.querySelectorAll('.severe-patient-item').forEach(item => {
                item.addEventListener('click', function() {
                    const patientId = this.dataset.patientId;
                    // 환자 통계 페이지로 이동 (환자 ID 파라미터 포함)
                    window.location.href = `/doctor/patient-stats?patientId=${patientId}`;
                });
            });
        }
    } catch (error) {
        console.error('중증 환자 목록 로드 실패:', error);
        dangerAlertList.innerHTML = `
            <h6 class="dropdown-header text-danger">심층 면담 필요 환자</h6>
            <li class="px-3 py-2 text-muted">로드 실패</li>
        `;
    }
}

// DOM 로드 완료 시 초기화
document.addEventListener('DOMContentLoaded', function() {
    initializeNavbar();
    setActiveNavLink();

    // 의사 페이지인 경우 중증 환자 목록 로드
    if (window.location.pathname.startsWith('/doctor')) {
        loadSeverePatients();
    }
});

// 전역으로 노출
window.initializeNavbar = initializeNavbar;
window.setActiveNavLink = setActiveNavLink;
window.loadSeverePatients = loadSeverePatients;
