package com.smhrd.dodak.controller;

import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

import jakarta.servlet.http.HttpSession;
import lombok.RequiredArgsConstructor;

@Controller
@RequiredArgsConstructor
public class MainController {
	@GetMapping("/")
	public String index(Model model) {
		// 주의 사항 확장자는 작성하지 않습니다.
		// html 파일명만 가능합니다!
		// boot의 view resolver는 설정이 되어있습니다.
		// html을 실행 하겠다고 코드 작성
		return "index"; // index.html
	}

	@GetMapping("/view/{viewPage}")
	public String displayView(@PathVariable String viewPage) {
		// 주의 사항 확장자는 작성하지 않습니다.
		// html 파일명만 가능합니다!
		// boot의 view resolver는 설정이 되어있습니다.
		// html을 실행 하겠다고 코드 작성
		return "/view/" + viewPage; // index.html
	}

	@GetMapping("/login")
	public String login() {
		return "login"; // login.html
	}

	@GetMapping("/join")
	public String memberAddUser(Model model) {
		// 주의 사항 확장자는 작성하지 않습니다.
		// html 파일명만 가능합니다!
		// boot의 view resolver는 설정이 되어있습니다.
		// html을 실행 하겠다고 코드 작성
		return "member/addUser"; // index.html
	}

	@GetMapping("/member/main")
	public String memberMain(HttpSession session, Model model) { 
		String userId = (String) session.getAttribute("userId");
		Integer memberId = (Integer) session.getAttribute("memberId");
		System.out.println("/member/main userId : " + userId);
		System.out.println("/member/main memberId : " + memberId);
		if (userId != null) {
			model.addAttribute("currentUserId", userId);
			return "member/mainNew"; // index.html
		} else {
			// 세션이 없거나 만료된 경우, 로그인 페이지로 리다이렉트 고려
			return "redirect:/login";			
		}
		
	}

	@GetMapping("/doctor/main")
	public String doctorMain(Model model) {
		// 주의 사항 확장자는 작성하지 않습니다.
		// html 파일명만 가능합니다!
		// boot의 view resolver는 설정이 되어있습니다.
		// html을 실행 하겠다고 코드 작성
		return "doctor/main"; // index.html
	}

	@GetMapping("/calendar")
	public String calendar() {
		return "calendar"; // login.html
	}

	// 1. 회원가입 폼 화면 요청 (GET)
	@GetMapping("/addUser")
	public String joinForm(Model model) {
		return "member/joinForm"; // /WEB-INF/views/member/joinForm.html
	}
}