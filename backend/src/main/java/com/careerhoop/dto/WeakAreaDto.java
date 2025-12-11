package com.careerhoop.dto;

import java.util.UUID;

public record WeakAreaDto(
        UUID trainingId,
        String trainingTitle,
        String questionText,
        long incorrectCount
) {
}

