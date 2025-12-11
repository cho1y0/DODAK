package com.smhrd.dodak;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.web.config.EnableSpringDataWebSupport;
import org.springframework.data.web.config.EnableSpringDataWebSupport.PageSerializationMode;

@SpringBootApplication
@EnableSpringDataWebSupport(pageSerializationMode = PageSerializationMode.VIA_DTO)
public class DodakWebServiceApplication {

	public static void main(String[] args) {
		SpringApplication.run(DodakWebServiceApplication.class, args);
	}

}
