package com.smhrd.dodak.entity;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class MemberInfoResponse {
    
    private Integer memberId;
    private String userId;
    private String name;
    private String role;
    private String phone;
    private String email;
    private String zipCode;
    private String addr1;
    private String addr2;
    private String specialty;
    private String agreementYn;
    private Integer hospIdx;
    private String hospName;
    private String profileImg;
    
    
    public static MemberInfoResponse of(Member member) {
        return MemberInfoResponse.builder()
                .memberId(member.getId())
                .userId(member.getUserId())
                .name(member.getName())
                .role(member.getRole())
                .phone(member.getPhone())
                .email(member.getEmail())
                .zipCode(member.getZipCode())
                .addr1(member.getAddr1())
                .addr2(member.getAddr2())
                .specialty(member.getSpecialty())
                .agreementYn(member.getAgreementYn())
                .hospIdx(member.getHospIdx())
                .hospName(member.getHospName())
                .profileImg(member.getProfileImg())
                .build();
    }
}
