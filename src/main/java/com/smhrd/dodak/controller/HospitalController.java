package com.smhrd.dodak.controller;

import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;

import lombok.RequiredArgsConstructor;

@Controller
@RequestMapping("/hospital")
@RequiredArgsConstructor
public class HospitalController {
	
	// 1. 병원 검색 및 선택 팝업 화면
    // URL: /hospital/searchPopup
    @GetMapping("/searchPopup")
    public String searchPopup() {
        // 이 뷰에서 JavaScript를 사용해 /api/hospitals/search를 호출하여 목록을 가져옵니다.
        return "hospital/searchPopup"; 
    }
    
    // 2. 새 병원 등록 폼 화면
    // URL: /hospital/addForm
    @GetMapping("/addForm")
    public String addForm(Model model) {
        // 새 병원 등록 폼을 보여줍니다. (POST 요청은 REST API인 HospitalController가 처리)
        //model.addAttribute("hospital", );
        return "hospital/addForm"; 
    }
}
