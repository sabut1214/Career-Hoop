package com.careerhoop.dto;

import lombok.Data;

import java.util.List;

@Data
public class GradeSheetDto {
    private String studentName;
    private String schoolName;
    private String examName;
    private List<GradeSubjectDto> subjects;
}


