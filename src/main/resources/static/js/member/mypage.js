/**
 * mypage.js - 마이페이지/프로필 관련 JavaScript
 * 기능: 회원 정보 로드, 프로필 수정, 폼 검증, 병원 검색
 */

// jQuery serializeObject 플러그인
$.fn.serializeObject = function() {
    var obj = {};
    var arr = this.serializeArray();
    arr.forEach(function(data) {
        obj[data.name] = data.value;
    });
    return obj;
};

// 전역 상태 변수
let isIdAvailable = false;
let isEmailAvailable = true;
let isDoctor = false;

// DOM 요소 캐시
let $form, $inputId, $inputName, $inputPhone, $inputEmail, $inputEmailCheck;
let $zipCode, $streetAdr, $inputAddressDetail, $roleSelect, $doctorInfoSection;
let $hospNameDisplay, $hospIdx, $inputSpecialty;
let $password, $passwordConfirm, passwordMatchText;

// 이메일 형식 검사
function emailCheck(email) {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
}

// 이메일 유효성 검사
function validateEmail() {
    const emailInput = document.getElementById('inputEmail');
    const email = emailInput.value;

    if (emailCheck(email)) {
        $("#emailMessage").text("유효한 이메일 주소입니다.").css({'color': 'blue', 'font-weight': 'normal'});
        checkEmail();
        return true;
    } else {
        $("#emailMessage").text("유효하지 않은 이메일 주소입니다.").css({'color': 'red', 'font-weight': 'normal'});
        isEmailAvailable = false;
        return false;
    }
}

// 이메일 중복 체크
function checkEmail() {
    const email = $('#inputEmail').val();
    const originalEmail = $('#inputEmailCheck').val();

    if (email === originalEmail) {
        isEmailAvailable = true;
        return;
    }

    $.ajax({
        url: "/api/members/checkEmail",
        method: "get",
        data: { email: email },
        success: function(response) {
            if (!response) {
                $("#emailMessage").text("이메일이 중복되었습니다.").css({'color': 'red', 'font-weight': 'normal'});
                isEmailAvailable = false;
            } else {
                $("#emailMessage").text("사용 가능한 이메일입니다.").css({'color': 'blue', 'font-weight': 'normal'});
                isEmailAvailable = true;
            }
        },
        error: function() {
            console.error("이메일 중복 체크 오류");
        }
    });
}

// 아이디 중복 체크
function checkId() {
    const id = $('#inputId').val();

    $.ajax({
        url: "/api/members/checkId",
        method: "get",
        data: { userId: id },
        success: function(response) {
            if (!response) {
                $("#idMessage").text("아이디가 중복되었습니다.").css({'color': 'red', 'font-weight': 'normal'});
                isIdAvailable = false;
            } else {
                $("#idMessage").text("사용 가능한 아이디입니다.").css({'color': 'blue', 'font-weight': 'normal'});
                isIdAvailable = true;
            }
        },
        error: function() {
            console.error("아이디 중복 체크 오류");
        }
    });
}

