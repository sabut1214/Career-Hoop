package com.careerhoop.service;

import com.careerhoop.dto.*;
import com.careerhoop.entity.QuizAnswer;
import com.careerhoop.entity.QuizQuestion;
import com.careerhoop.entity.QuizSession;
import com.careerhoop.entity.Training;
import com.careerhoop.repository.QuizAnswerRepository;
import com.careerhoop.repository.QuizQuestionRepository;
import com.careerhoop.repository.QuizSessionRepository;
import com.careerhoop.repository.TrainingRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

@Service
public class QuizService {

    private static final int QUIZ_QUESTION_LIMIT = 10;

    @Autowired
    private TrainingRepository trainingRepository;

    @Autowired
    private QuizQuestionRepository quizQuestionRepository;

    @Autowired
    private QuizSessionRepository quizSessionRepository;

    @Autowired
    private QuizAnswerRepository quizAnswerRepository;

    @Transactional
    public StartQuizResponse startQuiz(StartQuizRequest request) {
        UUID trainingId = Objects.requireNonNull(request.trainingId(), "trainingId is required");
        UUID userId = Objects.requireNonNull(request.userId(), "userId is required");

        Training training = trainingRepository.findById(trainingId)
                .orElseThrow(() -> new IllegalArgumentException("Training not found"));

        List<UUID> questionIds = quizQuestionRepository.findIdsByTrainingId(trainingId);

        if (questionIds.isEmpty()) {
            throw new IllegalStateException("No quiz questions available for this training yet.");
        }

        Collections.shuffle(questionIds);
        List<UUID> selectedIds = questionIds.stream()
                .limit(Math.min(QUIZ_QUESTION_LIMIT, questionIds.size()))
                .collect(Collectors.toCollection(ArrayList::new));

        Iterable<UUID> iterableSelectedIds = new ArrayList<>(selectedIds);

        Map<UUID, QuizQuestion> questionMap = quizQuestionRepository.findAllById(iterableSelectedIds).stream()
                .collect(Collectors.toMap(QuizQuestion::getId, question -> question));

        List<QuizQuestion> questions = selectedIds.stream()
                .map(questionMap::get)
                .filter(Objects::nonNull)
                .toList();

        if (questions.isEmpty()) {
            throw new IllegalStateException("Unable to load quiz questions for this training.");
        }

        QuizSession quizSession = new QuizSession();
        quizSession.setTraining(training);
        quizSession.setUserId(userId);
        quizSession.setTotalQuestions(questions.size());
        quizSession.setScore(0);

        QuizSession savedSession = quizSessionRepository.save(quizSession);

        List<QuizQuestionDto> questionDtos = questions.stream()
                .map(this::toQuestionDto)
                .collect(Collectors.toList());

        return StartQuizResponse.builder()
                .quizSessionId(savedSession.getId())
                .questions(questionDtos)
                .build();
    }

    @Transactional
    public QuizResultResponse submitQuiz(QuizSubmitRequest request) {
        UUID quizSessionId = Objects.requireNonNull(request.quizSessionId(), "quizSessionId is required");
        UUID userId = Objects.requireNonNull(request.userId(), "userId is required");

        QuizSession session = quizSessionRepository.findById(quizSessionId)
                .orElseThrow(() -> new IllegalArgumentException("Quiz session not found"));

        if (!session.getUserId().equals(userId)) {
            throw new IllegalArgumentException("Quiz session does not belong to user.");
        }

        Set<UUID> questionIds = request.answers().stream()
                .map(QuizAnswerSubmission::questionId)
                .collect(Collectors.toSet());

        List<UUID> questionIdList = new ArrayList<>(questionIds);

        Map<UUID, QuizQuestion> questionMap = quizQuestionRepository
                .findAllById(questionIdList)
                .stream()
                .collect(Collectors.toMap(QuizQuestion::getId, question -> question));

        UUID trainingId = session.getTraining().getId();
        List<QuizAnswer> answersToPersist = new ArrayList<>();
        List<String> weakAreas = new ArrayList<>();
        List<QuestionResultDto> questionResults = new ArrayList<>();
        int correctCount = 0;

        for (QuizAnswerSubmission submission : request.answers()) {
            QuizQuestion question = questionMap.get(submission.questionId());
            if (question == null || !trainingId.equals(question.getTrainingId())) {
                continue;
            }

            String normalizedSelection = safeOption(submission.selectedOption());
            boolean isCorrect = question.getCorrectOption().equalsIgnoreCase(normalizedSelection);
            if (isCorrect) {
                correctCount++;
            } else {
                weakAreas.add(question.getQuestionText());
            }

            QuizAnswer quizAnswer = new QuizAnswer();
            quizAnswer.setQuizSession(session);
            quizAnswer.setQuestion(question);
            quizAnswer.setSelectedOption(normalizedSelection);
            quizAnswer.setCorrect(isCorrect);
            answersToPersist.add(quizAnswer);

            QuestionResultDto questionResult = QuestionResultDto.builder()
                    .questionId(question.getId())
                    .questionText(question.getQuestionText())
                    .selectedOption(normalizedSelection)
                    .correctOption(question.getCorrectOption())
                    .isCorrect(isCorrect)
                    .optionA(question.getOptionA())
                    .optionB(question.getOptionB())
                    .optionC(question.getOptionC())
                    .optionD(question.getOptionD())
                    .build();
            questionResults.add(questionResult);
        }

        quizAnswerRepository.saveAll(answersToPersist);

        session.setScore(correctCount);
        quizSessionRepository.save(session);

        int incorrectCount = session.getTotalQuestions() - correctCount;

        return QuizResultResponse.builder()
                .quizSessionId(session.getId())
                .totalScore(correctCount)
                .correctCount(correctCount)
                .incorrectCount(Math.max(incorrectCount, 0))
                .weakAreas(weakAreas.stream().distinct().toList())
                .questionResults(questionResults)
                .build();
    }

    private QuizQuestionDto toQuestionDto(QuizQuestion question) {
        return QuizQuestionDto.builder()
                .id(question.getId())
                .questionText(question.getQuestionText())
                .optionA(question.getOptionA())
                .optionB(question.getOptionB())
                .optionC(question.getOptionC())
                .optionD(question.getOptionD())
                .difficulty(question.getDifficulty())
                .build();
    }

    private String safeOption(String option) {
        if (option == null) {
            return "";
        }
        String trimmed = option.trim();
        if (trimmed.isEmpty()) {
            return "";
        }
        return trimmed.substring(0, 1).toUpperCase(Locale.ENGLISH);
    }
}

