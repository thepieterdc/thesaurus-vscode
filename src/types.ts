interface Data {
    synonyms: Synonym[];
}

interface RelatedWordsApiData {
    data: Data[];
}

interface SearchData {
    relatedWordsApiData: RelatedWordsApiData; 
}

export interface Synonym {
    similarity: number;
    term: string;
}

export interface ThesaurusResponse {
    searchData: SearchData;
}