declare class CreateChoiceDto {
    choice_text: string;
    is_correct: boolean;
}
export declare class CreateQuestionDto {
    question_text: string;
    subject_id: number;
    choices: CreateChoiceDto[];
    difficulty?: string;
    position_ids?: number[];
}
export {};
