package com.careerhoop.dto;

import lombok.Builder;

import java.util.UUID;

@Builder
public record QuestionResultDto(
        UUID questionId,
        String questionText,
        String selectedOption,
        String correctOption,
        boolean isCorrect,
        String optionA,
        String optionB,
        String optionC,
        String optionD
) {
}

