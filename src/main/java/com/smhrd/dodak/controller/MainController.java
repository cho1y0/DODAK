package com.smhrd.dodak.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

import com.smhrd.dodak.config.WebConfig;

import jakarta.servlet.http.HttpSession;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Controller
@RequiredArgsConstructor
public class MainController {
	
	@Autowired
	WebConfig webConfig;
	
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

	// ========== 환자(Member) 라우트 ==========

	@GetMapping("/member/main")
	public String memberMain(HttpSession session) {
		String userId = (String) session.getAttribute("userId");
		if (userId != null) {
			return "redirect:/member/home";
		}
		return "redirect:/login";
	}

	@GetMapping("/member/home")
	public String memberHome(HttpSession session, Model model) {
		String userId = (String) session.getAttribute("userId");
		if (userId != null) {
			model.addAttribute("currentUserId", userId);
			return "member/home";
		}
		return "redirect:/login";
	}

	@GetMapping("/member/diary-write")
	public String memberDiaryWrite(HttpSession session, Model model) {
		String userId = (String) session.getAttribute("userId");
		if (userId != null) {
			model.addAttribute("currentUserId", userId);
			model.addAttribute("aiApiUrl", webConfig.getAiApiUrl());
			return "member/diary-write";
		}
		return "redirect:/login";
	}

	@GetMapping("/member/diary-list")
	public String memberDiaryList(HttpSession session, Model model) {
		String userId = (String) session.getAttribute("userId");
		if (userId != null) {
			model.addAttribute("currentUserId", userId);
			return "member/diary-list";
		}
		return "redirect:/login";
	}

	@GetMapping("/member/mypage")
	public String memberMypage(HttpSession session, Model model) {
		String userId = (String) session.getAttribute("userId");
		if (userId != null) {
			model.addAttribute("currentUserId", userId);
			return "member/mypage";
		}
		return "redirect:/login";
	}

	// ========== 의사(Doctor) 라우트 ==========

	@GetMapping("/doctor/main")
	public String doctorMain(HttpSession session) {
		String userId = (String) session.getAttribute("userId");
		if (userId != null) {
			return "redirect:/doctor/home";
		}
		return "redirect:/login";
	}

	@GetMapping("/doctor/home")
	public String doctorHome(HttpSession session, Model model) {
		String userId = (String) session.getAttribute("userId");
		if (userId != null) {
			model.addAttribute("currentUserId", userId);
			return "doctor/home";
		}
		return "redirect:/login";
	}

	@GetMapping("/doctor/dashboard")
	public String doctorDashboard(HttpSession session, Model model) {
		String userId = (String) session.getAttribute("userId");
		if (userId != null) {
			model.addAttribute("currentUserId", userId);
			return "doctor/dashboard";
		}
		return "redirect:/login";
	}

	@GetMapping("/doctor/patient-stats")
	public String doctorPatientStats(HttpSession session, Model model) {
		String userId = (String) session.getAttribute("userId");
		if (userId != null) {
			model.addAttribute("currentUserId", userId);
			return "doctor/patient-stats";
		}
		return "redirect:/login";
	}

	@GetMapping("/doctor/patient-diary-list")
	public String doctorPatientDiaryList(HttpSession session, Model model) {
		String userId = (String) session.getAttribute("userId");
		if (userId != null) {
			model.addAttribute("currentUserId", userId);
			return "doctor/patient-diary-list";
		}
		return "redirect:/login";
	}

	@GetMapping("/doctor/mypage")
	public String doctorMypage(HttpSession session, Model model) {
		String userId = (String) session.getAttribute("userId");
		if (userId != null) {
			model.addAttribute("currentUserId", userId);
			return "doctor/mypage";
		}
		return "redirect:/login";
	}

	@GetMapping("/calendar")
	public String calendar() {
		return "calendar"; // login.html
	}
}