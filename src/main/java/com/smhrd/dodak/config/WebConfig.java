package com.smhrd.dodak.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig implements WebMvcConfigurer {
	// WebMvcConfigurer : Spring에서 웹 어플리케이션의 설정을 커스텀마이징 할 때 사용하는 인터페이스
	
	@Value("${file.upload-dir}")
	private String uploadDir;
	
	//	application.properties 또는 application.yml에 AI API URL을 설정해야 합니다.
    @Value("${ai.api.url}") 
    private String aiApiUrl; // 예: http://192.168.0.9:8000/diary
    
	public String getAiApiUrl() {
		return aiApiUrl;
	}

	@Override
	public void addResourceHandlers(ResourceHandlerRegistry registry) {
		registry.addResourceHandler("/uploads/**") // 브라우저에서 접근할 경로
		        .addResourceLocations("file:"+uploadDir); // 실제 서버에 저장할 경로
				/* '/js/**'로 호출하는 자원은 '/static/js/' 폴더 아래에서 찾는다. */ 
        registry.addResourceHandler("/js/**").addResourceLocations("classpath:/static/js/").setCachePeriod(60 * 60 * 24 * 365); 
				/* '/css/**'로 호출하는 자원은 '/static/css/' 폴더 아래에서 찾는다. */ 
        registry.addResourceHandler("/css/**").addResourceLocations("classpath:/static/css/").setCachePeriod(60 * 60 * 24 * 365); 
				/* '/img/**'로 호출하는 자원은 '/static/img/' 폴더 아래에서 찾는다. */ 
        registry.addResourceHandler("/img/**").addResourceLocations("classpath:/static/img/").setCachePeriod(60 * 60 * 24 * 365); 
				/* '/font/**'로 호출하는 자원은 '/static/font/' 폴더 아래에서 찾는다. */ 
        registry.addResourceHandler("/font/**").addResourceLocations("classpath:/static/font/").setCachePeriod(60 * 60 * 24 * 365); 
        
        registry.addResourceHandler("/view/js/**").addResourceLocations("classpath:/static/js/").setCachePeriod(60 * 60 * 24 * 365); 
		/* '/css/**'로 호출하는 자원은 '/static/css/' 폴더 아래에서 찾는다. */ 
        registry.addResourceHandler("/view/css/**").addResourceLocations("classpath:/static/css/").setCachePeriod(60 * 60 * 24 * 365); 
		/* '/img/**'로 호출하는 자원은 '/static/img/' 폴더 아래에서 찾는다. */ 
        registry.addResourceHandler("/view/img/**").addResourceLocations("classpath:/static/img/").setCachePeriod(60 * 60 * 24 * 365); 
		/* '/font/**'로 호출하는 자원은 '/static/font/' 폴더 아래에서 찾는다. */ 
        registry.addResourceHandler("/view/font/**").addResourceLocations("classpath:/static/font/").setCachePeriod(60 * 60 * 24 * 365);
	}
	
}	
