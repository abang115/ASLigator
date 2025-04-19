import pandas as pd

def load_gloss(csv_file):
    glossary_df = pd.read_csv(csv_file)
    glossary = {row['asl'].strip().lower(): row['english'].strip() for index, row in glossary_df.iterrows()}
    return glossary

def gloss_to_english(word_list, glossary):
    translated_words = []
    for word in word_list:
        if word == "_":
            continue
        else:
            translation = glossary.get(word.lower(), word)
        translated_words.append(translation)
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
    final_string = " "
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
    return final_string.join(greeting + sub + verb + other + end_words)

def gloss(sentence):
    csv_file = 'dictionary.csv'
    glossary = load_gloss(csv_file)
    english_translation = gloss_to_english(sentence, glossary)
    english_with_aux = reformat(english_translation)
    reordered = reorder_sentence(english_with_aux)
    return reordered