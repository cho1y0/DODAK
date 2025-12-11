document.addEventListener('DOMContentLoaded', function() {
	const roleSelect = document.getElementById('roleSelect');
	   const doctorInfoSection = document.getElementById('doctorInfoSection');
	   const passwordInput = document.getElementById('password');
	   const passwordConfirmInput = document.getElementById('passwordConfirm');
	   const passwordMatchText = document.getElementById('passwordMatchText');
	   
	   // 약관 동의 관련 요소
	   const agreeAllCheckbox = document.getElementById('agreeAll');
	   const allAgreementCheckboxes = document.querySelectorAll('.agreement-checkboxes input[type="checkbox"]');
	   
	   // 모달 관련 요소
	   const openHospitalModalBtn = document.getElementById('openHospitalModalBtn');
	   const hospitalModal = document.getElementById('hospitalModal');
	   const closeHospitalModalBtns = document.querySelectorAll('#hospitalModal .close-button, #closeHospitalModalBtn');
	   const openAddHospitalFormBtn = document.getElementById('openAddHospitalFormBtn');
	   const newHospitalForm = document.getElementById('newHospitalForm');
	   const cancelAddHospitalBtn = document.getElementById('cancelAddHospitalBtn');
	   
	   // ⭐️⭐️ 새로 추가된 병원 검색/적용 관련 요소 ⭐️⭐️
	   const searchHospitalBtn = document.getElementById('searchHospitalBtn');
	   const hospitalSearchResults = document.getElementById('hospitalSearchResults');
	   const hospitalNameInput = document.getElementById('hospNameDisplay');
	   const hospitalIdInput = document.getElementById('hospIdx');

	// ⭐️ 초기 로드 시 모달을 명시적으로 숨김 (유지)
	   hospitalModal.style.display = 'none';

	   // --- 프로필 이미지 업로드 (유지) ---
	   const profileImageContainer = document.getElementById('profileImageContainer');
	   const profileImageUpload = document.getElementById('profileImageUpload');

	   profileImageContainer.addEventListener('click', () => {
	       profileImageUpload.click();
	   });

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

	   // --- 역할 선택에 따른 '의사 정보' 섹션 토글 (유지) ---
	   function toggleDoctorInfo() {
	       if (roleSelect.value === 'DOCTOR') {
	           doctorInfoSection.style.display = 'block';
	       } else {
	           doctorInfoSection.style.display = 'none';
	       }
	   }
	   roleSelect.addEventListener('change', toggleDoctorInfo);
	   toggleDoctorInfo();

	   // --- 비밀번호 확인 일치 여부 (유지) ---
	   function checkPasswordMatch() {
	       const password = passwordInput.value;
	       const confirmPassword = passwordConfirmInput.value;

	       if (confirmPassword === '') {
	           passwordMatchText.textContent = '';
	           passwordMatchText.style.color = '#777';
	           return;
	       }

	       if (password === confirmPassword) {
	           passwordMatchText.textContent = '비밀번호가 일치합니다.';
	           passwordMatchText.style.color = '#7BCC7B';
	       } else {
	           passwordMatchText.textContent = '비밀번호가 일치하지 않습니다.';
	           passwordMatchText.style.color = '#CD5C5C';
	       }
	   }
	   passwordInput.addEventListener('keyup', checkPasswordMatch);
	   passwordConfirmInput.addEventListener('keyup', checkPasswordMatch);

	   // --- ⭐️ 약관 전체 동의 / 개별 동의 로직 (보강) ⭐️ ---
	   function updateAgreeAllCheckbox() {
	       // 모든 개별 체크박스 상태 확인
	       const allChecked = Array.from(allAgreementCheckboxes).every(cb => cb.checked);
		
	       agreeAllCheckbox.checked = allChecked;
	   }

	   agreeAllCheckbox.addEventListener('change', function() {
	       // 전체 동의 체크 시 모든 개별 체크박스 상태를 동기화
	       allAgreementCheckboxes.forEach(checkbox => {
	           checkbox.checked = this.checked;
	       });
	       // 체크박스 상태가 변경될 때마다 전체 동의 상태 업데이트
	       updateAgreeAllCheckbox(); 
	   });

	   allAgreementCheckboxes.forEach(checkbox => {
	       // 개별 체크박스 상태 변경 시 '전체 동의' 체크박스 업데이트
	       checkbox.addEventListener('change', updateAgreeAllCheckbox);
	   });
	   // --- 약관 동의 로직 끝 ---

	  

	   closeHospitalModalBtns.forEach(btn => {
	       btn.addEventListener('click', () => {
	           hospitalModal.style.display = 'none';
	           newHospitalForm.style.display = 'none';
	       });
	   });

	   window.addEventListener('click', (event) => {
	       if (event.target == hospitalModal) {
	           hospitalModal.style.display = 'none';
	           newHospitalForm.style.display = 'none';
	       }
	   });

	   // '새 병원 정보 등록' 버튼 클릭 시 폼 표시 (유지)
	   openAddHospitalFormBtn.addEventListener('click', () => {
	       newHospitalForm.style.display = 'block';
	   });

	   cancelAddHospitalBtn.addEventListener('click', () => {
	       newHospitalForm.style.display = 'none';
	   });

	   
	   

	   

	   // --- 가상의 우편 번호 검색 (유지) ---
	   document.getElementById('searchZipCodeBtn').addEventListener('click', () => {
	       alert('우편 번호 검색 API 연동 (예: Daum Postcode API)');
	       document.getElementById('zipCode').value = '06130';
	       document.getElementById('addr1').value = '서울 강남구 테헤란로 123';
	   });

	   document.getElementById('searchNewHospitalZipCodeBtn').addEventListener('click', () => {
	       alert('새 병원 우편 번호 검색 API 연동');
	       document.getElementById('newHospitalZipCode').value = '12345';
	       document.getElementById('newHospitalAddr1').value = '경기도 성남시 분당구 판교역로 123';
	   });

	   // 회원가입 완료 버튼 클릭 시 유효성 검사 (유지)
	   document.querySelector('.btn-submit').addEventListener('click', (e) => {
	       e.preventDefault(); 
	       const requiredTermsAgreed = document.getElementById('agreeTerms').checked && document.getElementById('agreePrivacy').checked;
	       
	       if (!requiredTermsAgreed) {
	           alert('필수 약관에 모두 동의해야 합니다.');
	           return;
	       }

	       //alert('회원가입 데이터를 서버로 전송합니다! (이후 페이지 이동)');
	   });

    
});