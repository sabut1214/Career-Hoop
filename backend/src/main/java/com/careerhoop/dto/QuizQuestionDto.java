package com.careerhoop.dto;

import lombok.Builder;

import java.util.UUID;

@Builder
public record QuizQuestionDto(
        UUID id,
        String questionText,
        String optionA,
        String optionB,
        String optionC,
        String optionD,
        String difficulty
) {
}
