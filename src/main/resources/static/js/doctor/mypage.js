/**
 * doctor/mypage.js - 의사 마이페이지 JavaScript
 */

(function() {
    'use strict';

    let MEMBER_ID;
    let isEmailAvailable = true;

    const $ = (selector) => document.querySelector(selector);
    const $$ = (selector) => document.querySelectorAll(selector);

    // 전화번호 형식 검사
    function isHyphenPhoneNumber(phone) {
        const regex = /^0\d{1,2}-\d{3,4}-\d{4}$/;
        return regex.test(phone);
    }

    // 이메일 형식 검사
    function emailCheck(email_address) {
        const email_regex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/i;
        return email_regex.test(email_address);
    }

    // 이메일 유효성 검사
    function validateEmail() {
        const emailInput = $('#inputEmail');
        const email = emailInput.value;
        const emailMessage = $('#emailMessage');

        if (emailCheck(email)) {
            emailMessage.textContent = "유효한 이메일 주소입니다.";
            emailMessage.style.color = 'blue';
            checkEmail();
            return true;
        } else {
            emailMessage.textContent = "유효하지 않은 이메일 주소입니다.";
            emailMessage.style.color = 'red';
            isEmailAvailable = false;
            return false;
        }
    }

    // 이메일 중복 체크
    function checkEmail() {
        const email = $('#inputEmail').value;
        const emailCheckInput = $('#inputEmailCheck').value;
        const emailMessage = $('#emailMessage');

        if (emailCheckInput === email) {
            emailMessage.textContent = "사용 가능한 이메일입니다.";
            emailMessage.style.color = 'blue';
            isEmailAvailable = true;
            return true;
        }

        fetch(`/api/members/checkEmail?email=${encodeURIComponent(email)}`)
            .then(response => response.json())
            .then(response => {
                if (!response) {
                    emailMessage.textContent = "이메일이 중복되었습니다.";
                    emailMessage.style.color = 'red';
                    isEmailAvailable = false;
                } else {
                    emailMessage.textContent = "사용 가능한 이메일입니다.";
                    emailMessage.style.color = 'blue';
                    isEmailAvailable = true;
                }
            })
            .catch(error => {
                emailMessage.textContent = "통신 에러";
                console.error(error);
            });
    }

    // 비밀번호 일치 확인
    function checkPasswordMatch() {
        const passwordInput = $('#password');
        const passwordConfirmInput = $('#passwordConfirm');
        const passwordMatchText = $('#passwordMatchText');

        const password = passwordInput.value;
        const confirmPassword = passwordConfirmInput.value;

        if (password.length === 0 && confirmPassword.length === 0) {
            passwordMatchText.textContent = '';
            return true;
        }

        const minLength = 8;
        const maxLength = 20;

        if (password.length < minLength || password.length > maxLength) {
            passwordMatchText.textContent = `비밀번호는 ${minLength}~${maxLength}자 사이여야 합니다.`;
            passwordMatchText.style.color = '#dc3545';
            return false;
        }

        const hasLetter = /[a-zA-Z]/.test(password);
        const hasNumber = /[0-9]/.test(password);
        const hasSpecial = /[^a-zA-Z0-9]/.test(password);

        if (!hasLetter || !hasNumber || !hasSpecial) {
            passwordMatchText.textContent = "비밀번호는 영문, 숫자, 특수문자를 모두 포함해야 합니다.";
            passwordMatchText.style.color = '#dc3545';
            return false;
        }

        if (password === confirmPassword) {
            passwordMatchText.textContent = '비밀번호가 일치합니다.';
            passwordMatchText.style.color = '#007bff';
            return true;
        } else {
            passwordMatchText.textContent = '비밀번호가 일치하지 않습니다.';
            passwordMatchText.style.color = '#dc3545';
            return false;
        }
    }

    // 회원 정보 로드
    async function loadMemberData(memberId) {
        const apiUrl = `/api/members/info/${memberId}`;

        try {
            const response = await fetch(apiUrl);
            if (!response.ok) throw new Error('회원 정보를 불러오는 데 실패했습니다.');

            const member = await response.json();

            $('#inputId').value = member.userId;
            $('#inputId').readOnly = true;
            $('#inputName').value = member.name || '';
            $('#inputPhone').value = member.phone || '';
            $('#inputEmail').value = member.email || '';
            $('#inputEmailCheck').value = member.email || '';
            $('#zipCode').value = member.zipCode || '';
            $('#streetAdr').value = member.addr1 || '';
            $('#inputAddressDetail').value = member.addr2 || '';
            $('#roleSelect').value = member.role || 'DOCTOR';
            $('#roleSelect').disabled = true;

            // 의사 정보 표시
            $('#doctorInfoSection').style.display = 'block';
            $('#inputSpecialty').value = member.specialty || '';

            if (member.hospIdx) {
                $('#hospIdx').value = member.hospIdx;
                $('#hospNameDisplay').value = member.hospName;
            }

            if (member.agreementYn === 'Y') {
                $('#checkTerms3').checked = true;
                $('#agreements').value = 'Y';
            } else {
                $('#checkTerms3').checked = false;
                $('#agreements').value = 'N';
            }

            if (member.profileImg) {
                $('.profile-image').src = member.profileImg;
                $('#oldImgPath').value = member.profileImg;
            }

        } catch (error) {
            console.error("회원 정보 로드 오류:", error);
            alert("회원 정보를 가져오는 중 오류가 발생했습니다.");
        }
    }

    // 회원 정보 수정 제출
    function handleFormSubmit(e) {
        e.preventDefault();

        const inputName = $('#inputName').value;
        if (inputName.length === 0) {
            alert("이름 항목은 필수입니다.");
            $('#inputName').focus();
            return;
        }

        const pw = $('#password').value;
        const pwConfirm = $('#passwordConfirm').value;
        if (pw.length > 0 && pwConfirm.length > 0) {
            if (!checkPasswordMatch()) {
                alert("비밀번호를 확인해주세요.");
                $('#password').focus();
                return;
            }
        }

        if (!isHyphenPhoneNumber($('#inputPhone').value)) {
            alert("휴대전화번호 형식을 확인해 주세요. (010-XXXX-XXXX)");
            return;
        }

        // 의사 필수 정보 확인
        const hospIdx = $('#hospIdx').value;
        const inputSpecialty = $('#inputSpecialty').value;
        if (!hospIdx || !inputSpecialty) {
            alert("의사 회원은 병원 선택과 전문 분야 입력이 필수입니다.");
            return;
        }

        if ($('#checkTerms3').checked) {
            $('#agreements').value = "Y";
        } else {
            $('#agreements').value = "N";
        }

        const form = $('#registerForm');
        const formData = new FormData(form);
        formData.append('id', MEMBER_ID);
        formData.append('role', "DOCTOR");

        fetch('/api/members/update', {
            method: 'PUT',
            body: formData
        })
        .then(response => {
            if (response.status === 201) return response.json();
            throw new Error('회원 수정 실패: ' + response.status);
        })
        .then(savedMember => {
            alert(`회원 정보 수정 완료! 회원 이름: ${savedMember.name}`);
            loadMemberData(savedMember.id);
        })
        .catch(error => {
            console.error("에러 발생:", error);
            alert("정보 수정 중 오류가 발생했습니다.");
        });
    }

    // 환자 배정 관리 - 전역 데이터
    let allUnassignedPatients = [];
    let allAssignedPatients = [];
    let pendingUnassigned = []; // UI상 미배정 리스트
    let pendingAssigned = [];   // UI상 배정 리스트

    // 환자 배정 데이터 로드
    async function loadPatientAssignment() {
        try {
            // 미배정 환자 목록
            const unassignedResponse = await fetch(`/api/members/users/unassigned/${MEMBER_ID}`);
            allUnassignedPatients = [];
            if (unassignedResponse.ok && unassignedResponse.status !== 204) {
                allUnassignedPatients = await unassignedResponse.json();
            }

            // 배정된 환자 목록
            const assignedResponse = await fetch(`/api/members/users/assigned/${MEMBER_ID}`);
            allAssignedPatients = [];
            if (assignedResponse.ok && assignedResponse.status !== 204) {
                allAssignedPatients = await assignedResponse.json();
            }

            // 초기 상태 설정
            pendingUnassigned = [...allUnassignedPatients];
            pendingAssigned = [...allAssignedPatients];

            renderPatientLists();
            renderAssignedTable();

        } catch (error) {
            console.error('환자 배정 정보 로드 실패:', error);
        }
    }

    // 환자 리스트 렌더링
    function renderPatientLists(searchKeyword = '') {
        const unassignedContainer = $('#unassignedPatientList');
        const assignedContainer = $('#assignedPatientList');

        // 검색 필터 적용
        let filteredUnassigned = pendingUnassigned;
        if (searchKeyword) {
            filteredUnassigned = pendingUnassigned.filter(p =>
                p.name.toLowerCase().includes(searchKeyword.toLowerCase()) ||
                p.userId.toLowerCase().includes(searchKeyword.toLowerCase())
            );
        }

        // 미배정 환자 리스트
        if (filteredUnassigned.length === 0) {
            unassignedContainer.innerHTML = '<p class="text-muted text-center p-3">미배정 환자가 없습니다.</p>';
        } else {
            unassignedContainer.innerHTML = filteredUnassigned.map(patient => `
                <button type="button" class="list-group-item list-group-item-action" data-id="${patient.id}">
                    ${patient.name} (${patient.userId})
                </button>
            `).join('');
        }

        // 배정된 환자 리스트
        if (pendingAssigned.length === 0) {
            assignedContainer.innerHTML = '<p class="text-muted text-center p-3">배정된 환자가 없습니다.</p>';
        } else {
            assignedContainer.innerHTML = pendingAssigned.map(patient => `
                <button type="button" class="list-group-item list-group-item-action" data-id="${patient.id}">
                    ${patient.name} (${patient.userId})
                </button>
            `).join('');
        }

        // 클릭 이벤트 바인딩
        bindListItemEvents();
    }

    // 배정된 환자 테이블 렌더링
    function renderAssignedTable() {
        const tableBody = $('#assignedPatientTableBody');

        if (pendingAssigned.length === 0) {
            tableBody.innerHTML = `
                <tr id="noAssignedPatientsRow">
                    <td colspan="5" class="text-center text-muted p-3">
                        <i class="fas fa-info-circle me-2"></i> 현재 배정된 환자가 없습니다.
                    </td>
                </tr>
            `;
        } else {
            tableBody.innerHTML = pendingAssigned.map((patient, index) => {
                // 환자 상태: 1=경증(기본), 2=중증
                const patientStatus = patient.patientStatus || 1;
                const isSevere = patientStatus === 2;
                const statusBtn = isSevere
                    ? `<button class="btn btn-sm btn-danger patient-status-btn" data-member-id="${patient.id}" data-status="2" title="클릭하여 경증으로 변경">중증 🔥</button>`
                    : `<button class="btn btn-sm btn-success patient-status-btn" data-member-id="${patient.id}" data-status="1" title="클릭하여 중증으로 변경">경증</button>`;

                return `
                <tr>
                    <td>${index + 1}</td>
                    <td>${patient.userId}</td>
                    <td>${patient.name}</td>
                    <td>${patient.phone || '-'}</td>
                    <td>${statusBtn}</td>
                </tr>
            `;
            }).join('');

            // 상태 토글 버튼 이벤트 바인딩
            bindPatientStatusEvents();
        }
    }

    // 환자 상태 토글 이벤트 바인딩
    function bindPatientStatusEvents() {
        $$('.patient-status-btn').forEach(btn => {
            btn.addEventListener('click', async function(e) {
                e.preventDefault();
                const memberId = this.dataset.memberId;
                const currentStatus = parseInt(this.dataset.status);
                const newStatus = currentStatus === 1 ? 2 : 1;

                try {
                    const response = await fetch(`/api/members/${memberId}/patient-status`, {
                        method: 'PATCH',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ patientStatus: newStatus })
                    });

                    if (response.ok) {
                        // 로컬 데이터 업데이트
                        const patient = pendingAssigned.find(p => p.id === parseInt(memberId));
                        if (patient) {
                            patient.patientStatus = newStatus;
                        }
                        renderAssignedTable();

                        const statusText = newStatus === 2 ? '중증' : '경증';
                        console.log(`환자 상태가 ${statusText}(으)로 변경되었습니다.`);
                    } else {
                        throw new Error('상태 변경 실패');
                    }
                } catch (error) {
                    console.error('환자 상태 변경 실패:', error);
                    alert('환자 상태 변경 중 오류가 발생했습니다.');
                }
            });
        });
    }

    // 리스트 아이템 클릭 이벤트 바인딩
    function bindListItemEvents() {
        // 미배정 리스트 클릭
        $$('#unassignedPatientList .list-group-item').forEach(item => {
            item.addEventListener('click', function() {
                this.classList.toggle('active');
            });
        });

        // 배정된 리스트 클릭
        $$('#assignedPatientList .list-group-item').forEach(item => {
            item.addEventListener('click', function() {
                this.classList.toggle('active');
            });
        });
    }

    // 선택된 환자 배정 (>> 버튼)
    function assignSelectedPatients() {
        const selectedItems = $$('#unassignedPatientList .list-group-item.active');

        selectedItems.forEach(item => {
            const patientId = parseInt(item.dataset.id);
            const patient = pendingUnassigned.find(p => p.id === patientId);

            if (patient) {
                // 미배정에서 제거
                pendingUnassigned = pendingUnassigned.filter(p => p.id !== patientId);
                // 배정에 추가
                pendingAssigned.push(patient);
            }
        });

        renderPatientLists();
        renderAssignedTable();
    }

    // 선택된 환자 배정 해제 (<< 버튼)
    function unassignSelectedPatients() {
        const selectedItems = $$('#assignedPatientList .list-group-item.active');

        selectedItems.forEach(item => {
            const patientId = parseInt(item.dataset.id);
            const patient = pendingAssigned.find(p => p.id === patientId);

            if (patient) {
                // 배정에서 제거
                pendingAssigned = pendingAssigned.filter(p => p.id !== patientId);
                // 미배정에 추가
                pendingUnassigned.push(patient);
            }
        });

        renderPatientLists();
        renderAssignedTable();
    }

    // 최종 배정 저장
    async function saveAssignments() {
        try {
            const assignedIds = pendingAssigned.map(p => p.id);

            const response = await fetch('/api/members/assignments', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    memberId: parseInt(MEMBER_ID),
                    assignedPatientIds: assignedIds
                })
            });

            if (response.ok) {
                alert(`총 ${assignedIds.length}명의 환자 배정 정보가 저장되었습니다.`);
                loadPatientAssignment(); // 새로고침
            } else {
                throw new Error('저장 실패');
            }
        } catch (error) {
            console.error('환자 배정 저장 실패:', error);
            alert('환자 배정 저장 중 오류가 발생했습니다.');
        }
    }

    // 환자 검색
    function searchPatients() {
        const searchInput = $('#patientSearchInput');
        const keyword = searchInput ? searchInput.value.trim() : '';
        renderPatientLists(keyword);
    }

    // 환자 배정 이벤트 초기화
    function initializeAssignmentEvents() {
        // >> 버튼 (배정)
        const assignBtn = $('#assignSelectedBtn');
        if (assignBtn) {
            assignBtn.addEventListener('click', assignSelectedPatients);
        }

        // << 버튼 (배정 해제)
        const unassignBtn = $('#unassignSelectedBtn');
        if (unassignBtn) {
            unassignBtn.addEventListener('click', unassignSelectedPatients);
        }

        // 저장 버튼
        const saveBtn = $('#saveAssignmentBtn');
        if (saveBtn) {
            saveBtn.addEventListener('click', saveAssignments);
        }

        // 검색 버튼
        const searchBtn = $('#patientSearchButton');
        if (searchBtn) {
            searchBtn.addEventListener('click', searchPatients);
        }

        // 검색 입력 엔터키
        const searchInput = $('#patientSearchInput');
        if (searchInput) {
            searchInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') searchPatients();
            });
        }
    }

    // 프로필 이미지 업로드
    function setupProfileImageUpload() {
        const profileImageContainer = $('#profileImageContainer');
        const profileImageUpload = $('#profileImageUpload');

        if (profileImageContainer && profileImageUpload) {
            profileImageContainer.addEventListener('click', () => profileImageUpload.click());

            profileImageUpload.addEventListener('change', (event) => {
                const file = event.target.files[0];
                if (file) {
                    const reader = new FileReader();
                    reader.onload = function(e) {
                        profileImageContainer.querySelector('.profile-image').src = e.target.result;
                    };
                    reader.readAsDataURL(file);
                }
            });
        }
    }

    // 주소 검색
    function setupAddressSearch() {
        const buttonPostcodeSearch = $('#buttonPostcodeSearch');
        if (buttonPostcodeSearch) {
            buttonPostcodeSearch.addEventListener('click', function(e) {
                e.preventDefault();
                new daum.Postcode({
                    oncomplete: function(data) {
                        $('#zipCode').value = data.zonecode;
                        $('#streetAdr').value = data.roadAddress;
                    }
                }).open();
            });
        }
    }

    // 초기화
    function initialize() {
        const memberIdEl = $('#memberId');
        MEMBER_ID = memberIdEl ? memberIdEl.value : null;

        if (!MEMBER_ID) {
            console.error('로그인한 사용자 정보를 찾을 수 없습니다.');
            return;
        }

        // 이벤트 리스너
        const passwordInput = $('#password');
        const passwordConfirmInput = $('#passwordConfirm');
        const emailInput = $('#inputEmail');
        const regBtn = $('#regBtn');
        const emailCheckBtn = $('#buttonEmailCheck');

        if (passwordInput) passwordInput.addEventListener('keyup', checkPasswordMatch);
        if (passwordConfirmInput) passwordConfirmInput.addEventListener('keyup', checkPasswordMatch);
        if (emailInput) emailInput.addEventListener('keyup', validateEmail);
        if (regBtn) regBtn.addEventListener('click', handleFormSubmit);
        if (emailCheckBtn) emailCheckBtn.addEventListener('click', validateEmail);

        setupProfileImageUpload();
        setupAddressSearch();

        loadMemberData(MEMBER_ID);

        // 환자 배정 이벤트 초기화
        initializeAssignmentEvents();

        // 환자 배정 탭 활성화 시 데이터 로드
        const assignTab = $('#assign-tab');
        if (assignTab) {
            assignTab.addEventListener('shown.bs.tab', loadPatientAssignment);
        }
    }

    window.validateEmail = validateEmail;

    document.addEventListener('DOMContentLoaded', initialize);
})();