// 비밀번호 일치 검사
function checkPasswordMatch() {
    const passwordInput = document.getElementById('password');
    const passwordConfirmInput = document.getElementById('passwordConfirm');
    const passwordMatchText = document.getElementById('passwordMatchText');

    if (!passwordInput || !passwordConfirmInput || !passwordMatchText) return true;

    const password = passwordInput.value;
    const confirmPassword = passwordConfirmInput.value;

    const minLength = 8;
    const maxLength = 20;

    // 비밀번호가 비어있으면 (수정 시) 검사 스킵
    if (password.length === 0 && confirmPassword.length === 0) {
        passwordMatchText.textContent = '';
        return true;
    }

    // 길이 검사
    if (password.length < minLength || password.length > maxLength) {
        passwordMatchText.textContent = `비밀번호는 ${minLength}~${maxLength}자 사이여야 합니다.`;
        passwordMatchText.style.color = '#dc3545';
        return false;
    }

    // 조합 검사
    const hasLetter = /[a-zA-Z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const hasSpecial = /[^a-zA-Z0-9]/.test(password);

    if (!hasLetter || !hasNumber || !hasSpecial) {
        passwordMatchText.textContent = "비밀번호는 영문, 숫자, 특수문자를 모두 포함해야 합니다.";
        passwordMatchText.style.color = '#dc3545';
        return false;
    }

    // 일치 검사
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

// 역할 선택에 따른 의사 정보 섹션 토글
function toggleDoctorInfo() {
    const roleSelect = document.getElementById('roleSelect');
    const doctorInfoSection = document.getElementById('doctorInfoSection');

    if (!roleSelect || !doctorInfoSection) return;

    if (roleSelect.value === 'DOCTOR') {
        doctorInfoSection.style.display = 'block';
        isDoctor = true;
    } else {
        doctorInfoSection.style.display = 'none';
        isDoctor = false;
    }
}

// 프로필 이미지 업로드 초기화
function initializeProfileImage() {
    const profileImageContainer = document.getElementById('profileImageContainer');
    const profileImageUpload = document.getElementById('profileImageUpload');

    if (!profileImageContainer || !profileImageUpload) return;

    profileImageContainer.addEventListener('click', () => {
        profileImageUpload.click();
    });

    profileImageUpload.addEventListener('change', (event) => {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(e) {
                const profileImage = profileImageContainer.querySelector('.profile-image');
                if (profileImage) {
                    profileImage.src = e.target.result;
                }
            };
            reader.readAsDataURL(file);
        }
    });
}

// 회원 정보 로드
async function loadMemberData(memberId) {
    console.log("memberId:", memberId);
    const apiUrl = `/api/members/info/${memberId}`;

    try {
        const response = await fetch(apiUrl);

        if (!response.ok) {
            throw new Error('회원 정보를 불러오는 데 실패했습니다.');
        }

        const member = await response.json();

        // 폼 필드에 데이터 설정
        const $inputId = document.getElementById('inputId');
        const $inputName = document.getElementById('inputName');
        const $inputPhone = document.getElementById('inputPhone');
        const $inputEmail = document.getElementById('inputEmail');
        const $inputEmailCheck = document.getElementById('inputEmailCheck');
        const $zipCode = document.getElementById('zipCode');
        const $streetAdr = document.getElementById('streetAdr');
        const $inputAddressDetail = document.getElementById('inputAddressDetail');
        const $roleSelect = document.getElementById('roleSelect');
        const $doctorInfoSection = document.getElementById('doctorInfoSection');
        const $inputSpecialty = document.getElementById('inputSpecialty');
        const $hospIdx = document.getElementById('hospIdx');
        const $hospNameDisplay = document.getElementById('hospNameDisplay');

        if ($inputId) {
            $inputId.value = member.userId;
            $inputId.readOnly = true;
        }

        if ($inputName) $inputName.value = member.name || '';
        if ($inputPhone) $inputPhone.value = member.phone || '';
        if ($inputEmail) $inputEmail.value = member.email || '';
        if ($inputEmailCheck) $inputEmailCheck.value = member.email || '';
        if ($zipCode) $zipCode.value = member.zipCode || '';
        if ($streetAdr) $streetAdr.value = member.addr1 || '';
        if ($inputAddressDetail) $inputAddressDetail.value = member.addr2 || '';

        if ($roleSelect) {
            $roleSelect.value = member.role || 'USER';
            $roleSelect.disabled = true;
        }

        if (member.role === 'DOCTOR' && $doctorInfoSection) {
            $doctorInfoSection.style.display = 'block';

            if ($inputSpecialty) $inputSpecialty.value = member.specialty || '';
            if (member.hospIdx) {
                if ($hospIdx) $hospIdx.value = member.hospIdx;
                if ($hospNameDisplay) $hospNameDisplay.value = member.hospName;
            }
        }

        if (member.agreementYn === 'Y') {
            $('#checkTerms3').prop('checked', true);
            $('#agreements').val('Y');
        } else {
            $('#checkTerms3').prop('checked', false);
            $('#agreements').val('N');
        }

        if (member.profileImg) {
            const profileImage = document.querySelector('.profile-image');
            if (profileImage) profileImage.src = member.profileImg;
            $('#oldImgPath').val(member.profileImg);
        }

    } catch (error) {
        console.error("회원 정보 로드 오류:", error);
        alert("회원 정보를 가져오는 중 오류가 발생했습니다: " + error.message);
    }
}

// 회원 정보 수정 제출
function submitMemberUpdate() {
    const form = document.getElementById('registerForm');
    if (!form) return;

    // 비밀번호 검사 (입력했을 경우만)
    const password = document.getElementById('password');
    if (password && password.value.length > 0) {
        if (!checkPasswordMatch()) {
            alert('비밀번호를 확인해주세요.');
            return;
        }
    }

    // 이메일 검사
    if (!isEmailAvailable) {
        alert('이메일을 확인해주세요.');
        return;
    }

    // 전화번호 형식 검사
    const phone = document.getElementById('inputPhone');
    if (phone && phone.value) {
        const phoneRegex = /^0\d{1,2}-\d{3,4}-\d{4}$/;
        if (!phoneRegex.test(phone.value)) {
            alert('휴대전화번호 형식을 확인해 주세요. (010-XXXX-XXXX)');
            return;
        }
    }

    const formData = new FormData(form);

    // memberId 추가 (폼 밖에 있는 hidden 필드)
    const memberId = document.getElementById('memberId');
    if (memberId) {
        formData.append('id', memberId.value);
    }

    $.ajax({
        url: '/api/members/update',
        type: 'PUT',
        data: formData,
        processData: false,
        contentType: false,
        success: function(response) {
            alert('회원 정보가 수정되었습니다.');
            location.reload();
        },
        error: function(xhr, status, error) {
            console.error('회원 정보 수정 오류:', error);
            alert('회원 정보 수정 중 오류가 발생했습니다.');
        }
    });
}

// 이벤트 리스너 초기화
function initializeMypageEvents() {
    // 비밀번호 확인 이벤트
    const passwordInput = document.getElementById('password');
    const passwordConfirmInput = document.getElementById('passwordConfirm');

    if (passwordInput) {
        passwordInput.addEventListener('keyup', checkPasswordMatch);
    }
    if (passwordConfirmInput) {
        passwordConfirmInput.addEventListener('keyup', checkPasswordMatch);
    }

    // 이메일 검사 이벤트
    const emailInput = document.getElementById('inputEmail');
    if (emailInput) {
        emailInput.addEventListener('keyup', validateEmail);
    }

    // 역할 선택 이벤트
    const roleSelect = document.getElementById('roleSelect');
    if (roleSelect) {
        roleSelect.addEventListener('change', toggleDoctorInfo);
        toggleDoctorInfo();
    }

    // 수정 버튼 이벤트
    const updateBtn = document.getElementById('regBtn');
    if (updateBtn) {
        updateBtn.addEventListener('click', function(e) {
            e.preventDefault();
            submitMemberUpdate();
        });
    }

    // 주소 검색 버튼 이벤트
    const postcodeBtn = document.getElementById('buttonPostcodeSearch');
    if (postcodeBtn) {
        postcodeBtn.addEventListener('click', function(e) {
            e.preventDefault();
            new daum.Postcode({
                oncomplete: function(data) {
                    document.getElementById('zipCode').value = data.zonecode;
                    document.getElementById('streetAdr').value = data.roadAddress;
                    document.getElementById('inputAddressDetail').focus();
                }
            }).open();
        });
    }
}

// 마이페이지 모듈 초기화
function initializeMypage() {
    initializeProfileImage();
    initializeMypageEvents();

    // 페이지 로드 시 회원 정보 로드
    const MEMBER_ID = document.getElementById('memberId') ? document.getElementById('memberId').value : null;
    if (MEMBER_ID) {
        loadMemberData(MEMBER_ID);
    }
}

// DOM 로드 완료 시 초기화
document.addEventListener('DOMContentLoaded', initializeMypage);
