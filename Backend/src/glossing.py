import pandas as pd
import os

def load_gloss(csv_file):
    glossary_df = pd.read_csv(csv_file)
    return {row['asl'].strip().lower(): row['english'].strip() for index, row in glossary_df.iterrows()}

def gloss_to_english(word_list, glossary):
    translated_words = []
    for word in word_list:
        if word == "_":
            continue
        translated_words.append(glossary.get(word.lower(), word))
    return translated_words

def reformat(words):
    new_words = []
    for i, word in enumerate(words):
        if i > 0 and word.lower() in {"hungry", "going"}:
            if new_words[-1].lower() == "i":
                new_words.append("am")
            elif new_words[-1].lower() == "you":
                new_words.append("are")
        new_words.append(word)
    return new_words

def reorder_sentence(words):
    greeting = []
    sub = []
    verb = []
    other = []
    end_words = []
    for word in words:
        low = word.lower()
        if low in ["hello", "hi"]:
            greeting.append(word)
        elif low == "i":
            sub.append(word)
        elif low in ["am", "is", "are"]:
            verb.append(word)
        elif low == "now":
            end_words.append(word)
        else:
            other.append(word)
    return greeting + sub + verb + other + end_words

def transform_question(words):
    pronouns = {"i", "you", "he", "she", "we", "they", "me", "us", "him", "her", "them"}
    if len(words) == 3 and words[-1].lower() in pronouns:
        pronoun = words[-1].capitalize()
        verb = words[0].lower()
        noun = words[1].lower()
        return ["Do", pronoun, verb, "a", noun + "?"]
    return None

def gloss(sentence):
    csv_file = os.path.join(os.getcwd(), '..', 'src', 'dictionary.csv')
    glossary = load_gloss(csv_file)
    english_translation = gloss_to_english(sentence, glossary)
    english_with_aux = reformat(english_translation)
    reordered = reorder_sentence(english_with_aux)
    question = transform_question(reordered)
    return question if question is not None else reordered

# def test_gloss():
#     result = gloss(["have", "car", "you"])
#     print("Test 'have pet you' =>", " ".join(result))

# if __name__ == '__main__':
#     test_gloss()
