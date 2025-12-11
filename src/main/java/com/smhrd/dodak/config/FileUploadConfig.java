package com.smhrd.dodak.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;

@Configuration
public class FileUploadConfig {
	// 저장 경로를 가지고 오기
	@Value("${file.upload-dir}")
	private String uploadDir;
	
	public String getUploadDir() {
		return uploadDir;
	}
}
